---
title: Header.ts
nav_order: 1
parent: Modules
---

## Header.ts overview

Shared GNU ustar tar header details.

Since v1.0.0

---

## Exports Grouped by Category

- [Schemas](#schemas)
  - [TarHeader (class)](#tarheader-class)
    - [pack (property)](#pack-property)

---

# Schemas

## TarHeader (class)

**Signature**

```ts
declare class TarHeader
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Header.ts#L77)

Since v1.0.0

### pack (property)

**Signature**

```ts
pack: () => Effect.Effect<Uint8Array, ParseResult.ParseError, never>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Header.ts#L246)

Since v1.0.0
