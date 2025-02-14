import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, HashMap, Sink, Stream, Tuple } from "effect";

import { Tar, Untar } from "eftar";

it.live("should untar a tarball", () =>
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

        expect(entries1).toHaveLength(1);
        expect(entries2).toHaveLength(1);
        expect(entries3).toHaveLength(1);

        const [header1, content1] = entries1[0]!;
        const [header2, content2] = entries2[0]!;
        const [header3, content3] = entries3[0]!;

        expect(header1.filename).toBe("content.txt");
        expect(header2.filename).toBe("content.txt");
        expect(header3.filename).toBe("content.txt");

        const string1 = yield* content1.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string2 = yield* content2.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string3 = yield* content3.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));

        expect(string1).toMatchSnapshot();
        expect(string2).toMatchSnapshot();
        expect(string3).toMatchSnapshot();
    }).pipe(Effect.provide(NodeContext.layer))
);
