import { source } from "@/lib/sources/electron-shadcn";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseLayoutProps } from "../layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout tree={source.pageTree} {...baseLayoutProps()}>
      {children}
    </DocsLayout>
  );
}
