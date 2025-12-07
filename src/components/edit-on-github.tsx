import Link from "next/link";
import type { AppRoot } from "@/lib/constants/routes";
import GitHubIcon from "./icons/github";
import { Button } from "./ui/button";

type EditOnGitHubProps = {
  path: string;
  app: AppRoot;
};

export default function EditOnGitHub({ path, app }: EditOnGitHubProps) {
  return (
    <Button asChild variant="secondary">
      <Link
        href={`https://github.com/LuanRoger/docs/blob/main/content${app}/docs/${path}`}
        target="_blank"
      >
        <GitHubIcon className="fill-foreground" />
        Edit on GitHub
      </Link>
    </Button>
  );
}
