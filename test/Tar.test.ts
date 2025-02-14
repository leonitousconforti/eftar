import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Array, Chunk, Effect, HashMap, Stream, Tuple } from "effect";

import { Tar } from "eftar";

it.live("should tar a tarball", () =>
    Effect.gen(function* () {
        const path = yield* Path.Path;
        const fileSystem = yield* FileSystem.FileSystem;
        const base = yield* path.fromFileUrl(new URL("fixtures", import.meta.url));
        const contentLocation = path.join(base, "content.txt");

        const contentString = yield* fileSystem.readFileString(contentLocation);
        const contentStream = fileSystem.stream(contentLocation);
        const contentSize = contentString.length;
        const contentTuple = Tuple.make(contentSize, contentStream);

        const tarball1 = yield* Tar.tarballFromMemory(HashMap.make(["content.txt", contentString]))
            .pipe(Stream.runCollect)
            .pipe(Effect.map(Chunk.toReadonlyArray))
            .pipe(Effect.map(Array.reduce([] as Array<number>, (acc, chunk) => [...acc, ...chunk])))
            .pipe(Effect.map((data) => Uint8Array.from(data)));
        const tarball2 = yield* Tar.tarballFromMemory(HashMap.make(["content.txt", contentTuple]))
            .pipe(Stream.runCollect)
            .pipe(Effect.map(Chunk.toReadonlyArray))
            .pipe(Effect.map(Array.reduce([] as Array<number>, (acc, chunk) => [...acc, ...chunk])))
            .pipe(Effect.map((data) => Uint8Array.from(data)));
        const tarball3 = yield* Tar.tarballFromFilesystem(base, ["content.txt"] as const)
            .pipe(Stream.runCollect)
            .pipe(Effect.map(Chunk.toReadonlyArray))
            .pipe(Effect.map(Array.reduce([] as Array<number>, (acc, chunk) => [...acc, ...chunk])))
            .pipe(Effect.map((data) => Uint8Array.from(data)));

        expect(tarball1).toMatchSnapshot();
        expect(tarball2).toMatchSnapshot();
        expect(tarball3).toMatchSnapshot();
        expect(tarball1).toStrictEqual(tarball2);
    }).pipe(Effect.provide(NodeContext.layer))
);
