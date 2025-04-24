---
title: Common.ts
nav_order: 1
parent: Modules
---

## Common.ts overview

Shared GNU ustar tar details.

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

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Common.ts#L76)

Since v1.0.0

### pack (property)

**Signature**

```ts
pack: () => Effect.Effect<Uint8Array, ParseResult.ParseError, never>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Common.ts#L244)

Since v1.0.0
