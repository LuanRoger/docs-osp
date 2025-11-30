"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import type React from "react";
import { useEffect, useRef } from "react";

type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: "rotate" | "hover" | "3drotate";
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
};

const Prism: React.FC<PrismProps> = ({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const config = createPrismConfig({
      height,
      baseWidth,
      glow,
      noise,
      offset,
      transparent,
      scale,
      hueShift,
      colorFrequency,
      bloom,
      timeScale,
      hoverStrength,
      inertia,
    });

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false,
    });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    } as Partial<CSSStyleDeclaration>);
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2  iResolution;
      uniform float iTime;

      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform float uGlow;
      uniform vec2  uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x){
        vec4 e2x = exp(2.0*x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p){
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

        float z = 5.0;
        float d = 0.0;

        vec3 p;
        vec4 o = vec4(0.0);

        float centerShift = uCenterShift;
        float cf = uColorFreq;

        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t + 0.0);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += centerShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);

        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);

        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

        if(abs(uHueShift) > 0.0001){
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `;

    const geometry = new Triangle(gl);
    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: iResBuf },
        iTime: { value: 0 },
        uHeight: { value: config.H },
        uBaseHalf: { value: config.BASE_HALF },
        uUseBaseWobble: { value: 1 },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: config.GLOW },
        uOffsetPx: { value: offsetPxBuf },
        uNoise: { value: config.NOISE },
        uSaturation: { value: config.SAT },
        uScale: { value: config.SCALE },
        uHueShift: { value: config.HUE },
        uColorFreq: { value: config.CFREQ },
        uBloom: { value: config.BLOOM },
        uCenterShift: { value: config.H * 0.25 },
        uInvBaseHalf: { value: 1 / config.BASE_HALF },
        uInvHeight: { value: 1 / config.H },
        uMinAxis: { value: Math.min(config.BASE_HALF, config.H) },
        uPxScale: {
          value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * config.SCALE),
        },
        uTimeScale: { value: config.TS },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = config.offX * dpr;
      offsetPxBuf[1] = config.offY * dpr;
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * config.SCALE);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const rotBuf = new Float32Array(9);
    const setMat3FromEuler = (
      yawY: number,
      pitchX: number,
      rollZ: number,
      out: Float32Array
    ) => {
      const cy = Math.cos(yawY),
        sy = Math.sin(yawY);
      const cx = Math.cos(pitchX),
        sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ),
        sz = Math.sin(rollZ);
      const r00 = cy * cz + sy * sx * sz;
      const r01 = -cy * sz + sy * sx * cz;
      const r02 = sy * cx;

      const r10 = cx * sz;
      const r11 = cx * cz;
      const r12 = -sx;

      const r20 = -sy * cz + cy * sx * sz;
      const r21 = sy * sz + cy * sx * cz;
      const r22 = cy * cx;

      out[0] = r00;
      out[1] = r10;
      out[2] = r20;
      out[3] = r01;
      out[4] = r11;
      out[5] = r21;
      out[6] = r02;
      out[7] = r12;
      out[8] = r22;
      return out;
    };

    const NOISE_IS_ZERO = config.NOISE < 1e-6;
    let raf = 0;
    const t0 = performance.now();
    const startRAF = () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(render);
    };
    const stopRAF = () => {
      if (!raf) {
        return;
      }
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * config.RSX;
    const wY = (0.2 + rnd() * 0.7) * config.RSY;
    const wZ = (0.1 + rnd() * 0.5) * config.RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    let yaw = 0,
      pitch = 0,
      roll = 0;
    let targetYaw = 0,
      targetPitch = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const pointer = { x: 0, y: 0, inside: true };
    const onMove = (e: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      const cx = ww * 0.5;
      const cy = wh * 0.5;
      const nx = (e.clientX - cx) / (ww * 0.5);
      const ny = (e.clientY - cy) / (wh * 0.5);
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    const onBlur = () => {
      pointer.inside = false;
    };

    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    if (animationType === "hover") {
      onPointerMove = (e: PointerEvent) => {
        onMove(e);
        startRAF();
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onBlur);
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === "3drotate") {
      program.uniforms.uUseBaseWobble.value = 0;
    } else {
      program.uniforms.uUseBaseWobble.value = 1;
    }

    const render = (t: number) => {
      const time = (t - t0) * 0.001;
      program.uniforms.iTime.value = time;

      const continueRAF = updateAnimation({
        animationType,
        time,
        pointer,
        config,
        yaw,
        pitch,
        roll,
        targetYaw,
        targetPitch,
        wX,
        wY,
        wZ,
        phX,
        phZ,
        lerp,
        setMat3FromEuler,
        rotBuf,
        program,
        NOISE_IS_ZERO,
        setRotation: (rotation: {
          yaw: number;
          pitch: number;
          roll: number;
          targetYaw: number;
          targetPitch: number;
        }) => {
          yaw = rotation.yaw;
          pitch = rotation.pitch;
          roll = rotation.roll;
          targetYaw = rotation.targetYaw;
          targetPitch = rotation.targetPitch;
        },
      });

      renderer.render({ scene: mesh });
      if (continueRAF) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    interface PrismContainer extends HTMLElement {
      __prismIO?: IntersectionObserver | null;
    }

    if (suspendWhenOffscreen) {
      const io = new IntersectionObserver((entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        if (vis) {
          startRAF();
        } else {
          stopRAF();
        }
      });
      io.observe(container);
      startRAF();
      (container as PrismContainer).__prismIO = io;
    } else {
      startRAF();
    }

    return () => {
      stopRAF();
      ro.disconnect();
      if (animationType === "hover") {
        if (onPointerMove) {
          window.removeEventListener(
            "pointermove",
            onPointerMove as EventListener
          );
        }
        window.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onBlur);
      }
      if (suspendWhenOffscreen) {
        const io = (container as PrismContainer).__prismIO;
        if (io) {
          io.disconnect();
        }
        (container as PrismContainer).__prismIO = null;
      }
      if (gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    height,
    baseWidth,
    animationType,
    glow,
    noise,
    offset,
    scale,
    transparent,
    hueShift,
    colorFrequency,
    timeScale,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
  ]);

  return <div className="relative h-full w-full" ref={containerRef} />;
};

type PrismConfigInput = {
  height: number;
  baseWidth: number;
  glow: number;
  noise: number;
  offset: { x?: number; y?: number };
  transparent: boolean;
  scale: number;
  hueShift: number;
  colorFrequency: number;
  bloom: number;
  timeScale: number;
  hoverStrength: number;
  inertia: number;
};

type PrismConfig = {
  H: number;
  BASE_HALF: number;
  GLOW: number;
  NOISE: number;
  offX: number;
  offY: number;
  SAT: number;
  SCALE: number;
  HUE: number;
  CFREQ: number;
  BLOOM: number;
  RSX: number;
  RSY: number;
  RSZ: number;
  TS: number;
  HOVSTR: number;
  INERT: number;
};

function createPrismConfig(input: PrismConfigInput): PrismConfig {
  const H = Math.max(0.001, input.height);
  const BW = Math.max(0.001, input.baseWidth);
  return {
    H,
    BASE_HALF: BW * 0.5,
    GLOW: Math.max(0.0, input.glow),
    NOISE: Math.max(0.0, input.noise),
    offX: input.offset?.x ?? 0,
    offY: input.offset?.y ?? 0,
    SAT: input.transparent ? 1.5 : 1,
    SCALE: Math.max(0.001, input.scale),
    HUE: input.hueShift || 0,
    CFREQ: Math.max(0.0, input.colorFrequency || 1),
    BLOOM: Math.max(0.0, input.bloom || 1),
    RSX: 1,
    RSY: 1,
    RSZ: 1,
    TS: Math.max(0, input.timeScale || 1),
    HOVSTR: Math.max(0, input.hoverStrength || 1),
    INERT: Math.max(0, Math.min(1, input.inertia || 0.12)),
  };
}

type UpdateAnimationParams = {
  animationType: "rotate" | "hover" | "3drotate";
  time: number;
  pointer: { x: number; y: number; inside: boolean };
  config: PrismConfig;
  yaw: number;
  pitch: number;
  roll: number;
  targetYaw: number;
  targetPitch: number;
  wX: number;
  wY: number;
  wZ: number;
  phX: number;
  phZ: number;
  lerp: (a: number, b: number, t: number) => number;
  setMat3FromEuler: (
    yawY: number,
    pitchX: number,
    rollZ: number,
    out: Float32Array
  ) => Float32Array;
  rotBuf: Float32Array;
  program: Program;
  NOISE_IS_ZERO: boolean;
  setRotation: (rotation: {
    yaw: number;
    pitch: number;
    roll: number;
    targetYaw: number;
    targetPitch: number;
  }) => void;
};

function updateAnimation(params: UpdateAnimationParams): boolean {
  const { animationType } = params;

  if (animationType === "hover") {
    return updateHoverAnimation(params);
  }
  if (animationType === "3drotate") {
    return update3DRotateAnimation(params);
  }
  return updateDefaultAnimation(params);
}

function updateHoverAnimation(params: UpdateAnimationParams): boolean {
  const {
    pointer,
    config,
    lerp,
    setMat3FromEuler,
    rotBuf,
    program,
    NOISE_IS_ZERO,
    setRotation,
  } = params;
  let { yaw, pitch, roll, targetYaw, targetPitch } = params;

  const maxPitch = 0.6 * config.HOVSTR;
  const maxYaw = 0.6 * config.HOVSTR;
  targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
  targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;
  const prevYaw = yaw;
  const prevPitch = pitch;
  const prevRoll = roll;
  yaw = lerp(prevYaw, targetYaw, config.INERT);
  pitch = lerp(prevPitch, targetPitch, config.INERT);
  roll = lerp(prevRoll, 0, 0.1);
  program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
  setRotation({ yaw, pitch, roll, targetYaw, targetPitch });

  if (NOISE_IS_ZERO) {
    const settled =
      Math.abs(yaw - targetYaw) < 1e-4 &&
      Math.abs(pitch - targetPitch) < 1e-4 &&
      Math.abs(roll) < 1e-4;
    if (settled) {
      return false;
    }
  }
  return true;
}

function update3DRotateAnimation(params: UpdateAnimationParams): boolean {
  const { time, config, setMat3FromEuler, rotBuf, program, setRotation } =
    params;
  const { targetYaw, targetPitch } = params;

  const tScaled = time * config.TS;
  const yaw = tScaled * params.wY;
  const pitch = Math.sin(tScaled * params.wX + params.phX) * 0.6;
  const roll = Math.sin(tScaled * params.wZ + params.phZ) * 0.5;
  program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
  setRotation({ yaw, pitch, roll, targetYaw, targetPitch });

  return config.TS >= 1e-6;
}

function updateDefaultAnimation(params: UpdateAnimationParams): boolean {
  const { config, rotBuf, program } = params;

  rotBuf[0] = 1;
  rotBuf[1] = 0;
  rotBuf[2] = 0;
  rotBuf[3] = 0;
  rotBuf[4] = 1;
  rotBuf[5] = 0;
  rotBuf[6] = 0;
  rotBuf[7] = 0;
  rotBuf[8] = 1;
  program.uniforms.uRot.value = rotBuf;

  return config.TS >= 1e-6;
}

export default Prism;
