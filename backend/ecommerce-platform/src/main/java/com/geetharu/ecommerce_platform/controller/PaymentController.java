package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import com.geetharu.ecommerce_platform.service.OrderService;

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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, Object> payload) {
        Stripe.apiKey = stripeApiKey;

        try {
            // 1. Extract the cart items and promo code from the wrapper payload
            List<Map<String, Object>> cart = (List<Map<String, Object>>) payload.get("items");
            String promoCode = (String) payload.get("promoCode");

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);

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

            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:5173/success")
                    .setCancelUrl("http://localhost:5173/cart")
                    .addAllLineItem(lineItems)
                    .putMetadata("cart_details", metadataCart.toString());

            if (currentUser != null) {
                paramsBuilder.putMetadata("user_id", String.valueOf(currentUser.getId()));
            }

            // 2. THE DISCOUNT LOGIC: Apply Stripe Coupon if Promo Code exists
            if (promoCode != null && !promoCode.trim().isEmpty()) {
                paramsBuilder.addDiscount(
                        SessionCreateParams.Discount.builder()
                                .setCoupon(promoCode.trim().toUpperCase())
                                .build()
                );
            }

            Session session = Session.create(paramsBuilder.build());

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

            StripeObject stripeObject = event.getDataObjectDeserializer().deserializeUnsafe();

            if (stripeObject != null) {
                Session session = (Session) stripeObject;

                if (session.getMetadata() != null) {
                    String cartDetails = session.getMetadata().get("cart_details");
                    String userIdStr = session.getMetadata().get("user_id");
                    String stripeSessionId = session.getId();

                    if (userIdStr != null && cartDetails != null && !cartDetails.isEmpty()) {
                        Long userId = Long.parseLong(userIdStr);
                        Double totalAmount = session.getAmountTotal() / 100.0;

                        try {
                            orderService.processStripePayment(userId, stripeSessionId, totalAmount, cartDetails);
                        } catch (Exception e) {
                            System.err.println("❌ Critical Database Error during checkout: " + e.getMessage());
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database Error");
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok("Received");
    }
}