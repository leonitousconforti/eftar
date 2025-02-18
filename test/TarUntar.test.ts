import * as os from "node:os";

import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Chunk, Effect, HashMap, Option, Sink, Stream, Tuple } from "effect";

import { Tar, Untar } from "eftar";

it.live("should tar and untar a tarball", () =>
    Effect.gen(function* () {
        const path = yield* Path.Path;
        const fileSystem = yield* FileSystem.FileSystem;

        const base = yield* path.fromFileUrl(new URL("fixtures", import.meta.url));
        const contentLocation = path.join(base, "content.txt");
        const stat = yield* fileSystem.stat(contentLocation);

        const contentString = yield* fileSystem.readFileString(contentLocation);
        const contentStream = fileSystem.stream(contentLocation);
        const contentSize = contentString.length;
        const contentTuple = Tuple.make(contentSize, contentStream);

        const uid = os.userInfo().uid;
        const gid = os.userInfo().gid;
        const user = os.userInfo().username;
        const group = os.userInfo().username;
        console.log({ uid, gid, user, group });

        // Make three different tarballs
        // 1. From filesystem
        // 2. From memory (string)
        // 3. From memory (tuple)
        const makeTarball1 = () => Tar.tarballFromFilesystem(base, ["./content.txt"] as const);
        const makeTarball2 = () => Tar.tarballFromMemory(HashMap.make(["./content.txt", contentTuple]));
        const makeTarball3 = () =>
            Tar.tarballFromMemory(
                HashMap.make([
                    {
                        gid: Option.some(uid),
                        uid: Option.some(gid),
                        owner: Option.some(user),
                        group: Option.some(group),
                        filename: "./content.txt",
                        mtime: stat.mtime.pipe(Option.getOrThrow),
                        fileMode: parseInt((stat.mode & 0o777).toString(8), 10),
                    },
                    contentString,
                ])
            );

        const entries1 = yield* Untar.Untar(makeTarball1()).pipe(Effect.map(HashMap.toEntries));
        const entries2 = yield* Untar.Untar(makeTarball2()).pipe(Effect.map(HashMap.toEntries));
        const entries3 = yield* Untar.Untar(makeTarball3()).pipe(Effect.map(HashMap.toEntries));

        const headerMatcher = expect.objectContaining({
            type: 0,
            gid: Option.none(),
            uid: Option.none(),
            owner: Option.none(),
            group: Option.none(),
            fileSize: contentSize,
            fileMode: 644,
            filename: "./content.txt",
            linkName: Option.none(),
            filenamePrefix: Option.none(),
            deviceMajorNumber: Option.none(),
            deviceMinorNumber: Option.none(),
        });

        // Smoke test for tar entries
        expect(entries1).toHaveLength(1);
        expect(entries2).toHaveLength(1);
        expect(entries3).toHaveLength(1);

        // Smoke test for entry header
        const [header1, content1] = entries1[0]!;
        const [header2, content2] = entries2[0]!;
        const [header3, content3] = entries3[0]!;
        expect(header2).toStrictEqual(headerMatcher);
        expect({ ...header1, owner: Option.some(user), group: Option.some(group) }).toStrictEqual(header3);

        // Smoke test for entry content
        const string1 = yield* content1.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string2 = yield* content2.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        const string3 = yield* content3.pipe(Stream.decodeText()).pipe(Stream.run(Sink.mkString));
        expect(string1).toHaveLength(contentSize);
        expect(string2).toHaveLength(contentSize);
        expect(string3).toHaveLength(contentSize);

        // Content checks
        expect(string1).toStrictEqual(contentString);
        expect(string2).toStrictEqual(contentString);
        expect(string3).toStrictEqual(contentString);

        // Compare with fixture
        const gnuTarball = path.join(base, "BeeMovieScript.tar");
        const gnuTarballData = yield* fileSystem.readFile(gnuTarball);

        // Helper to concat chunks of a tarball into a single buffer
        const concatChunks: (self: Chunk.Chunk<Uint8Array>) => Buffer = Chunk.reduce<Buffer, Uint8Array>(
            Buffer.alloc(0),
            (accumulator, current) => Buffer.concat([accumulator, current])
        );

        // Compare tarballs
        const buffer3 = yield* makeTarball3().pipe(Stream.run(Sink.collectAll())).pipe(Effect.map(concatChunks));
        expect(Buffer.compare(gnuTarballData, buffer3)).toBe(0);
    }).pipe(Effect.provide(NodeContext.layer))
);
