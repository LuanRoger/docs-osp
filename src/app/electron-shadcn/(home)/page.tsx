import Link from "next/link";
import ElectronIcon from "@/components/icons/electron";
import ReactIcon from "@/components/icons/react";
import ViteIcon from "@/components/icons/vite";
import Prism from "@/components/prism";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { AppRoot } from "@/lib/constants/routes";
import { mountRoute } from "@/lib/utils/route";

export default function HomePage() {
  return (
    <div className="relative inset-shadow-sm flex-1 overflow-hidden rounded-2xl border border-border">
      <Reveal className="absolute inset-0 hidden translate-y-20 lg:block">
        <Prism
          animationType="rotate"
          baseWidth={10}
          colorFrequency={1}
          glow={0.3}
          height={8}
          hueShift={0}
          noise={0}
          scale={1}
          timeScale={0.2}
        />
      </Reveal>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col items-center gap-2">
          <ElectronIcon className="size-16 fill-[#47848F]" />
          <div className="flex gap-2">
            <ViteIcon className="size-16 fill-[#646CFF]" />
            <ReactIcon className="size-16 fill-[#61DAFB]" />
          </div>
        </div>
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
