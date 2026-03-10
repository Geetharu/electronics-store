# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copy the current directory (which is now ecommerce-platform) into the container
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
# Copy the built jar from the target folder
COPY --from=build /app/target/*.jar demo.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","demo.jar"]