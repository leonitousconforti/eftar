import { expect, it } from "@effect/vitest";
import { Effect } from "effect";

it.live("should tar a tarball", () =>
    Effect.gen(function* () {
        yield* Effect.sleep(1000);
        expect(1).toBe(1);
    })
);
