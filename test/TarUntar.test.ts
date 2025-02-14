import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, HashMap, Sink, Stream, Tuple } from "effect";

import { Tar, Untar } from "eftar";

it.live("should tar and untar a tarball", () =>
    Effect.gen(function* () {
        const path = yield* Path.Path;
        const fileSystem = yield* FileSystem.FileSystem;
        const base = yield* path.fromFileUrl(new URL("fixtures", import.meta.url));
        const contentLocation = path.join(base, "content.txt");

        const contentString = yield* fileSystem.readFileString(contentLocation);
        const contentStream = fileSystem.stream(contentLocation);
        const contentSize = contentString.length;
        const contentTuple = Tuple.make(contentSize, contentStream);

        const tarball1 = Tar.tarballFromMemory(HashMap.make(["content.txt", contentString]));
        const tarball2 = Tar.tarballFromMemory(HashMap.make(["content.txt", contentTuple]));
        const tarball3 = Tar.tarballFromFilesystem(base, ["content.txt"] as const);

        const entries1 = yield* Untar.Untar(tarball1).pipe(Effect.map(HashMap.toEntries));
        const entries2 = yield* Untar.Untar(tarball2).pipe(Effect.map(HashMap.toEntries));
        const entries3 = yield* Untar.Untar(tarball3).pipe(Effect.map(HashMap.toEntries));

        const headerMatcher = expect.objectContaining({
            type: 0,
            deviceMajorNumber: "",
            deviceMinorNumber: "",
            fileSize: contentSize,
            filename: "content.txt",
        });

        expect(entries1).toHaveLength(1);
        expect(entries2).toHaveLength(1);
        expect(entries3).toHaveLength(1);

        const [header1, content1] = entries1[0]!;
        const [header2, content2] = entries2[0]!;
        const [header3, content3] = entries3[0]!;

        expect(header1).toStrictEqual(headerMatcher);
        expect(header2).toStrictEqual(headerMatcher);
        expect(header3).toStrictEqual(headerMatcher);

        const string1 = yield* content1.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string2 = yield* content2.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string3 = yield* content3.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));

        expect(string1).toHaveLength(contentSize);
        expect(string2).toHaveLength(contentSize);
        expect(string3).toHaveLength(contentSize);

        expect(string1).toStrictEqual(contentString);
        expect(string2).toStrictEqual(contentString);
        expect(string3).toStrictEqual(contentString);
    }).pipe(Effect.provide(NodeContext.layer))
);
