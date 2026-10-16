import { Effect, HashMap, Stream } from "effect";

import { expect, it } from "@effect/vitest";
import { Tar, Untar } from "eftar";

it.effect.each([
    { name: "BMP character", contents: "é", expected: new Uint8Array([0xc3, 0xa9]) },
    { name: "astral character", contents: "😀", expected: new Uint8Array([0xf0, 0x9f, 0x98, 0x80]) },
    {
        name: "UTF-8 content crossing a block boundary",
        contents: "é".repeat(257),
        expected: Uint8Array.from({ length: 514 }, (_, index) => (index % 2 === 0 ? 0xc3 : 0xa9)),
    },
])("should preserve $name from memory", ({ contents, expected }) =>
    Effect.gen(function* () {
        for (const head of ["content.txt", { filename: "content.txt" }]) {
            const entries = yield* Untar.untar(Tar.tarballFromMemory(HashMap.make([head, contents])));

            expect(HashMap.size(entries)).toBe(1);
            for (const [header, content] of HashMap.toEntries(entries)) {
                const bytes = yield* content.pipe(Stream.mkUint8Array);
                expect(bytes).toStrictEqual(expected);
                expect(header.fileSize).toBe(expected.length);
            }
        }
    })
);
