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
  HashMap.HashMap<TarCommon.TarHeader, Stream.Stream<Uint8Array, never, never>>,
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
container their header blocks and data streams. We will collect them all into
a map, where the key is the Tar header block and the value is the data
stream. If we encounter two of the exact same header blocks in our stream,
then we will just take the second one.

**Signature**

```ts
export declare const collectorSink: Sink.Sink<
  HashMap.HashMap<TarCommon.TarHeader, Stream.Stream<Uint8Array, never, never>>,
  FolderState,
  never,
  never,
  never
>
```

Added in v1.0.0
