# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Hugging Face mandatory port
ENV PORT=7860
EXPOSE 7860

# Force Spring Boot to use port 7860
ENTRYPOINT ["java","-jar","app.jar","--server.port=7860"]