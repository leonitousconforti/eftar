import { Effect, HashMap, Option, Stream, Tuple, FileSystem, Path } from "effect";
import { ChildProcess } from "effect/unstable/process";

import * as os from "node:os";

import { NodeServices } from "@effect/platform-node";
import { beforeAll, expect, it } from "@effect/vitest";
import { Tar, Untar } from "eftar";

beforeAll(() =>
    Effect.gen(function* () {
        const path = yield* Path.Path;

        const fixtures = yield* path.fromFileUrl(new URL("fixtures", import.meta.url));
        const command = yield* ChildProcess.make(
            "tar",
            [
                "--create",
                "--no-xattrs",
                "--no-selinux",
                "--owner=user_that_does_not_exist",
                "--group=group_that_does_not_exist",
                "--file=BeeMovieScript.tar",
                "./content.txt",
            ],
            {
                cwd: fixtures,
            }
        );

        const exitCode = yield* command.exitCode;
        if (exitCode !== 0) return yield* Effect.die(`Command failed with exit code ${exitCode}`);
    }).pipe(Effect.provide(NodeServices.layer), Effect.scoped, Effect.runPromise)
);

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
        const user = "user_that_does_not_exist";
        const group = "group_that_does_not_exist";

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
                        uid: Option.some(uid),
                        gid: Option.some(gid),
                        owner: Option.some(user),
                        group: Option.some(group),
                        filename: "./content.txt",
                        mtime: stat.mtime.pipe(Option.getOrThrow),
                        fileMode: parseInt((stat.mode & 0o777).toString(8), 10),
                    },
                    contentString,
                ])
            );

        const entries1 = yield* Untar.untar(makeTarball1());
        const entries2 = yield* Untar.untar(makeTarball2());
        const entries3 = yield* Untar.untar(makeTarball3());

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
        expect(HashMap.size(entries1)).toBe(1);
        expect(HashMap.size(entries2)).toBe(1);
        expect(HashMap.size(entries3)).toBe(1);

        // Smoke test for entry header
        const [header1, content1] = Option.getOrThrow(
            HashMap.findFirst(entries1, (_, { filename }) => filename === "./content.txt")
        );
        const [header2, content2] = Option.getOrThrow(
            HashMap.findFirst(entries2, (_, { filename }) => filename === "./content.txt")
        );
        const [header3, content3] = Option.getOrThrow(
            HashMap.findFirst(entries3, (_, { filename }) => filename === "./content.txt")
        );
        expect(header2).toStrictEqual(headerMatcher);
        expect({ ...header1, owner: Option.some(user), group: Option.some(group) }).toStrictEqual(header3);

        // Smoke test for entry content
        const string1 = yield* content1.pipe(Stream.decodeText(), Stream.mkString);
        const string2 = yield* content2.pipe(Stream.decodeText(), Stream.mkString);
        const string3 = yield* content3.pipe(Stream.decodeText(), Stream.mkString);
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

        // Compare tarballs
        const buffer3 = yield* makeTarball3().pipe(Stream.mkUint8Array);
        expect(Buffer.compare(gnuTarballData, buffer3)).toBe(0);
    }).pipe(Effect.provide(NodeServices.layer))
);
