"use client";

import { useEffect, useRef } from "react";
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./HeroPartnerLinesBackground.module.scss";

const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  gradientColor = mix(gradientColor, vec3(0.24, 0.22, 0.86), 0.38);
  gradientColor.g *= 0.8;
  gradientColor = clamp(gradientColor, 0.0, 1.0);
  return gradientColor * 0.58;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset = offset;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);
  vec3 baseColor = vec3(0.0);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, baseColor);

      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.16;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, baseColor);

      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.4;
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, baseColor);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.12;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

const hexToVec3 = (hex: string) => {
  let value = hex.trim();

  if (value.startsWith("#")) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = Number.parseInt(value[0] + value[0], 16);
    g = Number.parseInt(value[1] + value[1], 16);
    b = Number.parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = Number.parseInt(value.slice(0, 2), 16);
    g = Number.parseInt(value.slice(2, 4), 16);
    b = Number.parseInt(value.slice(4, 6), 16);
  }

  return new Vector3(r / 255, g / 255, b / 255);
};

const DEFAULT_COLORS = ["#3836cf", "#433dff", "#5a4fff", "#6a5cff"];

export default function HeroPartnerLinesBackground({
  colors = DEFAULT_COLORS,
}: {
  colors?: string[];
}) {
  const { isReducedMotion } = useMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetColorsRef = useRef<Vector3[]>(colors.map((h) => hexToVec3(h)));

  // Update target colors when prop changes
  useEffect(() => {
    targetColorsRef.current = colors.map((h) => hexToVec3(h));
  }, [colors]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isReducedMotion) return;

    let active = true;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 0.6s ease";
    container.appendChild(canvas);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: 0.84 },
      enableTop: { value: true },
      enableMiddle: { value: true },
      enableBottom: { value: true },
      topLineCount: { value: 5 },
      middleLineCount: { value: 6 },
      bottomLineCount: { value: 5 },
      topLineDistance: { value: 0.05 },
      middleLineDistance: { value: 0.05 },
      bottomLineDistance: { value: 0.05 },
      topWavePosition: { value: new Vector3(9.1, 0.56, -0.48) },
      middleWavePosition: { value: new Vector3(4.7, 0.06, 0.22) },
      bottomWavePosition: { value: new Vector3(1.9, -0.64, 0.42) },
      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: false },
      bendRadius: { value: 5.2 },
      bendStrength: { value: -0.42 },
      bendInfluence: { value: 0 },
      parallax: { value: false },
      parallaxStrength: { value: 0.18 },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)),
      },
      lineGradientCount: { value: 4 },
    };

    colors.forEach((hex, index) => {
      uniforms.lineGradient.value[index].copy(hexToVec3(hex));
    });

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    const setSize = () => {
      if (!active) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
    };

    setSize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            setSize();
          })
        : null;

    resizeObserver?.observe(container);

    let frame = 0;
    let inViewport = true;
    let revealed = false;

    const COLOR_LERP_SPEED = 0.04;

    const renderLoop = () => {
      if (!active || !inViewport) {
        frame = 0;
        return;
      }

      uniforms.iTime.value = clock.getElapsedTime();

      // Smoothly lerp gradient colors toward target
      const targets = targetColorsRef.current;
      for (let i = 0; i < targets.length && i < MAX_GRADIENT_STOPS; i++) {
        uniforms.lineGradient.value[i].lerp(targets[i], COLOR_LERP_SPEED);
      }

      renderer.render(scene, camera);

      if (!revealed) {
        revealed = true;
        canvas.style.opacity = "1";
      }

      frame = window.requestAnimationFrame(renderLoop);
    };

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport && !frame && active) {
          clock.getDelta();
          frame = window.requestAnimationFrame(renderLoop);
        }
      },
      { threshold: 0.01 },
    );
    viewportObserver.observe(container);

    renderLoop();

    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      viewportObserver.disconnect();
      resizeObserver?.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
    };
  }, [isReducedMotion]);

  return (
    <div ref={containerRef} className={styles.wrapper} aria-hidden="true">
      <div className={styles.base} />
      <div className={styles.vignette} />
    </div>
  );
}
