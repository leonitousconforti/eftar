import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["./test/**/*.test.ts"],
        globals: true,
        coverage: { provider: "v8", include: ["src/**/*.ts"], reporter: ["cobertura"] },
        reporters: ["default", "hanging-process"],
    },
    resolve: {
        alias: {
            eftar: path.resolve(__dirname, "src"),
        },
    },
});
