---
title: Common.ts
nav_order: 1
parent: Modules
---

## Common overview

Shared GNU ustar tar details.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Schemas](#schemas)
  - [TarHeader (class)](#tarheader-class)
    - [pack (property)](#pack-property)

---

# Schemas

## TarHeader (class)

**Signature**

```ts
export declare class TarHeader
```

Added in v1.0.0

### pack (property)

**Signature**

```ts
pack: () => Effect.Effect<Uint8Array, ParseResult.ParseError, never>
```

Added in v1.0.0
