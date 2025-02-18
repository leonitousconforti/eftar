---
title: Untar.ts
nav_order: 4
parent: Modules
---

## Untar overview

GNU ustar untar implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Untar](#untar)
  - [Untar](#untar-1)
  - [aggregateBlocksByHeadersSink](#aggregateblocksbyheaderssink)
  - [collectorSink](#collectorsink)

---

# Untar

## Untar

Takes a Tar stream and unpacks it into a map of Tar headers and their data
streams.

**Signature**

```ts
export declare const Untar: <E1, R1>(
  stream: Stream.Stream<Uint8Array, E1, R1>
) => Effect.Effect<
  HashMap.HashMap<
    Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
    Stream.Stream<Uint8Array, never, never>
  >,
  E1 | ParseResult.ParseError,
  Exclude<R1, Scope.Scope>
>
```

Added in v1.0.0

## aggregateBlocksByHeadersSink

This sink will read blocks from the stream and will combine the data blocks
for this header block into a single stream. This sink will stop once it has
read all the data block for this header block or once it see the endOfArchive
flag.

**Signature**

```ts
export declare const aggregateBlocksByHeadersSink: Sink.Sink<
  FolderState,
  Uint8Array,
  Uint8Array,
  ParseResult.ParseError,
  never
>
```

Added in v1.0.0

## collectorSink

When the stream is done, we will have a bunch of FolderState objects which
contain their header blocks and data chunks. We will collect them all into a
map, where the key is the Tar header block and the value is the data chunks.
If we encounter two of the exact same header blocks in our stream (not sure
how this would happen for a correctly formatted tarball, but I guess its not
impossible eo encounter), then we will just take the second entry.

**Signature**

```ts
export declare const collectorSink: Sink.Sink<
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
      readonly type: TarCommon.FileTypes
      readonly deviceMajorNumber: Option<string>
      readonly deviceMinorNumber: Option<string>
    },
    Stream.Stream<Uint8Array, never, never>
  >,
  FolderState,
  never,
  never,
  never
>
```

Added in v1.0.0
