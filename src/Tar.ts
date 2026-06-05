/**
 * GNU ustar tar implementation.
 *
 * @since 1.0.0
 */

import type * as PlatformError from "effect/PlatformError";
import type * as Schema from "effect/Schema";

import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as TarCommon from "./Header.ts";

/** @internal */
const padUint8Array = (arr: Uint8Array): Uint8Array => {
    if (arr.length % TarCommon.BLOCK_SIZE === 0) return arr;
    const newSize = (Math.floor(arr.length / TarCommon.BLOCK_SIZE) + 1) * TarCommon.BLOCK_SIZE;
    const newArray = new Uint8Array(newSize);
    newArray.set(arr, 0);
    return newArray;
};

/** @internal */
export const padStream = <E1, R1>(stream: Stream.Stream<Uint8Array, E1, R1>): Stream.Stream<Uint8Array, E1, R1> =>
    Function.pipe(
        stream,
        Stream.flatMap(Stream.fromIterable),
        Stream.grouped(TarCommon.BLOCK_SIZE),
        Stream.map((chunk) => Uint8Array.from(chunk)),
        Stream.map(padUint8Array)
    );

/** @internal */
const convertSingleEntry = <E1, R1>(
    entry: readonly [
        tarHeaderEntry: TarCommon.TarHeader,
        fileContents: string | Uint8Array | Stream.Stream<Uint8Array, E1, R1>,
    ]
): readonly [
    tarEntryHeader: Stream.Stream<Uint8Array, Schema.SchemaError, never>,
    tarEntryData: Stream.Stream<Uint8Array, Schema.SchemaError | E1, R1>,
] =>
    Tuple.make(
        Stream.fromEffect(entry[0].pack()),
        Function.pipe(
            Match.value(entry[1]),
            Match.when(Predicate.isUint8Array, (arr) => Stream.make(arr)),
            Match.when(Predicate.isString, (str) => Stream.make(str).pipe(Stream.encodeText)),
            Match.orElse(Function.identity<Stream.Stream<Uint8Array, E1, R1>>),
            padStream
        )
    );

/**
 * @since 1.0.0
 * @category Tar
 * @example
 *     ```ts
 *
 *     import * as assert from "node:assert"
 *
 *     import * as HashMap from "effect/HashMap";
 *     import * as Stream from "effect/Stream";
 *     import * as Effect from "effect/Effect";
 *     import * as Option from "effect/Option";
 *     import * as Tuple from "effect/Tuple";
 *
 *     import * as TarCommon from "eftar/Header";
 *     import * as Tar from "eftar/Tar";
 *     import * as Untar from "eftar/Untar";
 *
 *     const entries = HashMap.make(
 *         [
 *             TarCommon.TarHeader.make({
 *                 filename: "file1.txt",
 *                 fileSize: 8,
 *             }),
 *             "Hi, mom!",
 *         ],
 *         [
 *             TarCommon.TarHeader.make({
 *                 filename: "file2.txt",
 *                 fileSize: 22,
 *             }),
 *             "Hello from the Tarball",
 *         ],
 *         [
 *             TarCommon.TarHeader.make({
 *                 filename: "file3.bin",
 *                 fileSize: 4,
 *             }),
 *             new Uint8Array([0, 1, 2, 3]),
 *         ]
 *     );
 *
 *     const tarStream = Tar.tarball(entries);
 *     const files = await Untar.untar(tarStream).pipe(Effect.runPromise);
 *
 *     assert.equal(HashMap.size(entries), 3)
 *     const first = HashMap.findFirst(files, (_, header) => header.filename === "file1.txt");
 *     const second = HashMap.findFirst(files, (_, header) => header.filename === "file2.txt");
 *     const third = HashMap.findFirst(files, (_, header) => header.filename === "file3.bin");
 *
 *     assert.deepStrictEqual(
 *         first.pipe(Option.getOrThrow, Tuple.get(1),  Stream.mkUint8Array, Effect.runSync),
 *         new TextEncoder().encode("Hi, mom!")
 *     );
 *     assert.deepStrictEqual(
 *         second.pipe(Option.getOrThrow, Tuple.get(1), Stream.mkUint8Array, Effect.runSync),
 *         new TextEncoder().encode("Hello from the Tarball")
 *     );
 *     assert.deepStrictEqual(
 *         third.pipe(Option.getOrThrow, Tuple.get(1), Stream.mkUint8Array, Effect.runSync),
 *         new Uint8Array([0, 1, 2, 3])
 *     );
 *
 *     ```;
 */
export const tarball = <E1 = never, R1 = never>(
    entries: HashMap.HashMap<TarCommon.TarHeader, string | Uint8Array | Stream.Stream<Uint8Array, E1, R1>>
): Stream.Stream<Uint8Array, Schema.SchemaError | E1, R1> =>
    Function.pipe(
        entries,
        HashMap.toEntries,
        Array.reduce(Stream.empty as Stream.Stream<Uint8Array, Schema.SchemaError | E1, R1>, (acc, entry) => {
            const [headerStream, dataStream] = convertSingleEntry(entry);
            return acc.pipe(Stream.concat(headerStream), Stream.concat(dataStream));
        }),
        Stream.concat(Stream.repeat(Stream.succeed(TarCommon.emptyBlock), Schedule.recurs(20)))
    );

/**
 * @since 1.0.0
 * @category Tar
 */
export const tarballFromMemory = <E1 = never, R1 = never>(
    entries: HashMap.HashMap<
        string | Omit<Schema.Struct.MakeIn<(typeof TarCommon.TarHeader)["non-full"]["fields"]>, "fileSize">,
        string | Uint8Array | readonly [contentSize: number, stream: Stream.Stream<Uint8Array, E1, R1>]
    >
): Stream.Stream<Uint8Array, Schema.SchemaError | E1, R1> =>
    Function.pipe(
        entries,
        HashMap.toEntries,
        Array.map(([head, data]) => {
            const contents = Function.pipe(
                Match.value(data),
                Match.when(Predicate.isString, (str) => str),
                Match.when(Predicate.isUint8Array, (bytes) => bytes),
                Match.orElse(([_, stream]) => stream)
            );

            const contentLength = Function.pipe(
                Match.value(data),
                Match.when(Predicate.isString, (str) => str.length),
                Match.when(Predicate.isUint8Array, (bytes) => bytes.length),
                Match.orElse(([size, _]) => size)
            );

            const header = Predicate.isString(head)
                ? TarCommon.TarHeader.make({
                      filename: head,
                      fileSize: contentLength,
                  })
                : TarCommon.TarHeader.make({
                      ...head,
                      fileSize: contentLength,
                  });

            return Tuple.make(header, contents);
        }),
        HashMap.fromIterable,
        tarball
    );

/** @internal */
const tarEntryFromFilesystem = (
    filename: string,
    base: string
): Effect.Effect<
    readonly [header: TarCommon.TarHeader, contents: Stream.Stream<Uint8Array, PlatformError.PlatformError, never>],
    PlatformError.PlatformError,
    Path.Path | FileSystem.FileSystem
> =>
    Effect.gen(function* () {
        const path = yield* Path.Path;
        const filesystem = yield* FileSystem.FileSystem;
        const fullPath = path.join(base, filename);
        const contents = filesystem.stream(fullPath);
        const stat = yield* filesystem.stat(fullPath);
        const header = TarCommon.TarHeader.make({
            filename,
            uid: stat.uid,
            gid: stat.gid,
            fileSize: Number(stat.size),
            fileMode: parseInt((stat.mode & 0o777).toString(8), 10),
            ...Option.map(stat.mtime, (t) => ({ mtime: t })).pipe(Option.getOrElse(() => ({}))),
        });
        return Tuple.make(header, contents);
    });

/**
 * @since 1.0.0
 * @category Tar
 */
export const tarballFromFilesystem = (
    base: string,
    entries: Array<string>
): Stream.Stream<Uint8Array, PlatformError.PlatformError | Schema.SchemaError, Path.Path | FileSystem.FileSystem> =>
    Function.pipe(
        entries,
        Array.map((file) => tarEntryFromFilesystem(file, base)),
        (files) => Effect.all(files, { concurrency: "unbounded" }),
        Effect.map(HashMap.fromIterable),
        Effect.map(tarball),
        Stream.unwrap
    );
