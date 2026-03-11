package com.geetharu.ecommerce_platform.controller;

// ⚠️ Make sure these match your project!
import com.geetharu.ecommerce_platform.entity.Product; // Or .entity.Product
import com.geetharu.ecommerce_platform.repository.ProductRepository;

import com.stripe.Stripe;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody List<Map<String, Object>> cart) {
        Stripe.apiKey = stripeApiKey;

        try {
            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
            StringBuilder metadataCart = new StringBuilder();

            for (Map<String, Object> item : cart) {
                String name = (String) item.get("name");
                Number priceNum = (Number) item.get("price");
                long unitAmount = Math.round(priceNum.doubleValue() * 100);
                Number quantityNum = (Number) item.get("cartQuantity");
                long quantity = quantityNum.longValue();

                Number productIdNum = (Number) item.get("id");
                long productId = productIdNum.longValue();

                metadataCart.append(productId).append(":").append(quantity).append(",");

                lineItems.add(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(quantity)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(unitAmount)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(name)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );
            }

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:5173/success")
                    .setCancelUrl("http://localhost:5173/cart")
                    .addAllLineItem(lineItems)
                    .putMetadata("cart_details", metadataCart.toString())
                    .build();

            Session session = Session.create(params);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", session.getUrl());

            return ResponseEntity.ok(responseData);

        } catch (StripeException e) {
            Map<String, String> errorData = new HashMap<>();
            errorData.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorData);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws EventDataObjectDeserializationException {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            System.out.println("⚠️ Webhook Signature Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook Error");
        }

        if ("checkout.session.completed".equals(event.getType())) {

            // 🚀 THE FIX: Use deserializeUnsafe() to force Java to read the newer Stripe package!
            StripeObject stripeObject = event.getDataObjectDeserializer().deserializeUnsafe();

            if (stripeObject != null) {
                Session session = (Session) stripeObject;

                if (session.getMetadata() != null) {
                    String cartDetails = session.getMetadata().get("cart_details");

                    if (cartDetails != null && !cartDetails.isEmpty()) {
                        String[] items = cartDetails.split(",");

                        for (String item : items) {
                            if (item.isEmpty()) continue;

                            String[] parts = item.split(":");
                            Long productId = Long.parseLong(parts[0]);
                            int quantityBought = Integer.parseInt(parts[1]);

                            Optional<Product> optionalProduct = productRepository.findById(productId);
                            if (optionalProduct.isPresent()) {
                                Product product = optionalProduct.get();
                                int newStock = product.getStockQuantity() - quantityBought;
                                product.setStockQuantity(Math.max(0, newStock));
                                productRepository.save(product);
                                System.out.println("✅ SUCCESS: Deducted " + quantityBought + " from Product ID: " + productId);
                            }
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok("Received");
    }
}