FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN for attempt in 1 2 3 4; do mvn -B -U package && exit 0; [ "$attempt" -eq 4 ] || sleep 20; done; exit 1

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=render"]
