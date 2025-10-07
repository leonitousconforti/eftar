---
title: Untar.ts
nav_order: 4
parent: Modules
---

## Untar.ts overview

GNU ustar untar implementation.

Since v1.0.0

---

## Exports Grouped by Category

- [Untar](#untar)
  - [MissingEntries (class)](#missingentries-class)
    - [missingEntries (property)](#missingentries-property)
  - [aggregateBlocksByHeadersSink](#aggregateblocksbyheaderssink)
  - [collectorSink](#collectorsink)
  - [extractEntries](#extractentries)
  - [untar](#untar-1)

---

# Untar

## MissingEntries (class)

Error thrown when some expected entries are missing from the tarball.

**Signature**

```ts
declare class MissingEntries
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L184)

Since v1.0.0

### missingEntries (property)

**Signature**

```ts
readonly missingEntries: HashSet.HashSet<string>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L189)

## aggregateBlocksByHeadersSink

This sink will read blocks from the stream and will combine the data blocks
for this header block into a single stream. This sink will stop once it has
read all the data block for this header block or once it see the endOfArchive
flag.

**Signature**

```ts
declare const aggregateBlocksByHeadersSink: Sink.Sink<
  FolderState,
  Uint8Array<ArrayBufferLike>,
  Uint8Array<ArrayBufferLike>,
  ParseResult.ParseError,
  never
>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L58)

Since v1.0.0

## collectorSink

When the stream is done, we will have a bunch of FolderState objects which
contain their header blocks and data chunks. We will collect them all into a
map, where the key is the Tar header block and the value is the data chunks.
If we encounter two of the exact same header blocks in our stream (not sure
how this would happen for a correctly formatted tarball, but I guess its not
impossible eo encounter), then we will just take the second entry.

**Signature**

```ts
declare const collectorSink: Sink.Sink<
  HashMap.HashMap<
    {
      readonly fileSize: number
      readonly filename: string
      readonly linkName: Option<string>
      readonly filenamePrefix: Option<string>
      readonly fileMode: number
      readonly mtime: Date
      readonly uid: Option<number>
      readonly gid: Option<number>
      readonly owner: Option<string>
      readonly group: Option<string>
      readonly type: 0 | 2 | 1 | 3 | 4 | 5 | 6 | 7
      readonly deviceMajorNumber: Option<string>
      readonly deviceMinorNumber: Option<string>
    },
    Stream.Stream<Uint8Array<ArrayBufferLike>, never, never>
  >,
  FolderState,
  never,
  never,
  never
>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L130)

Since v1.0.0

## extractEntries

Takes a Tar stream and unpacks only specific entries into a map of Tar
headers and their data streams.

**Signature**

```ts
declare const extractEntries: <E1, R1>(
  stream: Stream.Stream<Uint8Array, E1, R1>,
  entries: HashSet.HashSet<string>
) => Effect.Effect<
  HashMap.HashMap<
    Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
    Stream.Stream<Uint8Array, never, never>
  >,
  E1 | ParseResult.ParseError | MissingEntries,
  Exclude<R1, Scope.Scope>
>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L202)

Since v1.0.0

## untar

Takes a Tar stream and unpacks it into a map of Tar headers and their data
streams.

**Signature**

```ts
declare const untar: <E1, R1>(
  stream: Stream.Stream<Uint8Array, E1, R1>,
  filter?: ((header: Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>) => boolean) | undefined
) => Effect.Effect<
  HashMap.HashMap<
    Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
    Stream.Stream<Uint8Array, never, never>
  >,
  E1 | ParseResult.ParseError,
  Exclude<R1, Scope.Scope>
>
```

[Source](https://github.com/leonitousconforti/eftar/tree/main/src/Untar.ts#L154)

Since v1.0.0
