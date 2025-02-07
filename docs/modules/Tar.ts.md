---
title: Tar.ts
nav_order: 3
parent: Modules
---

## Tar overview

GNU ustar tar implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Tar](#tar)
  - [tarball](#tarball)
  - [tarballFromFilesystem](#tarballfromfilesystem)
  - [tarballFromMemory](#tarballfrommemory)

---

# Tar

## tarball

**Signature**

```ts
export declare const tarball: <E1 = never, R1 = never>(
  entries: HashMap.HashMap<TarCommon.TarHeader, string | Uint8Array | Stream.Stream<Uint8Array, E1, R1>>
) => Stream.Stream<Uint8Array, ParseResult.ParseError | E1, R1>
```

Added in v1.0.0

## tarballFromFilesystem

**Signature**

```ts
export declare const tarballFromFilesystem: (
  base: string,
  entries: Array<string>
) => Stream.Stream<Uint8Array, PlatformError.PlatformError | ParseResult.ParseError, Path.Path | FileSystem.FileSystem>
```

Added in v1.0.0

## tarballFromMemory

**Signature**

```ts
export declare const tarballFromMemory: <E1 = never, R1 = never>(
  entries: HashMap.HashMap<
    string,
    string | Uint8Array | readonly [contentSize: number, stream: Stream.Stream<Uint8Array, E1, R1>]
  >
) => Stream.Stream<Uint8Array, ParseResult.ParseError | E1, R1>
```

Added in v1.0.0
