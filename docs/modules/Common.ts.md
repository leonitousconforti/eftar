---
title: Common.ts
nav_order: 1
parent: Modules
---

## Common overview

Shared GNU ustar tar details.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Schemas](#schemas)
  - [HeaderVariants](#headervariants)
  - [Octal (class)](#octal-class)
  - [TarHeader (class)](#tarheader-class)
    - [pack (property)](#pack-property)
  - [maxDigits](#maxdigits)

---

# Schemas

## HeaderVariants

**Signature**

```ts
export declare const HeaderVariants: {
  readonly Struct: <A>(fields: A & VariantSchema.Struct.Validate<A, "non-full" | "full">) => VariantSchema.Struct<A>
  readonly Field: <A>(
    config: A & { readonly [K in Exclude<keyof A, "non-full" | "full">]: never }
  ) => VariantSchema.Field<A>
  readonly FieldOnly: <Keys>(
    ...keys: Keys
  ) => <S extends Schema.Schema.All | Schema.PropertySignature.All>(
    schema: S
  ) => VariantSchema.Field<{ readonly [K in Keys[number]]: S }>
  readonly FieldExcept: <Keys>(
    ...keys: Keys
  ) => <S extends Schema.Schema.All | Schema.PropertySignature.All>(
    schema: S
  ) => VariantSchema.Field<{ readonly [K in Exclude<"non-full" | "full", Keys[number]>]: S }>
  readonly fieldEvolve: {
    <Self, Mapping>(
      f: Mapping
    ): (
      self: Self
    ) => VariantSchema.Field<
      Self extends VariantSchema.Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends (arg: any) => any
                ? ReturnType<Mapping[K]>
                : S[K]
              : S[K]
          }
        : {
            readonly [K in "non-full" | "full"]: K extends keyof Mapping
              ? Mapping[K] extends (arg: any) => any
                ? ReturnType<Mapping[K]>
                : Self
              : Self
          }
    >
    <Self, Mapping_1>(
      self: Self,
      f: Mapping_1
    ): VariantSchema.Field<
      Self extends VariantSchema.Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping_1
              ? Mapping_1[K] extends (arg: any) => any
                ? ReturnType<Mapping_1[K]>
                : S[K]
              : S[K]
          }
        : {
            readonly [K in "non-full" | "full"]: K extends keyof Mapping_1
              ? Mapping_1[K] extends (arg: any) => any
                ? ReturnType<Mapping_1[K]>
                : Self
              : Self
          }
    >
  }
  readonly fieldFromKey: {
    <Self, Mapping_2>(
      mapping: Mapping_2
    ): (
      self: Self
    ) => VariantSchema.Field<
      Self extends VariantSchema.Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping_2
              ? Mapping_2[K] extends string
                ? VariantSchema.fromKey.Rename<S[K], Mapping_2[K]>
                : S[K]
              : S[K]
          }
        : {
            readonly [K in "non-full" | "full"]: K extends keyof Mapping_2
              ? Mapping_2[K] extends string
                ? VariantSchema.fromKey.Rename<Self, Mapping_2[K]>
                : Self
              : Self
          }
    >
    <Self, Mapping_3>(
      self: Self,
      mapping: Mapping_3
    ): VariantSchema.Field<
      Self extends VariantSchema.Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping_3
              ? Mapping_3[K] extends string
                ? VariantSchema.fromKey.Rename<S[K], Mapping_3[K]>
                : S[K]
              : S[K]
          }
        : {
            readonly [K in "non-full" | "full"]: K extends keyof Mapping_3
              ? Mapping_3[K] extends string
                ? VariantSchema.fromKey.Rename<Self, Mapping_3[K]>
                : Self
              : Self
          }
    >
  }
  readonly Class: <Self>(
    identifier: string
  ) => <const Fields extends VariantSchema.Struct.Fields>(
    fields: Fields & VariantSchema.Struct.Validate<Fields, "non-full" | "full">,
    annotations?: Schema.Annotations.Schema<Self>
  ) => [Self] extends [never]
    ? "Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`"
    : VariantSchema.Class<
        Self,
        Fields,
        {
          [K in keyof VariantSchema.ExtractFields<"non-full", Fields, true>]: VariantSchema.ExtractFields<
            "non-full",
            Fields,
            true
          >[K]
        },
        Schema.Struct.Type<{
          [K in keyof VariantSchema.ExtractFields<"non-full", Fields, true>]: VariantSchema.ExtractFields<
            "non-full",
            Fields,
            true
          >[K]
        }>,
        Schema.Struct.Encoded<{
          [K in keyof VariantSchema.ExtractFields<"non-full", Fields, true>]: VariantSchema.ExtractFields<
            "non-full",
            Fields,
            true
          >[K]
        }>,
        Schema.Schema.Context<
          {
            [K in keyof VariantSchema.ExtractFields<"non-full", Fields, true>]: VariantSchema.ExtractFields<
              "non-full",
              Fields,
              true
            >[K]
          }[keyof VariantSchema.ExtractFields<"non-full", Fields, true>]
        >,
        Schema.Struct.Constructor<{
          [K in keyof VariantSchema.ExtractFields<"non-full", Fields, true>]: VariantSchema.ExtractFields<
            "non-full",
            Fields,
            true
          >[K]
        }>
      > & { readonly [V in "non-full" | "full"]: VariantSchema.Extract<V, VariantSchema.Struct<Fields>> }
  readonly Union: <Members>(
    ...members: Members
  ) => VariantSchema.Union<Members> & VariantSchema.Union.Variants<Members, "non-full" | "full">
  readonly extract: {
    <V>(
      variant: V
    ): <A extends VariantSchema.Struct<any>>(
      self: A
    ) => VariantSchema.Extract<V, A, V extends "non-full" ? true : false>
    <V, A>(self: A, variant: V): VariantSchema.Extract<V, A, V extends "non-full" ? true : false>
  }
}
```

Added in v1.0.0

## Octal (class)

**Signature**

```ts
export declare class Octal
```

Added in v1.0.0

## TarHeader (class)

**Signature**

```ts
export declare class TarHeader
```

Added in v1.0.0

### pack (property)

**Signature**

```ts
pack: () => Effect.Effect<Uint8Array, ParseResult.ParseError, never>
```

Added in v1.0.0

## maxDigits

**Signature**

```ts
export declare const maxDigits: <A extends number>(
  maxDigits: number,
  annotations?: Schema.Annotations.Filter<A>
) => <I, R>(self: Schema.Schema<A, I, R>) => Schema.filter<Schema.Schema<A, I, R>>
```

Added in v1.0.0
