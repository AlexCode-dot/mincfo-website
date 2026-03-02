"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import styles from "./HeroFluidTop.module.scss";

type HeroFluidTopProps = {
  height?: number | string;
  className?: string;
};

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (textureUnit: number) => number;
};

type DoubleFBO = {
  read: FBO;
  write: FBO;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  swap: () => void;
};

type ProgramInfo = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;
  aPosition: number;
};

type FlowConfig = {
  simResolution: number;
  dyeResolution: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressure: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  splatForce: number;
};

type PairPattern = "default" | "outline_frame" | "parallel_bands";

const DEFAULT_HEIGHT = 640;
const DPR_CAP = 2;
const DEBUG = false;

const debugLog = (...args: unknown[]) => {
  if (!DEBUG) return;
  console.info("[HeroFluidTop]", ...args);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const baseVertexShader = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const clearShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
  gl_FragColor = value * texture2D(uTexture, vUv);
}
`;

const displayShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
uniform vec2 texelSize;

void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  vec3 lc = texture2D(uTexture, vL).rgb;
  vec3 rc = texture2D(uTexture, vR).rgb;
  vec3 tc = texture2D(uTexture, vT).rgb;
  vec3 bc = texture2D(uTexture, vB).rgb;

  float dx = length(rc) - length(lc);
  float dy = length(tc) - length(bc);
  vec3 n = normalize(vec3(dx, dy, length(texelSize)));
  vec3 light = vec3(0.0, 0.0, 1.0);
  float diffuse = clamp(dot(n, light) + 0.72, 0.66, 1.0);
  c *= diffuse;

  float intensity = max(c.r, max(c.g, c.b));
  vec3 deep = vec3(0.02, 0.028, 0.08);
  vec3 color = mix(deep, c, 0.9);

  // Keep top region full strength and only fade near the very bottom to avoid visible horizontal seams.
  float downwardFade = pow(1.0 - smoothstep(0.78, 1.0, vUv.y), 1.08);
  float topFill = 1.0 - smoothstep(0.0, 0.54, vUv.y);
  float fluidAlpha = clamp(intensity * 1.12, 0.0, 1.0);
  float alphaFloor = mix(0.0, 0.5, topFill);
  float alpha = max(fluidAlpha, alphaFloor) * downwardFade;

  color = mix(color, vec3(0.08, 0.15, 0.42), topFill * 0.24);

  gl_FragColor = vec4(color, alpha);
}
`;

const splatShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`;

const advectionShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}
`;

const divergenceShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const curlShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

const vorticityShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const pressureShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const gradientSubtractShader = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const getUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  const uniforms: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i += 1) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const location = gl.getUniformLocation(program, info.name);
    if (location) uniforms[info.name] = location;
  }
  return uniforms;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
): ProgramInfo | null => {
  const createShader = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      debugLog("shader error", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    debugLog("link error", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return {
    program,
    uniforms: getUniforms(gl, program),
    aPosition: gl.getAttribLocation(program, "aPosition"),
  };
};

const bindAttribute = (gl: WebGL2RenderingContext, program: ProgramInfo) => {
  if (program.aPosition < 0) return;
  gl.enableVertexAttribArray(program.aPosition);
  gl.vertexAttribPointer(program.aPosition, 2, gl.FLOAT, false, 0, 0);
};

const createFBO = (
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): FBO => {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Failed to create texture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Failed to create framebuffer");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width,
    height,
    texelSizeX: 1 / width,
    texelSizeY: 1 / height,
    attach(textureUnit: number) {
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return textureUnit;
    },
  };
};

const createDoubleFBO = (
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): DoubleFBO => {
  let fbo1 = createFBO(gl, width, height, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, width, height, internalFormat, format, type, filter);

  return {
    get read() {
      return fbo1;
    },
    get write() {
      return fbo2;
    },
    width,
    height,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    swap() {
      const tmp = fbo1;
      fbo1 = fbo2;
      fbo2 = tmp;
    },
  };
};

const getResolution = (
  gl: WebGL2RenderingContext,
  resolution: number,
) => {
  let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspect);
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
    return { width: max, height: min };
  }
  return { width: min, height: max };
};

export default function HeroFluidTop({ height = DEFAULT_HEIGHT, className }: HeroFluidTopProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const colorBufferExt = gl.getExtension("EXT_color_buffer_float");
    if (!colorBufferExt) return;

    const config: FlowConfig = {
      simResolution: 128,
      dyeResolution: 896,
      densityDissipation: 0.28,
      velocityDissipation: 0.54,
      pressure: 0.8,
      pressureIterations: 18,
      curl: 24,
      splatRadius: 0.31,
      splatForce: 1380,
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const allowPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const programs = {
      splat: createProgram(gl, baseVertexShader, splatShader),
      curl: createProgram(gl, baseVertexShader, curlShader),
      vorticity: createProgram(gl, baseVertexShader, vorticityShader),
      divergence: createProgram(gl, baseVertexShader, divergenceShader),
      clear: createProgram(gl, baseVertexShader, clearShader),
      pressure: createProgram(gl, baseVertexShader, pressureShader),
      gradientSubtract: createProgram(gl, baseVertexShader, gradientSubtractShader),
      advection: createProgram(gl, baseVertexShader, advectionShader),
      display: createProgram(gl, baseVertexShader, displayShader),
    };

    if (Object.values(programs).some((program) => !program)) return;

    const quad = gl.createBuffer();
    if (!quad) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const blit = (target: FBO | null) => {
      if (!target) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const textureType = gl.HALF_FLOAT;
    const internalFormat = gl.RGBA16F;
    const format = gl.RGBA;

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    const initFramebuffers = () => {
      const simRes = getResolution(gl, config.simResolution);
      const dyeRes = getResolution(gl, config.dyeResolution);
      dye = createDoubleFBO(
        gl,
        dyeRes.width,
        dyeRes.height,
        internalFormat,
        format,
        textureType,
        gl.LINEAR,
      );
      velocity = createDoubleFBO(
        gl,
        simRes.width,
        simRes.height,
        internalFormat,
        format,
        textureType,
        gl.LINEAR,
      );
      divergence = createFBO(
        gl,
        simRes.width,
        simRes.height,
        internalFormat,
        format,
        textureType,
        gl.NEAREST,
      );
      curl = createFBO(
        gl,
        simRes.width,
        simRes.height,
        internalFormat,
        format,
        textureType,
        gl.NEAREST,
      );
      pressure = createDoubleFBO(
        gl,
        simRes.width,
        simRes.height,
        internalFormat,
        format,
        textureType,
        gl.NEAREST,
      );
    };

    const resizeCanvas = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const heightPx = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== heightPx) {
        canvas.width = width;
        canvas.height = heightPx;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        initFramebuffers();
      }
    };

    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
      const splatProgramInfo = programs.splat as ProgramInfo;
      gl.useProgram(splatProgramInfo.program);
      bindAttribute(gl, splatProgramInfo);

      gl.uniform1i(splatProgramInfo.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgramInfo.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgramInfo.uniforms.point, x / canvas.width, 1 - y / canvas.height);
      gl.uniform3f(
        splatProgramInfo.uniforms.color,
        dx * config.splatForce,
        -dy * config.splatForce,
        0,
      );
      gl.uniform1f(splatProgramInfo.uniforms.radius, config.splatRadius / 100);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(splatProgramInfo.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgramInfo.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    type AutoStroke = {
      preferredSide: "left" | "right";
      lane: "top" | "bottom";
      active: boolean;
      startTs: number;
      durationMs: number;
      mode: "bezier" | "orbit";
      startSide: "left" | "right";
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      ctrl1X: number;
      ctrl1Y: number;
      ctrl2X: number;
      ctrl2Y: number;
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
      angleStart: number;
      angleSpan: number;
      nextStartTs: number;
      lastEmitTs: number;
      emitIntervalMs: number;
      emitIntensity: number;
      lastX: number;
      lastY: number;
    };

    const createAutoStroke = (
      preferredSide: "left" | "right",
      lane: "top" | "bottom",
      seedDelay = 0,
    ): AutoStroke => ({
      preferredSide,
      lane,
      active: false,
      startTs: 0,
      durationMs: 0,
      mode: "bezier",
      startSide: "left",
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      ctrl1X: 0,
      ctrl1Y: 0,
      ctrl2X: 0,
      ctrl2Y: 0,
      centerX: 0,
      centerY: 0,
      radiusX: 0,
      radiusY: 0,
      angleStart: 0,
      angleSpan: 0,
      nextStartTs: performance.now() + seedDelay + Math.random() * 360,
      lastEmitTs: 0,
      emitIntervalMs: 34,
      emitIntensity: 0.92,
      lastX: 0,
      lastY: 0,
    });

    const pointer = { x: 0, y: 0 };
    const idleState = {
      // Start first idle pair shortly after load; avoid immediate spawn.
      lastUserTs: performance.now() - 780,
      nextPairStartTs: performance.now() + 220,
      pairWasActive: false,
      pairSwapSides: false,
      lastPairPattern: null as PairPattern | null,
      strokes: [
        createAutoStroke("left", "top", 0),
        createAutoStroke("right", "bottom", 0),
      ],
    };

    const choosePairPattern = (): PairPattern => {
      // Heavier bias toward outline_frame.
      const roll = Math.random();
      let pattern: PairPattern =
        roll < 0.68 ? "outline_frame" : roll < 0.84 ? "parallel_bands" : "default";

      // Prevent same pattern twice in a row.
      if (idleState.lastPairPattern && pattern === idleState.lastPairPattern) {
        if (idleState.lastPairPattern === "outline_frame") {
          pattern = Math.random() < 0.6 ? "parallel_bands" : "default";
        } else {
          pattern = "outline_frame";
        }
      }
      return pattern;
    };

    const emitPointerSplat = (
      x: number,
      y: number,
      color: [number, number, number],
      intensityScale = 1,
    ) => {
      const rawDx = ((x - pointer.x) / Math.max(canvas.width, 1)) * intensityScale;
      const rawDy = ((y - pointer.y) / Math.max(canvas.height, 1)) * intensityScale;
      const maxImpulse = 0.035;
      const impulseMagnitude = Math.hypot(rawDx, rawDy);
      const impulseScale = impulseMagnitude > maxImpulse ? maxImpulse / impulseMagnitude : 1;
      const dx = rawDx * impulseScale;
      const dy = rawDy * impulseScale;

      pointer.x = x;
      pointer.y = y;
      splat(x, y, dx, dy, color);
    };

    const emitAutoStrokeSplat = (
      stroke: AutoStroke,
      x: number,
      y: number,
      color: [number, number, number],
      intensityScale = 1,
    ) => {
      const rawDx = ((x - stroke.lastX) / Math.max(canvas.width, 1)) * intensityScale;
      const rawDy = ((y - stroke.lastY) / Math.max(canvas.height, 1)) * intensityScale;
      const maxImpulse = 0.028;
      const impulseMagnitude = Math.hypot(rawDx, rawDy);
      const impulseScale = impulseMagnitude > maxImpulse ? maxImpulse / impulseMagnitude : 1;
      const dx = rawDx * impulseScale;
      const dy = rawDy * impulseScale;
      stroke.lastX = x;
      stroke.lastY = y;
      splat(x, y, dx, dy, color);
    };

    const scheduleNextStroke = (stroke: AutoStroke, now: number) => {
      stroke.nextStartTs = now;
      stroke.active = false;
    };

    const startStroke = (
      stroke: AutoStroke,
      timestamp: number,
      durationMs: number,
      pairPattern: PairPattern,
    ) => {
      const minX = canvas.width * 0.06;
      const maxX = canvas.width * 0.94;
      const minY = canvas.height * 0.06;
      const maxY = canvas.height * 0.9;
      const laneMinY =
        stroke.lane === "top" ? canvas.height * 0.08 : canvas.height * 0.54;
      const laneMaxY =
        stroke.lane === "top" ? canvas.height * 0.46 : canvas.height * 0.9;

      const forcedStartSide = stroke.preferredSide;
      // Outside-only entry: keep idle drags as curved bezier strokes
      // that originate off-canvas and move into the hero.
      const useOrbit = false;
      let fromX = canvas.width * 0.5;
      let fromY = canvas.height * 0.3;
      let toX = fromX;
      let toY = fromY;

      const laneY = laneMinY + Math.random() * (laneMaxY - laneMinY);

      if (useOrbit) {
        stroke.mode = "orbit";
        const centerX = forcedStartSide === "left"
          ? canvas.width * (0.2 + Math.random() * 0.26)
          : canvas.width * (0.54 + Math.random() * 0.26);
        const centerY = laneY;
        const radiusX = canvas.width * (0.08 + Math.random() * 0.12);
        const radiusY = canvas.height * (0.06 + Math.random() * 0.12);
        const startAngle = forcedStartSide === "left"
          ? Math.PI * (0.15 + Math.random() * 0.7)
          : Math.PI * (1.15 + Math.random() * 0.7);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const span = (Math.PI * (1.2 + Math.random() * 1.9)) * direction;

        stroke.centerX = clamp(centerX, minX, maxX);
        stroke.centerY = clamp(centerY, minY, maxY);
        stroke.radiusX = radiusX;
        stroke.radiusY = radiusY;
        stroke.angleStart = startAngle;
        stroke.angleSpan = span;

        fromX = clamp(
          stroke.centerX + Math.cos(startAngle) * radiusX,
          minX,
          maxX,
        );
        fromY = clamp(
          stroke.centerY + Math.sin(startAngle) * radiusY,
          minY,
          maxY,
        );
        toX = fromX;
        toY = fromY;
      } else {
        stroke.mode = "bezier";
        const leftToRight = forcedStartSide === "left";
        const offscreenPad = canvas.width * (0.06 + Math.random() * 0.08);
        const startBandX = leftToRight
          ? -offscreenPad
          : canvas.width + offscreenPad;
        const endBandX = leftToRight
          ? canvas.width * (0.78 + Math.random() * 0.12)
          : canvas.width * (0.1 + Math.random() * 0.12);
        const baseY = laneY;
        const yDelta = canvas.height * ((Math.random() - 0.5) * 0.08);
        const useOutlineFrame = pairPattern === "outline_frame";
        const useParallelBands = pairPattern === "parallel_bands";

        stroke.emitIntensity = 0.92;
        stroke.emitIntervalMs = 32 + Math.random() * 18;

        if (useParallelBands) {
          const bandMinY = canvas.height * 0.08;
          const bandMaxY = canvas.height * 0.95;

          if (stroke.lane === "top") {
            // Top band: left-top -> right-top, arcing above title area.
            fromX = -offscreenPad;
            fromY = canvas.height * (0.08 + Math.random() * 0.03);
            toX = clamp(canvas.width * (0.9 + Math.random() * 0.06), minX, maxX);
            toY = clamp(canvas.height * (0.16 + Math.random() * 0.05), bandMinY, bandMaxY);

            stroke.ctrl1X = clamp(canvas.width * (0.22 + Math.random() * 0.08), minX, maxX);
            stroke.ctrl1Y = clamp(canvas.height * (0.3 + Math.random() * 0.06), bandMinY, bandMaxY);
            stroke.ctrl2X = clamp(canvas.width * (0.72 + Math.random() * 0.08), minX, maxX);
            stroke.ctrl2Y = clamp(canvas.height * (0.04 + Math.random() * 0.04), bandMinY, bandMaxY);

            stroke.emitIntensity = 0.8;
            stroke.emitIntervalMs = 30 + Math.random() * 12;
          } else {
            // Bottom band: right-bottom -> left-bottom, arcing below title area.
            fromX = canvas.width + offscreenPad;
            fromY = canvas.height * (0.94 + Math.random() * 0.03);
            toX = clamp(canvas.width * (0.06 + Math.random() * 0.06), minX, maxX);
            toY = clamp(canvas.height * (0.94 + Math.random() * 0.03), bandMinY, bandMaxY);

            stroke.ctrl1X = clamp(canvas.width * (0.78 - Math.random() * 0.08), minX, maxX);
            stroke.ctrl1Y = clamp(canvas.height * (0.68 + Math.random() * 0.08), bandMinY, bandMaxY);
            stroke.ctrl2X = clamp(canvas.width * (0.28 - Math.random() * 0.1), minX, maxX);
            stroke.ctrl2Y = clamp(canvas.height * (0.995 - Math.random() * 0.02), bandMinY, bandMaxY);

            stroke.emitIntensity = 0.96;
            stroke.emitIntervalMs = 26 + Math.random() * 10;
          }
        } else if (useOutlineFrame) {
          const contourMinY = canvas.height * 0.08;
          const contourMaxY = canvas.height * 0.95;

          if (stroke.lane === "top") {
            // Thick path: start top-left -> dive to bottom-left -> route below title -> end mid-right.
            fromX = -offscreenPad;
            fromY = canvas.height * (0.1 + Math.random() * 0.03);
            toX = clamp(canvas.width * (0.72 + Math.random() * 0.08), minX, maxX);
            toY = clamp(canvas.height * (0.58 + Math.random() * 0.08), contourMinY, contourMaxY);

            stroke.ctrl1X = clamp(canvas.width * (0.04 + Math.random() * 0.04), minX, maxX);
            stroke.ctrl1Y = clamp(canvas.height * (0.84 + Math.random() * 0.08), contourMinY, contourMaxY);
            stroke.ctrl2X = clamp(canvas.width * (0.48 + Math.random() * 0.1), minX, maxX);
            stroke.ctrl2Y = clamp(canvas.height * (0.86 + Math.random() * 0.08), contourMinY, contourMaxY);

            stroke.emitIntensity = 1.16;
            stroke.emitIntervalMs = 22 + Math.random() * 10;
          } else {
            // Thin path: start bottom-right -> rise to top-right -> route above title -> end mid-left.
            fromX = canvas.width + offscreenPad;
            fromY = canvas.height * (0.88 + Math.random() * 0.06);
            toX = clamp(canvas.width * (0.2 + Math.random() * 0.08), minX, maxX);
            toY = clamp(canvas.height * (0.3 + Math.random() * 0.08), contourMinY, contourMaxY);

            stroke.ctrl1X = clamp(canvas.width * (0.94 - Math.random() * 0.03), minX, maxX);
            stroke.ctrl1Y = clamp(canvas.height * (0.12 + Math.random() * 0.08), contourMinY, contourMaxY);
            stroke.ctrl2X = clamp(canvas.width * (0.62 + Math.random() * 0.1), minX, maxX);
            stroke.ctrl2Y = clamp(canvas.height * (0.14 + Math.random() * 0.1), contourMinY, contourMaxY);

            stroke.emitIntensity = 0.72;
            stroke.emitIntervalMs = 34 + Math.random() * 14;
          }
        } else {
          fromX = startBandX;
          fromY = clamp(
            baseY + canvas.height * ((Math.random() - 0.5) * 0.1),
            laneMinY,
            laneMaxY,
          );
          toX = clamp(endBandX, minX, maxX);
          toY = clamp(baseY + yDelta, laneMinY, laneMaxY);

          const dx = toX - fromX;
          const dy = toY - fromY;
          const perpX = -dy;
          const perpY = dx;
          const perpLen = Math.hypot(perpX, perpY) || 1;
          const normalX = perpX / perpLen;
          const normalY = perpY / perpLen;
          const bowBoost = Math.random() < 0.7 ? 1.9 : 1.25;
          const bow = canvas.height * (0.09 + Math.random() * 0.18) * bowBoost * (Math.random() > 0.5 ? 1 : -1);

          stroke.ctrl1X = clamp(fromX + dx * 0.27 + normalX * bow, minX, maxX);
          stroke.ctrl1Y = clamp(
            fromY + dy * 0.27 + normalY * bow,
            laneMinY,
            laneMaxY,
          );
          stroke.ctrl2X = clamp(fromX + dx * 0.72 - normalX * bow * 0.88, minX, maxX);
          stroke.ctrl2Y = clamp(
            fromY + dy * 0.72 - normalY * bow * 0.88,
            laneMinY,
            laneMaxY,
          );
        }
      }

      stroke.active = true;
      stroke.startTs = timestamp;
      stroke.durationMs = durationMs;
      stroke.fromX = fromX;
      stroke.fromY = fromY;
      stroke.toX = toX;
      stroke.toY = toY;
      stroke.startSide = fromX < canvas.width * 0.5 ? "left" : "right";
      stroke.lastEmitTs = 0;
      stroke.lastX = fromX;
      stroke.lastY = fromY;
    };

    const step = (dt: number) => {
      gl.disable(gl.BLEND);

      const curlProgramInfo = programs.curl as ProgramInfo;
      gl.useProgram(curlProgramInfo.program);
      bindAttribute(gl, curlProgramInfo);
      gl.uniform2f(curlProgramInfo.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgramInfo.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      const vorticityProgramInfo = programs.vorticity as ProgramInfo;
      gl.useProgram(vorticityProgramInfo.program);
      bindAttribute(gl, vorticityProgramInfo);
      gl.uniform2f(
        vorticityProgramInfo.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(vorticityProgramInfo.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgramInfo.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgramInfo.uniforms.curl, config.curl);
      gl.uniform1f(vorticityProgramInfo.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      const divergenceProgramInfo = programs.divergence as ProgramInfo;
      gl.useProgram(divergenceProgramInfo.program);
      bindAttribute(gl, divergenceProgramInfo);
      gl.uniform2f(
        divergenceProgramInfo.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(divergenceProgramInfo.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      const clearProgramInfo = programs.clear as ProgramInfo;
      gl.useProgram(clearProgramInfo.program);
      bindAttribute(gl, clearProgramInfo);
      gl.uniform1i(clearProgramInfo.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgramInfo.uniforms.value, config.pressure);
      blit(pressure.write);
      pressure.swap();

      const pressureProgramInfo = programs.pressure as ProgramInfo;
      gl.useProgram(pressureProgramInfo.program);
      bindAttribute(gl, pressureProgramInfo);
      gl.uniform2f(
        pressureProgramInfo.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(pressureProgramInfo.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.pressureIterations; i += 1) {
        gl.uniform1i(pressureProgramInfo.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      const gradientProgramInfo = programs.gradientSubtract as ProgramInfo;
      gl.useProgram(gradientProgramInfo.program);
      bindAttribute(gl, gradientProgramInfo);
      gl.uniform2f(
        gradientProgramInfo.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(gradientProgramInfo.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientProgramInfo.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      const advectionProgramInfo = programs.advection as ProgramInfo;
      gl.useProgram(advectionProgramInfo.program);
      bindAttribute(gl, advectionProgramInfo);
      gl.uniform2f(advectionProgramInfo.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1f(advectionProgramInfo.uniforms.dt, dt);

      const velocityId = velocity.read.attach(0);
      gl.uniform1i(advectionProgramInfo.uniforms.uVelocity, velocityId);
      gl.uniform1i(advectionProgramInfo.uniforms.uSource, velocityId);
      gl.uniform1f(advectionProgramInfo.uniforms.dissipation, config.velocityDissipation);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(advectionProgramInfo.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgramInfo.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advectionProgramInfo.uniforms.dissipation, config.densityDissipation);
      blit(dye.write);
      dye.swap();
    };

    const render = () => {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const displayProgramInfo = programs.display as ProgramInfo;
      gl.useProgram(displayProgramInfo.program);
      bindAttribute(gl, displayProgramInfo);
      gl.uniform2f(
        displayProgramInfo.uniforms.texelSize,
        1 / gl.drawingBufferWidth,
        1 / gl.drawingBufferHeight,
      );
      gl.uniform1i(displayProgramInfo.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    };

    resizeCanvas();
    initFramebuffers();
    pointer.x = canvas.width * 0.5;
    pointer.y = canvas.height * 0.2;

    let rafId: number | null = null;
    let running = !prefersReducedMotion;
    let lastTs = performance.now();

    const frame = (timestamp: number) => {
      resizeCanvas();
      const dt = clamp((timestamp - lastTs) / 1000, 0.001, 0.016);
      lastTs = timestamp;

      step(dt);
      render();

      if (timestamp - idleState.lastUserTs > 850) {
        const allInactive = idleState.strokes.every((stroke) => !stroke.active);
        if (allInactive && timestamp >= idleState.nextPairStartTs) {
          idleState.pairSwapSides = Math.random() < 0.5;
          const pairPattern = choosePairPattern();
          if (pairPattern === "outline_frame" || pairPattern === "parallel_bands") {
            idleState.pairSwapSides = false;
          }
          const pairDurationMs = 3200 + Math.random() * 500;
          for (const stroke of idleState.strokes) {
            stroke.preferredSide =
              stroke.lane === "top"
                ? (idleState.pairSwapSides ? "right" : "left")
                : (idleState.pairSwapSides ? "left" : "right");
            startStroke(stroke, timestamp, pairDurationMs, pairPattern);
          }
          idleState.lastPairPattern = pairPattern;
          idleState.pairWasActive = true;
        }

        for (const stroke of idleState.strokes) {
          if (!stroke.active) continue;
          const progressRaw =
            (timestamp - stroke.startTs) / Math.max(stroke.durationMs, 1);
          const progress = clamp(progressRaw, 0, 1);
          const eased = progress * progress * (3 - 2 * progress);
          let x = stroke.fromX + (stroke.toX - stroke.fromX) * eased;
          let y = stroke.fromY + (stroke.toY - stroke.fromY) * eased;

          if (stroke.mode === "orbit") {
            const angle = stroke.angleStart + stroke.angleSpan * eased;
            x = stroke.centerX + Math.cos(angle) * stroke.radiusX;
            y = stroke.centerY + Math.sin(angle) * stroke.radiusY;
          } else {
            // Cubic bezier interpolation gives natural curved "drag" paths.
            const t = eased;
            const mt = 1 - t;
            x =
              mt * mt * mt * stroke.fromX +
              3 * mt * mt * t * stroke.ctrl1X +
              3 * mt * t * t * stroke.ctrl2X +
              t * t * t * stroke.toX;
            y =
              mt * mt * mt * stroke.fromY +
              3 * mt * mt * t * stroke.ctrl1Y +
              3 * mt * t * t * stroke.ctrl2Y +
              t * t * t * stroke.toY;
          }

          if (timestamp - stroke.lastEmitTs > stroke.emitIntervalMs) {
            emitAutoStrokeSplat(stroke, x, y, [0.1, 0.26, 0.82], stroke.emitIntensity);
            stroke.lastEmitTs = timestamp;
          }

          if (progress >= 1) {
            scheduleNextStroke(stroke, timestamp);
          }
        }

        const allInactiveAfterStep = idleState.strokes.every((stroke) => !stroke.active);
        if (idleState.pairWasActive && allInactiveAfterStep) {
          idleState.nextPairStartTs = timestamp + 420 + Math.random() * 260;
          idleState.pairWasActive = false;
        }
      } else {
        for (const stroke of idleState.strokes) {
          if (stroke.active) scheduleNextStroke(stroke, timestamp);
        }
        idleState.nextPairStartTs = timestamp + 520;
        idleState.pairWasActive = false;
      }

      if (!running) return;
      rafId = window.requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        running = false;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!prefersReducedMotion) {
        running = true;
        lastTs = performance.now();
        rafId = window.requestAnimationFrame(frame);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!allowPointer || prefersReducedMotion) return;
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      idleState.lastUserTs = performance.now();
      for (const stroke of idleState.strokes) {
        if (stroke.active) scheduleNextStroke(stroke, idleState.lastUserTs);
      }
      idleState.nextPairStartTs = idleState.lastUserTs + 520;
      emitPointerSplat(x, y, [0.1, 0.26, 0.82], 1);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (prefersReducedMotion) {
      step(0.016);
      render();
    } else {
      rafId = window.requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);

      Object.values(programs).forEach((programInfo) => {
        if (programInfo) gl.deleteProgram(programInfo.program);
      });
      gl.deleteBuffer(quad);
    };
  }, []);

  const wrapperStyle: CSSProperties = {
    "--hero-fluid-height": typeof height === "number" ? `${height}px` : height,
  } as CSSProperties;

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.overlay} />
    </div>
  );
}
