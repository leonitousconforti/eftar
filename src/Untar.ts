/**
 * GNU ustar untar implementation.
 *
 * @since 1.0.0
 */

import type * as ParseResult from "effect/ParseResult";
import type * as Schema from "effect/Schema";
import type * as Scope from "effect/Scope";

import * as Chunk from "effect/Chunk";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as TarCommon from "./Header.js";

/**
 * Data structure to keep track of the state while reading a tar stream.
 *
 * @internal
 */
export type FolderState = {
    /** The number of bytes read so far. */
    readonly bytesRead: number;

    /** Whether the current header block was filtered out. */
    readonly filtered: boolean;

    /**
     * If the end of the tar stream (denoted with an empty block) has been
     * encountered before reading a header block, then we are done reading the
     * tar ball and shouldn't aggregate in the sink anymore. This is a different
     * ending than just reading the empty blocks until the end of the effect
     * stream.
     */
    readonly endOfArchiveFlag: boolean;

    /** The data for the entry currently being read. */
    readonly chunks: Chunk.Chunk<Uint8Array>;

    /** The header fot the entry currently being read. */
    readonly headerBlock: Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]> | undefined;
};

/**
 * This sink will read blocks from the stream and will combine the data blocks
 * for this header block into a single stream. This sink will stop once it has
 * read all the data block for this header block or once it see the endOfArchive
 * flag.
 *
 * @since 1.0.0
 * @category Untar
 */
export const aggregateBlocksByHeadersSink: (
    filter: (header: Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>) => boolean
) => Sink.Sink<FolderState, Uint8Array, Uint8Array, ParseResult.ParseError, never> = (filter) =>
    Sink.foldWeightedEffect({
        maxCost: Number(false),
        initial: {
            bytesRead: 0,
            filtered: false as boolean,
            chunks: Chunk.empty<Uint8Array>(),
            endOfArchiveFlag: false as boolean,
            headerBlock: undefined as Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]> | undefined,
        },
        cost: (state, _input) => {
            const case1 = state.filtered;
            const case2 = state.endOfArchiveFlag;
            const case3 = state.bytesRead >= (state.headerBlock?.fileSize ?? TarCommon.BLOCK_SIZE);
            return Effect.succeed(Number(case1) + Number(case2) + Number(case3));
        },
        body: (state, input) =>
            Effect.gen(function* () {
                /**
                 * If the header has not been parsed yet and we come across an
                 * empty block, then this must be the end of the archive
                 */
                if (Predicate.isUndefined(state.headerBlock) && TarCommon.isEmptyBlock(input)) {
                    return { ...state, endOfArchiveFlag: true };
                }

                /**
                 * If the header has not been parsed yet and we did not come
                 * across an empty block, then we must parse the header and set
                 * how many data blocks we are expecting
                 */
                if (Predicate.isUndefined(state.headerBlock)) {
                    const headerBlock = yield* TarCommon.TarHeader.unpack(input);
                    if (!filter(headerBlock)) return { ...state, filtered: true };
                    else return { ...state, headerBlock };
                }

                /**
                 * If we will read more than the content length, which can
                 * happen because the blocks must be padded to 512 bytes, then
                 * we should slice the data from this block to remove the
                 * padding.
                 */
                const trimmedInput =
                    state.bytesRead + input.length > state.headerBlock.fileSize
                        ? input.slice(0, state.headerBlock.fileSize - state.bytesRead)
                        : input;

                /**
                 * If we have already parsed the header, then keep appending
                 * data blocks
                 */
                return {
                    ...state,
                    bytesRead: state.bytesRead + input.length,
                    chunks: Chunk.append(state.chunks, trimmedInput),
                };
            }),
    });

/**
 * When the stream is done, we will have a bunch of FolderState objects which
 * contain their header blocks and data chunks. We will collect them all into a
 * map, where the key is the Tar header block and the value is the data chunks.
 * If we encounter two of the exact same header blocks in our stream (not sure
 * how this would happen for a correctly formatted tarball, but I guess its not
 * impossible eo encounter), then we will just take the second entry.
 *
 * @since 1.0.0
 * @category Untar
 */
export const collectorSink: Sink.Sink<
    HashMap.HashMap<
        Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
        Stream.Stream<Uint8Array, never, never>
    >,
    FolderState,
    never,
    never,
    never
> = Sink.map(
    Sink.collectAllToMap<FolderState, Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>>(
        (input) => input.headerBlock!,
        (_a, b) => b
    ),
    HashMap.map(({ chunks }) => Stream.fromChunk(chunks))
);

/**
 * Takes a Tar stream and unpacks it into a map of Tar headers and their data
 * streams.
 *
 * @since 1.0.0
 * @category Untar
 */
export const untar = <E1, R1>(
    stream: Stream.Stream<Uint8Array, E1, R1>,
    filter:
        | ((header: Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>) => boolean)
        | undefined = Function.constTrue
): Effect.Effect<
    HashMap.HashMap<
        Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
        Stream.Stream<Uint8Array, never, never>
    >,
    E1 | ParseResult.ParseError,
    Exclude<R1, Scope.Scope>
> =>
    Function.pipe(
        stream,
        Stream.mapConcat(Function.identity),
        Stream.grouped(TarCommon.BLOCK_SIZE),
        Stream.mapChunks((chunks) => Chunk.map(chunks, (chunk) => Uint8Array.from(chunk))),
        Stream.aggregateWithin(aggregateBlocksByHeadersSink(filter), Schedule.fixed(Duration.infinity)),
        Stream.takeWhile(({ endOfArchiveFlag }) => endOfArchiveFlag === false),
        Stream.filter(({ filtered }) => !filtered),
        Stream.run(collectorSink)
    );

/**
 * Error thrown when some expected entries are missing from the tarball.
 *
 * @since 1.0.0
 * @category Untar
 */
export class MissingEntries extends Data.TaggedError("MissingEntries")<{
    message: string;
    actualEntries: HashSet.HashSet<string>;
    expectedEntries: HashSet.HashSet<string>;
}> {
    public readonly missingEntries: HashSet.HashSet<string> = HashSet.difference(
        this.expectedEntries,
        this.actualEntries
    );
}

/**
 * Takes a Tar stream and unpacks only specific entries into a map of Tar
 * headers and their data streams.
 *
 * @since 1.0.0
 * @category Untar
 */
export const extractEntries = <E1, R1>(
    stream: Stream.Stream<Uint8Array, E1, R1>,
    entries: HashSet.HashSet<string>
): Effect.Effect<
    HashMap.HashMap<
        Schema.Schema.Type<(typeof TarCommon.TarHeader)["non-full"]>,
        Stream.Stream<Uint8Array, never, never>
    >,
    E1 | ParseResult.ParseError | MissingEntries,
    Exclude<R1, Scope.Scope>
> =>
    Effect.tap(
        untar(stream, ({ filename }) => HashSet.has(entries, filename)),
        (result) => {
            const headers = HashMap.keySet(result);
            const keySet = HashSet.map(headers, (header) => header.filename);

            if (HashSet.isSubset(entries, keySet)) {
                return Effect.void;
            } else {
                return Effect.fail(
                    new MissingEntries({
                        actualEntries: keySet,
                        expectedEntries: entries,
                        message: "Some expected entries are missing in the tarball.",
                    })
                );
            }
        }
    );
