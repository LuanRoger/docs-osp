import { source } from "@/lib/sources/electron-shadcn";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(source, {
  language: "english",
});
