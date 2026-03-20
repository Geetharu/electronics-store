# Build stage - Using Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage - Using Java 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Hugging Face mandatory port
ENV PORT=7860
EXPOSE 7860

# Force Spring Boot to use port 7860
ENTRYPOINT ["java","-jar","app.jar","--server.port=7860"]