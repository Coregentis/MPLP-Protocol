# Java SDK Design Specification

> **Status**: 📅 Planned for Phase P7

## 1. Introduction

The Java SDK (`mplp-java`) targets enterprise environments, ensuring MPLP can be adopted in large-scale, legacy-integrated systems.

## 2. Design Goals

*   **Enterprise Ready**: Integration with Spring, Jakarta EE, and standard logging/monitoring (SLF4J, Micrometer).
*   **Robustness**: Strict exception handling and comprehensive javadoc.
*   **Backward Compatibility**: Designed to be stable and maintainable over long lifecycles.

## 3. Core Components

### 3.1. POJOs

Java Beans compliant classes with Jackson annotations.

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Context {
    @JsonProperty("context_id")
    private String contextId;
    
    // Getters, Setters, Builders
}
```

### 3.2. Spring Boot Starter

A starter module that auto-configures the MPLP Runtime based on `application.properties`.

```properties
mplp.runtime.storage.type=postgres
mplp.runtime.llm.provider=openai
```

### 3.3. Persistence

JPA Entities for mapping Protocol Objects to relational tables, enabling complex querying and reporting.

## 4. Package Structure

*   `dev.mplp.core`: Core POJOs and Interfaces.
*   `dev.mplp.runtime`: Default runtime implementation.
*   `dev.mplp.spring`: Spring Boot integration.

## 5. Implementation Plan

1.  **POJO Generation**: Use `jsonschema2pojo` maven plugin.
2.  **Core Library**: Implement the logic in pure Java (no heavy frameworks).
3.  **Framework Integration**: Build the Spring Boot starter wrapper.
