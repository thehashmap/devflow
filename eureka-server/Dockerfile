FROM eclipse-temurin:22-jre

WORKDIR /app

COPY target/eureka-server-*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]

EXPOSE 8761
