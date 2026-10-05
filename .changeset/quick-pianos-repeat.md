---
"eftar": patch
---

Strip `@internal` declarations from the published type definitions

`tsconfig.build.json` now sets `stripInternal`, so helpers such as `BLOCK_SIZE`, `emptyBlock` and `HeaderVariants` no longer appear in `dist/*.d.ts`. They were never part of the documented API and remain available at runtime.
