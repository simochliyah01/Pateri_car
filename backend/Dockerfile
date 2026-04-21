# ─── Stage 1: Build ─────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Cache dependencies layer separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# ─── Stage 2: Runtime ───────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Non-root user for security
RUN addgroup -S patericar && adduser -S patericar -G patericar

COPY --from=builder /build/target/*.jar app.jar

RUN mkdir -p /app/storage/uploads && chown -R patericar:patericar /app

USER patericar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
