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

**Example**

````ts

    import * as assert from "node:assert"

    import * as HashMap from "effect/HashMap";
    import * as Stream from "effect/Stream";
    import * as Effect from "effect/Effect";

    import * as TarCommon from "eftar/Header";
    import * as Tar from "eftar/Tar";
    import * as Untar from "eftar/Untar";

    const entries = HashMap.make(
        [
            TarCommon.TarHeader.make({
                filename: "file1.txt",
                fileSize: 8,
            }),
            "Hi, mom!",
        ],
        [
            TarCommon.TarHeader.make({
                filename: "file2.txt",
                fileSize: 22,
            }),
            "Hello from the Tarball",
        ],
        [
            TarCommon.TarHeader.make({
                filename: "file3.bin",
                fileSize: 4,
            }),
            new Uint8Array([0, 1, 2, 3]),
        ]
    );

    const tarStream = Tar.tarball(entries);
    const files = await Untar.untar(tarStream).pipe(Effect.runPromise);

    assert.equal(HashMap.size(entries), 3)
    const [first, second, third] = HashMap.toEntries(files);

    assert.deepStrictEqual(
        first[0],
        new TextEncoder().encode("Hi, mom!")
    );
    assert.deepStrictEqual(
        second[0],
        new TextEncoder().encode("Hello from the Tarball")
    );
    assert.deepStrictEqual(
        third[0],
        new Uint8Array([0, 1, 2, 3])
    );

    ```;

**Signature**

```ts
declare const tarball: <E1 = never, R1 = never>(entries: HashMap.HashMap<TarCommon.TarHeader, string | Uint8Array | Stream.Stream<Uint8Array, E1, R1>>) => Stream.Stream<Uint8Array, ParseResult.ParseError | E1, R1>
````

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L128)

Since v1.0.0

## tarballFromFilesystem

**Signature**

```ts
declare const tarballFromFilesystem: (
  base: string,
  entries: Array<string>
) => Stream.Stream<Uint8Array, PlatformError.PlatformError | ParseResult.ParseError, Path.Path | FileSystem.FileSystem>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L214)

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

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Tar.ts#L144)

Since v1.0.0
