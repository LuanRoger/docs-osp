import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseLayoutProps } from "../layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout {...baseLayoutProps()}>
      <div className="p-4 size-full flex flex-col flex-1">{children}</div>
    </HomeLayout>
  );
}
