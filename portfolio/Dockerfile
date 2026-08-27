# syntax=docker/dockerfile:1
#
# Multi-stage build for Google Cloud Run (or any container host).
#   build stage  -> compiles the fat jar with Maven
#   run stage    -> minimal JRE image that just runs the jar
#
# Cloud Run injects PORT (8080); application.properties maps server.port to it.

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

# tuned for a small single-CPU Cloud Run instance (e.g. 512Mi / 1 vCPU)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
