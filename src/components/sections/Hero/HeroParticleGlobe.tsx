"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./HeroParticleGlobe.module.scss";

const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 900;
const GLOBE_RADIUS = 10;
const GLOBE_SPHERE_RADIUS = GLOBE_RADIUS * 0.78;
const BREATH_PERIOD_SECONDS = 10;

const COLLAPSE_VOID_RADIUS = GLOBE_RADIUS * 0.26;
const COLLAPSE_RING_RADIUS = GLOBE_RADIUS * 0.88;
const COLLAPSE_TUBE_RADIUS = GLOBE_RADIUS * 0.5;

// Subtle premium loop: hold globe -> collapse -> hold donut -> repair -> hold globe.
const LOOP_HOLD_GLOBE_1 = 5.0;
const LOOP_COLLAPSE = 3.5;
const LOOP_HOLD_DONUT = 6.0;
const LOOP_REPAIR = 4.5;
const LOOP_HOLD_GLOBE_2 = 4.0;
const LOOP_TOTAL_SECONDS =
  LOOP_HOLD_GLOBE_1 +
  LOOP_COLLAPSE +
  LOOP_HOLD_DONUT +
  LOOP_REPAIR +
  LOOP_HOLD_GLOBE_2;

type GlobeVariant = "premium" | "showy";
const GLOBE_VARIANT: GlobeVariant = "premium";

type GlobeProfile = {
  desktopCount: number;
  mobileCount: number;
  rotationSpeed: number;
  breathAmplitude: number;
  cameraZ: number;
  groupY: number;
  pointSizeDesktop: number;
  pointSizeMobile: number;
  hoverRadiusScale: number;
  parallaxStrength: number;
  tiltBase: number;
  tiltAmplitude: number;
  tiltFrequency: number;
  shellOuterChance: number;
  shellOuterMin: number;
  shellOuterMax: number;
  shellInnerMin: number;
  shellInnerMax: number;
  sizeMin: number;
  sizeMax: number;
  alphaMin: number;
  alphaMax: number;
  baseColor: string;
  deepColor: string;
  brightColor: string;
};

const GLOBE_PROFILES: Record<GlobeVariant, GlobeProfile> = {
  premium: {
    desktopCount: 24000,
    mobileCount: 13000,
    rotationSpeed: 0.1,
    breathAmplitude: 0.023,
    cameraZ: 27.8,
    groupY: 0,
    pointSizeDesktop: 4.8,
    pointSizeMobile: 4.1,
    hoverRadiusScale: 0.18,
    parallaxStrength: 6.8,
    tiltBase: 0.13,
    tiltAmplitude: 0.028,
    tiltFrequency: 0.13,
    shellOuterChance: 0.78,
    shellOuterMin: 0.92,
    shellOuterMax: 1,
    shellInnerMin: 0.76,
    shellInnerMax: 0.93,
    sizeMin: 0.84,
    sizeMax: 1.32,
    alphaMin: 0.6,
    alphaMax: 0.94,
    baseColor: "#4b58e8",
    deepColor: "#3342b8",
    brightColor: "#98aaff",
  },
  showy: {
    desktopCount: 30000,
    mobileCount: 17000,
    rotationSpeed: 0.12,
    breathAmplitude: 0.028,
    cameraZ: 27,
    groupY: 0,
    pointSizeDesktop: 5.6,
    pointSizeMobile: 4.8,
    hoverRadiusScale: 0.2,
    parallaxStrength: 8,
    tiltBase: 0.16,
    tiltAmplitude: 0.036,
    tiltFrequency: 0.18,
    shellOuterChance: 0.88,
    shellOuterMin: 0.94,
    shellOuterMax: 1,
    shellInnerMin: 0.78,
    shellInnerMax: 0.94,
    sizeMin: 0.95,
    sizeMax: 1.58,
    alphaMin: 0.72,
    alphaMax: 1,
    baseColor: "#5e58ff",
    deepColor: "#3f3dd6",
    brightColor: "#bcc4ff",
  },
};
const ACTIVE_PROFILE = GLOBE_PROFILES[GLOBE_VARIANT];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const randn = () =>
  (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const getCollapsePhase = (elapsed: number) => {
  let x = elapsed % LOOP_TOTAL_SECONDS;

  if (x < LOOP_HOLD_GLOBE_1) return { collapse: 0, swirl: 0.02 };
  x -= LOOP_HOLD_GLOBE_1;

  if (x < LOOP_COLLAPSE) {
    const k = smoothstep(x / LOOP_COLLAPSE);
    return { collapse: k, swirl: 0.02 + 0.06 * k };
  }
  x -= LOOP_COLLAPSE;

  if (x < LOOP_HOLD_DONUT) return { collapse: 1, swirl: 0.04 };
  x -= LOOP_HOLD_DONUT;

  if (x < LOOP_REPAIR) {
    const k = smoothstep(x / LOOP_REPAIR);
    return { collapse: 1 - k, swirl: 0.04 - 0.02 * k };
  }

  return { collapse: 0, swirl: 0.02 };
};

const createGlobeGeometry = (count: number, profile: GlobeProfile) => {
  const positions = new Float32Array(count * 3);
  const donut = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const seeds = new Float32Array(count);
  const layers = new Float32Array(count);
  const sparks = new Float32Array(count);

  const basePurple = new THREE.Color(profile.baseColor);
  const deepPurple = new THREE.Color(profile.deepColor);
  const brightPurple = new THREE.Color(profile.brightColor);
  const color = new THREE.Color();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const y = 1 - t * 2;
    const radial2d = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const shellRatio =
      Math.random() < profile.shellOuterChance
        ? rand(profile.shellOuterMin, profile.shellOuterMax)
        : rand(profile.shellInnerMin, profile.shellInnerMax);

    const sx = Math.cos(theta) * radial2d * GLOBE_SPHERE_RADIUS * shellRatio;
    const sz = Math.sin(theta) * radial2d * GLOBE_SPHERE_RADIUS * shellRatio;
    const sy = y * GLOBE_SPHERE_RADIUS * shellRatio;

    const idx3 = i * 3;
    positions[idx3] = sx;
    positions[idx3 + 1] = sy;
    positions[idx3 + 2] = sz;

    const lat = (y + 1) * 0.5;
    const depth = (sz / GLOBE_SPHERE_RADIUS + 1) * 0.5;
    const centerBias = 1 - shellRatio;

    color
      .copy(basePurple)
      .lerp(deepPurple, 0.16 + depth * 0.16)
      .lerp(brightPurple, centerBias * 0.34 + lat * 0.18);

    colors[idx3] = color.r;
    colors[idx3 + 1] = color.g;
    colors[idx3 + 2] = color.b;

    // Donut collapse target generated once on CPU.
    // IMPORTANT: build it in the XY plane (facing the camera),
    // not the XZ plane (which looks like a flat horizontal line).
    const a = Math.random() * Math.PI * 2;
    const tubeRadial = randn() * COLLAPSE_TUBE_RADIUS * 0.8;
    const tubeVertical = randn() * COLLAPSE_TUBE_RADIUS * 0.95;

    const cx = Math.cos(a) * COLLAPSE_RING_RADIUS;
    const cy = Math.sin(a) * COLLAPSE_RING_RADIUS;

    let dx = cx + Math.cos(a) * tubeRadial;
    let dy = cy + Math.sin(a) * tubeRadial;
    let dz = tubeVertical * 0.75;

    const dd = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dd < COLLAPSE_VOID_RADIUS) {
      const k = COLLAPSE_VOID_RADIUS / Math.max(dd, 1e-4);
      dx *= k;
      dy *= k;
      dz *= k;
    }

    donut[idx3] = dx;
    donut[idx3 + 1] = dy;
    donut[idx3 + 2] = dz;

    sizes[i] = rand(profile.sizeMin, profile.sizeMax);
    alphas[i] = rand(profile.alphaMin, profile.alphaMax);
    seeds[i] = Math.random();
    layers[i] = Math.floor(Math.random() * 3); // 0=back, 1=mid, 2=front
    sparks[i] = Math.random() < 0.012 ? 1 : 0; // Premium: fewer, cleaner spark accents
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aDonut", new THREE.Float32BufferAttribute(donut, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alphas, 1));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aLayer", new THREE.Float32BufferAttribute(layers, 1));
  geometry.setAttribute("aSpark", new THREE.Float32BufferAttribute(sparks, 1));

  return geometry;
};

const globeVertexShader = `
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uCollapse;
  uniform float uSwirl;
  uniform float uVoidRadius;
  uniform float uTime;
  uniform vec2 uLayerParallax;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uHoverRadius;

  attribute vec3 aDonut;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aSeed;
  attribute float aLayer;
  attribute float aSpark;

  varying vec3 vColor;
  varying float vAlpha;
  varying vec3 vPosition;
  varying float vCollapse;
  varying float vTwinkle;
  varying float vSpark;
  varying vec2 vSparkDir;
  varying float vPointerZone;
  varying float vCoreFlow;

  void main() {
    float collapseMix = smoothstep(0.0, 1.0, uCollapse);
    float phaseDriftAngle = collapseMix * sin(uTime * 0.18) * 0.095;
    mat2 phaseDrift = mat2(
      cos(phaseDriftAngle), -sin(phaseDriftAngle),
      sin(phaseDriftAngle), cos(phaseDriftAngle)
    );
    vec3 donutTarget = aDonut;
    donutTarget.xy = phaseDrift * donutTarget.xy;

    vec3 p = mix(position, donutTarget, uCollapse);

    // Keep motion subtle even during transition.
    float drift = 0.02;
    p += drift * vec3(
      sin(uTime * 0.6 + aSeed * 10.0),
      sin(uTime * 0.7 + aSeed * 20.0),
      sin(uTime * 0.5 + aSeed * 30.0)
    );

    // Make collapsed ring feel alive without rigid orbital spinning.
    vec2 radial = normalize(p.xy + vec2(0.0001));
    float outlier = step(0.64, fract(aSeed * 97.13));
    float radialJitter =
      sin(uTime * (1.2 + aSeed * 1.8) + aSeed * 37.0) * 0.5 +
      cos(uTime * (1.9 + aSeed * 1.3) + aSeed * 19.0) * 0.5;
    float push =
      collapseMix *
      (0.1 + uSwirl * 0.18 + radialJitter * 0.12 + outlier * (0.3 + uSwirl * 0.24));
    p.xy += radial * push;

    // Extra sparse outliers to make the collapsed ring breathe outward.
    float burstMask = step(0.62, fract(aSeed * 57.31));
    float burstWave = 0.5 + 0.5 * sin(uTime * (1.05 + aSeed * 1.4) + aSeed * 53.0);
    float burst =
      collapseMix * burstMask * burstWave * (0.18 + uSwirl * 0.34 + outlier * 0.16);
    p.xy += radial * burst;

    float depthBounce =
      sin(uTime * (2.0 + aSeed * 2.5) + aSeed * 41.0) * (0.12 + outlier * 0.18);
    p.z += collapseMix * depthBounce * (0.78 + uSwirl * 1.05);

    // Subtle internal depth parallax (front/mid/back layers).
    float layerOffset = (aLayer - 1.0); // -1, 0, 1
    float layerStrength = 0.042 + collapseMix * 0.02;
    p.xy += vec2(uLayerParallax.x, -uLayerParallax.y) * layerOffset * layerStrength;

    // Premium spark accents: slower pulse and softer movement.
    vec2 tangent = normalize(vec2(-p.y, p.x) + vec2(0.0001));
    float sparkWave = 0.5 + 0.5 * sin(uTime * 0.82 + aSeed * 123.0);
    float sparkPulse = aSpark * smoothstep(0.12, 0.96, sparkWave);
    sparkPulse = sparkPulse * sparkPulse * (3.0 - 2.0 * sparkPulse);
    float sparkShift = sparkPulse * (0.02 + 0.05 * (0.5 + 0.5 * sin(uTime * 1.35 + aSeed * 71.0)));
    p.xy += tangent * sparkShift;

    // Pointer interaction: stable circular mini-collapse around the cursor.
    // Use a cleaner source position so the shape does not drift into irregular blobs over time.
    vec3 pointerDeltaStable = (mix(position, donutTarget, uCollapse)) - uPointer;
    float pointerDistance = length(pointerDeltaStable);
    float pointerZone =
      (1.0 - smoothstep(uHoverRadius * 0.14, uHoverRadius * 1.62, pointerDistance)) *
      uPointerStrength;
    float coreFlow = 0.0;
    if (pointerZone > 0.0001) {
      vec2 localRadial = normalize(pointerDeltaStable.xy + vec2(0.0001));
      float tinyRingRadius = uHoverRadius * 0.78;
      float tinyTubeRadius = uHoverRadius * 0.34;
      float tinyPulse = 1.0 + 0.06 * sin(uTime * 1.1);
      float wobbleAngle = 0.12 * sin(uTime * 0.72 + uPointer.x * 0.65 + uPointer.y * 0.42);
      mat2 wobbleRot = mat2(
        cos(wobbleAngle), -sin(wobbleAngle),
        sin(wobbleAngle), cos(wobbleAngle)
      );
      vec2 wobbleRadial = wobbleRot * localRadial;
      float ellipseA = 1.0 + 0.14 * sin(uTime * 0.44 + uPointer.y * 0.7);
      float ellipseB = 1.0 - 0.1 * sin(uTime * 0.44 + uPointer.y * 0.7);
      vec2 organicShape = vec2(wobbleRadial.x * ellipseA, wobbleRadial.y * ellipseB);
      float edgeNoise =
        sin((pointerDeltaStable.x + pointerDeltaStable.y) * 1.05 + uTime * 0.9) * 0.065 +
        cos(pointerDeltaStable.z * 1.35 - uTime * 0.72) * 0.04;
      float organicRadius = tinyRingRadius * tinyPulse * (1.0 + edgeNoise);

      vec3 tinyDonut = vec3(
        organicShape * organicRadius,
        pointerDeltaStable.z * (0.14 + tinyTubeRadius * 0.08)
      );

      p = mix(p, uPointer + tinyDonut, min(1.0, pointerZone * 1.28));

      float tinyVoid = uHoverRadius * 0.26;
      float coreMask =
        (1.0 - smoothstep(0.0, tinyVoid * 1.46, pointerDistance)) * pointerZone;
      if (coreMask > 0.0001) {
        float flowPhase = fract(uTime * 0.42 + aSeed * 4.71);
        float flowRadius = flowPhase * tinyRingRadius * 0.96;
        vec2 flowDir = normalize(localRadial + vec2(
          sin(aSeed * 23.0 + uTime * 0.16) * 0.22,
          cos(aSeed * 19.0 - uTime * 0.14) * 0.22
        ));
        vec3 flowTarget = vec3(
          flowDir * flowRadius,
          pointerDeltaStable.z * 0.08
        );
        p = mix(p, uPointer + flowTarget, coreMask * 0.9);
        coreFlow = coreMask;
      }
      if (pointerDistance < tinyVoid) {
        vec3 pushDir = normalize(pointerDeltaStable + vec3(0.0001));
        float push = (tinyVoid - pointerDistance) * pointerZone;
        p += pushDir * push * 0.42;
      }
    }

    if (length(p) < uVoidRadius) {
      p = normalize(p + vec3(0.0001)) * uVoidRadius;
    }

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = max(
      1.2,
      uSize * aSize * uPixelRatio * (28.0 / -mvPosition.z)
    );
    gl_PointSize *= (1.0 + sparkPulse * 0.22 + pointerZone * 0.2);
    gl_PointSize *= mix(1.0, 1.12, uCollapse);

    vColor = color;
    vAlpha = aAlpha * mix(1.0, 0.9 + outlier * 0.12, uCollapse) *
      (1.0 + sparkPulse * 0.26 + pointerZone * 0.32);
    vPosition = p;
    vCollapse = uCollapse;
    vSpark = sparkPulse;
    vSparkDir = tangent;
    vPointerZone = pointerZone;
    vCoreFlow = coreFlow;

    float angle = atan(p.y, p.x);
    float sweep = 0.5 + 0.5 * sin(uTime * 0.5 + angle * 2.8 + length(p.xy) * 0.28);
    float twinkle = 0.93 + 0.07 * sin(uTime * (1.0 + aSeed * 1.4) + aSeed * 83.0);
    vTwinkle = mix(twinkle, twinkle + sweep * 0.06, 0.52);
  }
`;

const globeFragmentShader = `
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uHoverRadius;
  uniform float uVoidRadius;
  uniform float uRingRadius;
  uniform float uRingFade;

  varying vec3 vColor;
  varying float vAlpha;
  varying vec3 vPosition;
  varying float vCollapse;
  varying float vTwinkle;
  varying float vSpark;
  varying vec2 vSparkDir;
  varying float vPointerZone;
  varying float vCoreFlow;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);

    float dotMask = smoothstep(0.5, 0.0, d);
    dotMask = pow(dotMask, 1.2);

    float pointerDistance = length(vPosition - uPointer);
    float hole =
      (1.0 - smoothstep(uHoverRadius * 0.32, uHoverRadius, pointerDistance)) *
      uPointerStrength;

    float pointerField =
      (1.0 - smoothstep(uHoverRadius * 0.04, uHoverRadius * 1.52, pointerDistance)) *
      uPointerStrength;

    float pointerRing =
      smoothstep(uHoverRadius * 0.2, uHoverRadius * 0.52, pointerDistance) *
      (1.0 - smoothstep(uHoverRadius * 0.52, uHoverRadius * 1.28, pointerDistance));
    pointerRing *= uPointerStrength;
    float r = length(vPosition);
    float globeCore =
      (1.0 - vCollapse) *
      (1.0 - smoothstep(uRingRadius * 0.34, uRingRadius * 0.9, r));

    vec3 color = vColor;
    color = mix(color, vec3(0.16, 0.34, 1.0), pointerRing * 1.05);
    float shimmer = clamp(vTwinkle, 0.9, 1.09);
    float localShimmer = 1.0 + (shimmer - 1.0) * (1.0 - vPointerZone * 0.88);
    color = mix(color, vec3(0.44, 0.58, 1.0), (localShimmer - 0.9) * 0.26);
    vec3 sparkTint = vec3(0.26, 0.4, 1.0);
    vec3 sparkGlow = vec3(0.12, 0.28, 0.98);
    color = mix(color, sparkTint, vSpark * 0.54);
    color += sparkGlow * vSpark * 0.14;
    color += vec3(0.06, 0.18, 0.94) * pointerRing * 0.52;
    color = mix(color, vec3(0.09, 0.26, 0.96), vPointerZone * 0.56);
    color = mix(color, vec3(0.14, 0.4, 1.0), vCoreFlow * 0.62);
    color += vec3(0.05, 0.14, 0.8) * pointerField * 0.52;
    color = mix(color, vec3(0.62, 0.72, 1.0), globeCore * 0.2);

    float coreCut = 1.0 - smoothstep(uVoidRadius - 0.08, uVoidRadius + 0.02, r);
    float collapseCut = 1.0 - coreCut * (0.995 * vCollapse);

    // Let collapsed outliers fade softly into the background farther from the ring.
    float ringDistance = length(vPosition.xy);
    float outerFade =
      smoothstep(
        uRingRadius + uRingFade * 0.65,
        uRingRadius + uRingFade * 1.95,
        ringDistance
      ) * vCollapse;

    if (vCollapse > 0.12 && r < (uVoidRadius + 0.01)) discard;

    float alpha = dotMask * vAlpha * 1.28;
    alpha *= (1.0 - hole * 0.08);
    alpha *= (1.0 + pointerField * 0.4 + pointerRing * 0.38 + vPointerZone * 0.14);
    alpha *= (1.0 + vCoreFlow * 0.62);
    alpha *= collapseCut;
    alpha *= (1.0 - outerFade * 0.88);
    alpha *= localShimmer;
    alpha *= (1.0 + globeCore * 0.24);
    alpha *= mix(1.0, 1.2, vCollapse);

    // Subtle spark treatment: de-emphasize hard core and use broader blue halo.
    vec2 centered = (gl_PointCoord - vec2(0.5)) * 2.0;
    float centeredLen = length(centered);
    float coreSoften = mix(1.0, 0.68, vSpark);
    alpha *= coreSoften;
    float haloWide = pow(smoothstep(1.35, 0.18, centeredLen), 2.3);
    float haloSoft = pow(smoothstep(1.15, 0.0, centeredLen), 3.2);
    float pointerHaloDamp = 1.0 - vPointerZone * 0.82;
    alpha += vSpark * haloWide * 0.18 * pointerHaloDamp;
    alpha += vSpark * haloSoft * 0.09 * pointerHaloDamp;

    if (alpha < 0.0035) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function HeroParticleGlobe() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    const allowPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const globeCount = isMobile
      ? ACTIVE_PROFILE.mobileCount
      : ACTIVE_PROFILE.desktopCount;

    const parallaxTarget = { x: 0, y: 0 };
    const parallaxCurrent = { x: 0, y: 0 };
    const spotlightTarget = { y: 42 };
    const spotlightCurrent = { y: 42 };
    const mouseNdc = new THREE.Vector2(2, 2);
    const raycaster = new THREE.Raycaster();
    const pointerLocalScratch = new THREE.Vector3();
    const pointerLocalTarget = new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25);
    const pointerLocalLag = new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25);
    const pointerLocalCurrent = new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25);
    let pointerStrengthTarget = 0;
    let pointerStrengthCurrent = 0;
    let isPointerInside = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, ACTIVE_PROFILE.cameraZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.position.y = ACTIVE_PROFILE.groupY;
    scene.add(globeGroup);

    const globeGeometry = createGlobeGeometry(globeCount, ACTIVE_PROFILE);
    const globeMaterial = new THREE.ShaderMaterial({
      vertexShader: globeVertexShader,
      fragmentShader: globeFragmentShader,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, MAX_DPR) },
        uCollapse: { value: 0 },
        uSwirl: { value: 0.05 },
        uVoidRadius: { value: COLLAPSE_VOID_RADIUS },
        uRingRadius: { value: COLLAPSE_RING_RADIUS },
        uRingFade: { value: COLLAPSE_TUBE_RADIUS * 1.6 },
        uTime: { value: 0 },
        uLayerParallax: { value: new THREE.Vector2(0, 0) },
        uSize: {
          value: isMobile
            ? ACTIVE_PROFILE.pointSizeMobile
            : ACTIVE_PROFILE.pointSizeDesktop,
        },
        uPointer: { value: new THREE.Vector3(0, 0, GLOBE_SPHERE_RADIUS * 0.25) },
        uPointerStrength: { value: 0 },
        uHoverRadius: { value: GLOBE_SPHERE_RADIUS * ACTIVE_PROFILE.hoverRadiusScale },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    const globePoints = new THREE.Points(globeGeometry, globeMaterial);
    globeGroup.add(globePoints);

    const hoverSphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_SPHERE_RADIUS, 24, 18),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    globeGroup.add(hoverSphere);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(clientWidth, clientHeight, false);

      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      globeMaterial.uniforms.uPixelRatio.value = pixelRatio;
    };

    const updateSpotlightFromScroll = () => {
      const section = wrapper.parentElement as HTMLElement | null;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      spotlightTarget.y = 36 + progress * 18;
    };

    const handlePointerMove = (event: MouseEvent) => {
      if (!allowPointer || reduceMotion) return;
      const rect = wrapper.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      mouseNdc.set(nx, -ny);
      isPointerInside = true;
      parallaxTarget.x = THREE.MathUtils.clamp(nx, -1, 1) * ACTIVE_PROFILE.parallaxStrength;
      parallaxTarget.y = THREE.MathUtils.clamp(ny, -1, 1) * ACTIVE_PROFILE.parallaxStrength;
    };

    const handlePointerLeave = () => {
      isPointerInside = false;
      parallaxTarget.x = 0;
      parallaxTarget.y = 0;
    };

    resize();
    updateSpotlightFromScroll();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateSpotlightFromScroll, { passive: true });
    window.addEventListener("resize", updateSpotlightFromScroll);

    if (allowPointer) {
      window.addEventListener("mousemove", handlePointerMove, { passive: true });
      wrapper.addEventListener("mouseleave", handlePointerLeave);
    }

    const clock = new THREE.Clock();
    let rafId = 0;
    let spinAngle = 0;

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      const breath =
        1 + Math.sin((elapsed / BREATH_PERIOD_SECONDS) * Math.PI * 2) * ACTIVE_PROFILE.breathAmplitude;
      globeGroup.scale.multiplyScalar(breath);

      const phase = getCollapsePhase(elapsed);
      const collapseMix = phase.collapse;
      // Smooth spin handoff: no hard threshold, so no snappy transition.
      const spinBlend = 1 - THREE.MathUtils.smoothstep(collapseMix, 0.02, 0.26);
      spinAngle += ACTIVE_PROFILE.rotationSpeed * delta * spinBlend;
      spinAngle = Math.atan2(Math.sin(spinAngle), Math.cos(spinAngle));

      const targetY = spinAngle * spinBlend;
      const targetX =
        (ACTIVE_PROFILE.tiltBase * 0.65 +
          Math.sin(elapsed * ACTIVE_PROFILE.tiltFrequency) *
            ACTIVE_PROFILE.tiltAmplitude *
            0.6) *
        spinBlend;

      globeGroup.rotation.y += (targetY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetX - globeGroup.rotation.x) * 0.08;
      globeMaterial.uniforms.uTime.value = elapsed;
      globeMaterial.uniforms.uCollapse.value = collapseMix;
      globeMaterial.uniforms.uSwirl.value = phase.swirl;
      globeMaterial.uniforms.uVoidRadius.value =
        COLLAPSE_VOID_RADIUS + COLLAPSE_VOID_RADIUS * 0.08 * collapseMix;

      if (allowPointer && !reduceMotion && isPointerInside) {
        globeGroup.updateWorldMatrix(true, false);
        raycaster.setFromCamera(mouseNdc, camera);

        const hits = raycaster.intersectObject(hoverSphere, false);
        if (hits.length > 0) {
          pointerLocalScratch.copy(hits[0].point);
          globePoints.worldToLocal(pointerLocalScratch);
          pointerLocalTarget.copy(pointerLocalScratch);
          pointerStrengthTarget = 1;
        } else {
          pointerStrengthTarget = 0;
        }
      } else {
        pointerStrengthTarget = 0;
      }

      pointerLocalLag.lerp(pointerLocalTarget, 0.08);
      pointerLocalCurrent.lerp(pointerLocalLag, 0.14);
      pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.11;
      globeMaterial.uniforms.uPointer.value.copy(pointerLocalCurrent);
      globeMaterial.uniforms.uPointerStrength.value = pointerStrengthCurrent;

      parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.08;
      parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.08;
      spotlightCurrent.y += (spotlightTarget.y - spotlightCurrent.y) * 0.08;
      globeMaterial.uniforms.uLayerParallax.value.set(
        parallaxCurrent.x,
        parallaxCurrent.y,
      );
      wrapper.style.setProperty("--parallax-x", `${parallaxCurrent.x.toFixed(2)}px`);
      wrapper.style.setProperty("--parallax-y", `${parallaxCurrent.y.toFixed(2)}px`);
      wrapper.style.setProperty("--spotlight-y", `${spotlightCurrent.y.toFixed(2)}%`);

      renderer.render(scene, camera);

      globeGroup.scale.divideScalar(breath);
      rafId = window.requestAnimationFrame(renderFrame);
    };

    if (reduceMotion) {
      globeGroup.rotation.y = 0.35;
      globeGroup.rotation.x = 0.14;
      wrapper.style.setProperty("--parallax-x", "0px");
      wrapper.style.setProperty("--parallax-y", "0px");
      wrapper.style.setProperty("--spotlight-y", `${spotlightTarget.y.toFixed(2)}%`);
      globeMaterial.uniforms.uCollapse.value = 0;
      globeMaterial.uniforms.uSwirl.value = 0.05;
      globeMaterial.uniforms.uPointerStrength.value = 0;
      renderer.render(scene, camera);
    } else {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateSpotlightFromScroll);
      window.removeEventListener("resize", updateSpotlightFromScroll);
      window.removeEventListener("mousemove", handlePointerMove);
      wrapper.removeEventListener("mouseleave", handlePointerLeave);

      globeGeometry.dispose();
      hoverSphere.geometry.dispose();
      (hoverSphere.material as THREE.Material).dispose();
      globeMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${GLOBE_VARIANT === "showy" ? styles.showy : styles.premium}`}
      aria-hidden="true"
    >
      <div className={styles.globeAura} />
      <div ref={containerRef} className={styles.canvas} />
      <div className={styles.vignette} />
      <div className={styles.contentShield} />
    </div>
  );
}
