---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Java SDK Design Specification


## 1. Introduction

The Java SDK (`mplp-java`) targets enterprise environments, ensuring MPLP can be adopted in large-scale, legacy-integrated systems.

## 2. Design Goals


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


## 5. Implementation Plan

1.  **POJO Generation**: Use `jsonschema2pojo` maven plugin.
2.  **Core Library**: Implement the logic in pure Java (no heavy frameworks).
3.  **Framework Integration**: Build the Spring Boot starter wrapper.
