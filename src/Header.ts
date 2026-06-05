/**
 * Shared GNU ustar tar header details.
 *
 * @since 1.0.0
 */

import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as SchemaGetter from "effect/SchemaGetter";
import * as VariantSchema from "effect/unstable/schema/VariantSchema";

/** @internal */
export const HeaderVariants = VariantSchema.make({
    defaultVariant: "non-full",
    variants: ["non-full", "full"],
});

/** @internal */
export const BLOCK_SIZE = 512;

/** @internal */
export const emptyBlock = new Uint8Array(BLOCK_SIZE).fill(0);

/** @internal */
export const isEmptyBlock = (block: Uint8Array): boolean =>
    block.length === BLOCK_SIZE && block.every((byte) => byte === 0);

/** @internal */
export const textDecoder = new TextDecoder("utf-8");

/** @internal */
export const textEncoder = new TextEncoder();

/**
 * @since 1.0.0
 * @category Schemas
 */
export const FileTypes = {
    file: 0,
    link: 1,
    symlink: 2,
    "character-device": 3,
    "block-device": 4,
    directory: 5,
    fifo: 6,
    "contiguous-file": 7,
} as const;

/** @internal */
export const Octal = Schema.Int.pipe(
    Schema.decode({
        decode: SchemaGetter.transform((n) => parseInt(n.toString(), 8)),
        encode: SchemaGetter.transform((n) => parseInt(n.toString(8))),
    })
);

/** @internal */
export const isMaxDigits = (maxDigits: number, annotations?: Schema.Annotations.Filter) =>
    Schema.makeFilter((n: number) => n.toString(10).length <= maxDigits, {
        description: `a number at most ${maxDigits} digits(s) long`,
        title: `maxDigits(${maxDigits})`,
        schemaId: "MaxDigits",
        ...annotations,
    });

/**
 * @since 1.0.0
 * @category Schemas
 */
export class TarHeader extends HeaderVariants.Class<TarHeader>("TarHeader")({
    fileSize: Octal.check(isMaxDigits(12)),
    filename: Schema.String.check(Schema.isMaxLength(100)),

    linkName: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(100)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),
    filenamePrefix: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(100)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /**
     * The underlying raw `st_mode` bits that contain the standard Unix
     * permissions for this file/directory.
     */
    fileMode: Function.pipe(
        Schema.Int,
        Schema.check(isMaxDigits(8)),
        Schema.withConstructorDefault(Effect.succeed(644))
    ),

    /**
     * Data modification time of the file at the time it was archived. It
     * represents the integer number of seconds since January 1, 1970,
     * 00:00-UTC.
     */
    mtime: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(12)),
        Schema.decodeTo(Schema.NumberFromString),
        Schema.decode({
            decode: SchemaGetter.transform((n) => parseInt(n.toString(), 8)),
            encode: SchemaGetter.transform((n) => parseInt(n.toString(8))),
        }),
        Schema.decode({
            decode: SchemaGetter.transform(Number.multiply(1000)),
            encode: SchemaGetter.transform(Number.divideUnsafe(1000)),
        }),
        Schema.decodeTo(Schema.Date, {
            decode: SchemaGetter.transform((n) => new Date(n)),
            encode: SchemaGetter.transform((date) => date.getTime()),
        }),
        Schema.withConstructorDefault(Effect.succeed(new Date()))
    ),

    /**
     * Numeric user ID of the file owner. This is ignored if the operating
     * system does not support numeric user IDs.
     */
    uid: Function.pipe(
        Octal,
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /**
     * Numeric group ID of the file owner. This is ignored if the operating
     * system does not support numeric group IDs.
     */
    gid: Function.pipe(
        Octal,
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /** The name of the file owner, can be at most 32 bytes long. */
    owner: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(32)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /** The group that the file owner belongs to, can be at most 32 bytes long. */
    group: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(32)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /** The type of file archived. */
    type: Function.pipe(Schema.Enum(FileTypes), Schema.withConstructorDefault(Effect.succeed(FileTypes.file))),

    /** Device major number. */
    deviceMajorNumber: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(8)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    /** Device minor number. */
    deviceMinorNumber: Function.pipe(
        Schema.String,
        Schema.check(Schema.isMaxLength(8)),
        Schema.OptionFromOptionalNullOr,
        Schema.withConstructorDefault(Effect.succeed(Option.none()))
    ),

    // These fields are not present in the non-full header variant.
    checksum: HeaderVariants.FieldOnly(["full"])(Schema.NumberFromString),
    padding: HeaderVariants.FieldOnly(["full"])(Schema.Literal("\0".repeat(12))),
    ustar: HeaderVariants.FieldOnly(["full"])(Schema.Literals(["ustar\x20\x20\x00", "ustar\x0000"])),
}) {
    /** @since 1.0.0 */
    public static unpack = (
        view: Uint8Array
    ): Effect.Effect<Schema.Schema.Type<(typeof TarHeader)["non-full"]>, Schema.SchemaError, never> => {
        const readString = (
            start: number,
            end: number,
            options?: { skipLeadingNulls?: true; skipTrailingNulls?: true } | undefined
        ): string | undefined => {
            let i: number = start;
            let j: number = end;
            if (options?.skipLeadingNulls) while (i < end && view[i] === 0) i++;
            if (options?.skipTrailingNulls) while (j > i && view[j - 1] === 0) j--;
            if (i !== j) return textDecoder.decode(view.subarray(i, j));
            else return undefined;
        };

        const readInteger = (start: number, end: number): number | undefined => {
            const options = { skipLeadingNulls: true, skipTrailingNulls: true } as const;
            const str = readString(start, end, options);
            if (str === undefined) return undefined;
            else return parseInt(str, 10);
        };

        const fullHeader = Schema.decodeUnknownEffect(TarHeader["full"])({
            filename: readString(0, 100, { skipTrailingNulls: true }),
            fileMode: readInteger(100, 108),
            uid: readInteger(108, 116),
            gid: readInteger(116, 124),
            fileSize: readInteger(124, 136),
            mtime: readString(136, 148, { skipTrailingNulls: true }),
            checksum: readString(148, 155, { skipTrailingNulls: true }),
            type: readInteger(156, 157),
            linkName: readString(157, 257, { skipTrailingNulls: true }),
            ustar: textDecoder.decode(view.subarray(257, 265)),
            owner: readString(265, 297, { skipTrailingNulls: true }),
            group: readString(297, 329, { skipTrailingNulls: true }),
            deviceMajorNumber: readString(329, 337, { skipTrailingNulls: true }),
            deviceMinorNumber: readString(337, 345, { skipTrailingNulls: true }),
            filenamePrefix: readString(345, 500, { skipTrailingNulls: true }),
            padding: textDecoder.decode(view.subarray(500, 512)),
        });

        return Effect.map(fullHeader, ({ checksum: _checksum, padding: _padding, ustar: _ustar, ...rest }) => rest);
    };

    /** @since 1.0.0 */
    public pack = (): Effect.Effect<Uint8Array, Schema.SchemaError, never> =>
        Effect.gen({ self: this }, function* () {
            const uint8Array = new Uint8Array(BLOCK_SIZE);
            const self = yield* Schema.encodeEffect(TarHeader)(this);

            const write = (value: string | number | undefined | null, start: number, end: number) => {
                if (value === undefined || value === null) return;
                const str = typeof value === "string" ? value : value.toString().padStart(end - start - 1, "0");
                const bytes = textEncoder.encode(str);
                uint8Array.set(bytes, start);
                if (bytes.length < end - start) uint8Array.fill(0, start + bytes.length, end);
            };

            write(self.filename, 0, 100);
            write(self.fileMode, 100, 108);
            write(self.uid, 108, 116);
            write(self.gid, 116, 124);
            write(self.fileSize, 124, 136);
            write(self.mtime, 136, 148);
            write("\x20\x20\x20\x20\x20\x20\x20\x20", 148, 156);
            write(self.type, 156, 157);
            write(self.linkName, 157, 257);
            write("ustar\x20\x20\x00", 257, 265);
            write(self.owner, 265, 297);
            write(self.group, 297, 329);
            write(self.deviceMajorNumber, 329, 337);
            write(self.deviceMinorNumber, 337, 345);
            write(self.filenamePrefix, 345, 476);

            const version = "\0 ";
            const checksum = uint8Array.reduce((acc, curr) => acc + curr, 0);
            write(checksum.toString(8).padStart(6, "0"), 148, 154);
            write(version, 154, 156);
            return uint8Array;
        });
}
