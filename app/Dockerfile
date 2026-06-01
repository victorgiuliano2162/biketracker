# Estágio 1: Compilação (Builder) - Mudança para a versão Alpine
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Copia apenas o necessário para baixar as dependências e criar camada de cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Baixa as dependências e limpa os arquivos temporários do Maven para economizar espaço
RUN ./mvnw dependency:go-offline && ./mvnw clean

# Copia o código fonte
COPY src ./src

# Compila o projeto gerando um jar otimizado e limpa o cache local do maven do estágio anterior
ENV MAVEN_OPTS="-Dfile.encoding=UTF-8"
RUN ./mvnw package -DskipTests && rm -rf ~/.m2/repository

# Estágio 2: Execução (Runner) - Imagem ultra limpa e segura
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria um usuário comum para não rodar a aplicação como root (Segurança)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia apenas o arquivo .jar final do estágio anterior
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

# Adicionados parâmetros extras de otimização de memória para contêineres Docker
ENTRYPOINT ["java", "-jar", "-Dfile.encoding=UTF-8", "-XX:+UseG1GC", "-XX:+ExitOnOutOfMemoryError", "app.jar"]