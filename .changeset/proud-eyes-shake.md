---
"eftar": patch
---

Reject non-finite numbers in the `TarHeader` `mtime` and `checksum` fields

Both fields previously decoded through `Schema.NumberFromString`, which accepts `NaN`,
`Infinity`, and `-Infinity`. They now use `Schema.FiniteFromString`, so a header whose
mtime or checksum string parses to a non-finite value fails to decode instead of
producing a nonsensical timestamp or checksum. Valid archives are unaffected.
