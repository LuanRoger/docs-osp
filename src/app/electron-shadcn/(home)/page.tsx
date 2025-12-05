import {
  FlaskConicalIcon,
  HammerIcon,
  LanguagesIcon,
  PaletteIcon,
  RefreshCwIcon,
  ShieldIcon,
} from "lucide-react";
import FeatureCards from "@/components/feature-cards";
import ElectronIcon from "@/components/icons/electron";
import ReactIcon from "@/components/icons/react";
import ViteIcon from "@/components/icons/vite";
import Link from "@/components/link";
import Prism from "@/components/prism";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { AppRoot } from "@/lib/constants/routes";
import { mountRoute } from "@/lib/utils/route";

export default function HomePage() {
  const features = [
    {
      title: "Type-safe",
      description: (
        <>
          Built with{" "}
          <Link href="https://typescriptlang.org">TypeScript 5.9</Link>,{" "}
          <Link href="https://orpc.dev">oRPC</Link>, and{" "}
          <Link href="https://zod.dev">Zod 4</Link> for end-to-end type-safe IPC
          communication between main and renderer processes.
        </>
      ),
      icon: <ShieldIcon />,
    },
    {
      title: "Good tools and defaults",
      description: (
        <>
          <Link href="https://vite.dev">Vite 7</Link>,{" "}
          <Link href="https://electronforge.io">Electron Forge</Link>,{" "}
          <Link href="https://prettier.io">Prettier</Link>,{" "}
          <Link href="https://eslint.org">ESLint 9</Link>, and React Compiler
          enabled. All configured and ready to go.
        </>
      ),
      icon: <HammerIcon />,
    },
    {
      title: "Multi-language support",
      description: (
        <>
          Easily add new languages to your app with built-in{" "}
          <Link href="https://i18next.com">i18next</Link> support and organized
          translation files.
        </>
      ),
      icon: <LanguagesIcon />,
    },
    {
      title: "Testing Ready",
      description: (
        <>
          Comprehensive testing with{" "}
          <Link href="https://vitest.dev">Vitest</Link>,{" "}
          <Link href="https://playwright.dev">Playwright</Link>, and React
          Testing Library.
        </>
      ),
      icon: <FlaskConicalIcon />,
    },
    {
      title: "Beautiful UI",
      description: (
        <>
          <Link href="https://react.dev">React 19</Link>,{" "}
          <Link href="https://tailwindcss.com">Tailwind 4</Link>, and{" "}
          <Link href="https://ui.shadcn.com">shadcn/ui</Link> with Geist font
          for stunning interfaces.
        </>
      ),
      icon: <PaletteIcon />,
    },
    {
      title: "Auto Updates",
      description: (
        <>
          Built-in auto update support using GitHub Releases. Keep your users on
          the latest version.
        </>
      ),
      icon: <RefreshCwIcon />,
    },
  ];

  return (
    <div className="relative inset-shadow-sm flex-1 overflow-hidden rounded-2xl border border-border p-4">
      <div className="flex flex-col items-center justify-center gap-5">
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
            <Link
              href={mountRoute(AppRoot.ELECTRON_SHADCN, "/docs")}
              showUnderline={false}
            >
              Documentation
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link
              href="https://github.com/LuanRoger/electron-shadcn"
              showUnderline={false}
            >
              Repository
            </Link>
          </Button>
        </div>
        <FeatureCards features={features} />
      </div>
      <Reveal className="-z-10 absolute inset-0 hidden lg:block">
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
    </div>
  );
}
