import Prism from "@/components/prism";
import { Button } from "@/components/ui/button";
import { AppRoot } from "@/lib/constants/routes";
import { mountRoute } from "@/lib/utils/route";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="rounded-2xl border border-border flex-1 relative inset-shadow-white">
      <div className="absolute inset-0 blur-sm">
        <Prism
          animationType="rotate"
          timeScale={0.2}
          height={8}
          baseWidth={8}
          scale={2}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={0.3}
        />
      </div>
      <div className="flex flex-col gap-2 items-center justify-center absolute inset-0">
        <h1 className="font-bold text-3xl">electron-shadcn</h1>
        <p className="font-medium text-lg">
          Electron Forge with shadcn-ui (Vite + Typescript){" "}
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="https://github.com/LuanRoger/electron-shadcn">
              Repository
            </Link>
          </Button>
          <Button asChild>
            <Link href={mountRoute(AppRoot.ELECTRON_SHADCN, "/docs")}>
              Documentation
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
