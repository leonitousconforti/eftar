import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["./test/**/*.test.ts"],
        setupFiles: ["./test/vitest.setup.ts"],
        coverage: { provider: "v8", include: ["src/**/*.ts"], reporter: ["cobertura", "text"] },
        reporters: ["default", "hanging-process", ["junit", { outputFile: "./coverage/junit.xml" }]],
    },
    resolve: {
        alias: {
            eftar: path.resolve(__dirname, "src"),
        },
    },
});
