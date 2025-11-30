# MPLP Java Basic Flow Example

> **Status**: 📅 **Planned for Phase P7**
>
> This project is a placeholder for the official Java implementation of the MPLP Single Agent Flow.

## ☕ Java SDK Design Preview

The MPLP Java SDK is designed for Enterprise integration, enabling MPLP agents to run within existing Spring Boot, Quarkus, or Jakarta EE environments.

### Key Features

1.  **POJO & Builder Pattern**
    *   Strongly-typed POJOs generated from JSON Schemas.
    *   Fluent Builder API for constructing complex nested objects like Plans and Traces.
    *   Jackson annotations for seamless JSON processing.

    ```java
    // Preview Syntax
    import dev.mplp.core.Context;
    
    Context ctx = Context.builder()
        .title("Enterprise Workflow")
        .root(ContextRoot.builder()
            .domain("finance")
            .environment("staging")
            .build())
        .build();
    ```

2.  **Enterprise Integration**
    *   Ready-to-use adapters for JMS (Java Message Service) and Kafka for the Event Bus.
    *   JPA (Java Persistence API) mappings for storing Protocol Objects in relational databases (Oracle, MySQL, PostgreSQL).

3.  **Maven Central Distribution**
    *   Standard artifact distribution via Maven Central.

### Planned Example: Loan Approval Agent

This example project will demonstrate a **Loan Approval Agent**:
1.  **Context**: A loan application ID.
2.  **Plan**: Steps to verify credit score, check employment history, and calculate risk.
3.  **Confirm**: Requires a human manager's approval (via the `Confirm` object) before finalizing.

## 🗺️ Roadmap

*   **Phase P7**: Release `mplp-java-core` (POJOs).
*   **Phase P8**: Release `mplp-java-runtime` (Spring Boot Starter).

## 🛠 Installation (Future)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-core</artifactId>
    <version>1.0.0</version>
</dependency>
```
