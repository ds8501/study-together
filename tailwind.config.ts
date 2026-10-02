import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#111319", muted: "#858895", line: "#e9eaf0", violet: "#7258e8", mint: "#57b999" } } }, plugins: [] } satisfies Config;
