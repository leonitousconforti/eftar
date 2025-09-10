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
  - [FileTypes](#filetypes)
  - [TarHeader (class)](#tarheader-class)
    - [pack (property)](#pack-property)

---

# Schemas

## FileTypes

**Signature**

```ts
declare const FileTypes: {
  readonly file: 0
  readonly link: 1
  readonly symlink: 2
  readonly "character-device": 3
  readonly "block-device": 4
  readonly directory: 5
  readonly fifo: 6
  readonly "contiguous-file": 7
}
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Header.ts#L42)

Since v1.0.0

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

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Header.ts#L240)

Since v1.0.0
