/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: This is to animate the border of the card */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is to animate the border of the card */
"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/styles";

export default function AnimatedBorderCard({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-background bg-border/50",
        className
      )}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();

        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-20",
          "[--color:var(--color-primary)]"
        )}
        style={{
          background: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, var(--color), transparent 80%)`,
        }}
      />
      <div
        {...props}
        className={cn(
          "relative select-none rounded-xl bg-background p-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
