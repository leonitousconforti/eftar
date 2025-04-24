---
title: Tar.ts
nav_order: 3
parent: Modules
---

## Tar.ts overview

GNU ustar tar implementation.

Since v1.0.0

---

## Exports Grouped by Category

- [Tar](#tar)
  - [tarball](#tarball)
  - [tarballFromFilesystem](#tarballfromfilesystem)
  - [tarballFromMemory](#tarballfrommemory)

---

# Tar

## tarball

**Signature**

```ts
declare const tarball: <E1 = never, R1 = never>(
  entries: HashMap.HashMap<TarCommon.TarHeader, string | Uint8Array | Stream.Stream<Uint8Array, E1, R1>>
) => Stream.Stream<Uint8Array, ParseResult.ParseError | E1, R1>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L71)

Since v1.0.0

## tarballFromFilesystem

**Signature**

```ts
declare const tarballFromFilesystem: (
  base: string,
  entries: Array<string>
) => Stream.Stream<Uint8Array, PlatformError.PlatformError | ParseResult.ParseError, Path.Path | FileSystem.FileSystem>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L157)

Since v1.0.0

## tarballFromMemory

**Signature**

```ts
declare const tarballFromMemory: <E1 = never, R1 = never>(
  entries: HashMap.HashMap<
    string | Omit<Schema.Struct.Constructor<(typeof TarCommon.TarHeader)["non-full"]["fields"]>, "fileSize">,
    string | Uint8Array | readonly [contentSize: number, stream: Stream.Stream<Uint8Array, E1, R1>]
  >
) => Stream.Stream<Uint8Array, ParseResult.ParseError | E1, R1>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L87)

Since v1.0.0
