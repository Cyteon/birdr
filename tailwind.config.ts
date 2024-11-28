import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import catppuccin from "@catppuccin/tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [
    typography,
    catppuccin({
      prefix: "ctp",
      defaultFlavour: "macchiato",
    }),
  ],
} satisfies Config;
