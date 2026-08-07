---
"eftar": minor
---

Represent `TarHeader.mtime` as a `DateTime.Utc` instead of a `Date`

The field now decodes through `Schema.DateTimeUtcFromMillis`, and its constructor default is
`DateTime.now`, which reads the Effect Clock. The previous default was
`Effect.succeed(new Date())`, which captured a single timestamp when the module was first
imported, so every default-constructed header shared that value instead of the time it was
actually created.

The encoded (on-disk) representation is unchanged. Callers passing a `Date` into
`TarHeader.make` need `DateTime.fromDateUnsafe`, and callers reading `header.mtime` now get a
`DateTime.Utc`.
