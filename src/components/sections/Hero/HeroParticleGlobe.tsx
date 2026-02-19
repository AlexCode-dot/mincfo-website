"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./HeroParticleGlobe.module.scss";

const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 900;
const DESKTOP_GLOBE_COUNT = 16000;
const MOBILE_GLOBE_COUNT = 8000;

const GLOBE_RADIUS = 10;
const GLOBE_ROTATION_SPEED = 0.05;
const BREATH_PERIOD_SECONDS = 10;
const BREATH_AMPLITUDE = 0.02;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const createGlobeGeometry = (count: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  const basePurple = new THREE.Color("#6254ef");
  const deepPurple = new THREE.Color("#4333c8");
  const brightPurple = new THREE.Color("#b9a9ff");
  const color = new THREE.Color();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const y = 1 - t * 2;
    const radial2d = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const shellRatio = Math.random() < 0.72 ? rand(0.88, 1) : rand(0.7, 0.9);

    const x = Math.cos(theta) * radial2d * GLOBE_RADIUS * shellRatio;
    const z = Math.sin(theta) * radial2d * GLOBE_RADIUS * shellRatio;
    const yy = y * GLOBE_RADIUS * shellRatio;

    const idx3 = i * 3;
    positions[idx3] = x;
    positions[idx3 + 1] = yy;
    positions[idx3 + 2] = z;

    const lat = (y + 1) * 0.5;
    const depth = (z / GLOBE_RADIUS + 1) * 0.5;
    const centerBias = 1 - shellRatio;

    color
      .copy(basePurple)
      .lerp(deepPurple, 0.16 + depth * 0.16)
      .lerp(brightPurple, centerBias * 0.34 + lat * 0.18);

    colors[idx3] = color.r;
    colors[idx3 + 1] = color.g;
    colors[idx3 + 2] = color.b;

    sizes[i] = rand(0.82, 1.32);
    alphas[i] = rand(0.58, 1.0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alphas, 1));

  return geometry;
};

const globeVertexShader = `
  uniform float uPixelRatio;
  uniform float uSize;

  attribute float aSize;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;
  varying vec3 vPosition;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize * aSize * uPixelRatio * (28.0 / -mvPosition.z);

    vColor = color;
    vAlpha = aAlpha;
    vPosition = position;
  }
`;

const globeFragmentShader = `
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uHoverRadius;

  varying vec3 vColor;
  varying float vAlpha;
  varying vec3 vPosition;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);

    float roundMask = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.34, 0.0, d);

    // Aggressive dissolve so the sphere melts into darkness.
    float rim = smoothstep(10.2, 6.1, length(vPosition));

    float alpha = vAlpha * (roundMask * 0.94 + core * 0.42) * 1.42;
    alpha *= rim;

    float pointerDistance = length(vPosition - uPointer);

    // Tiny dissolve where cursor intersects the globe.
    float hole =
      (1.0 - smoothstep(uHoverRadius * 0.32, uHoverRadius, pointerDistance)) *
      uPointerStrength;

    // Stronger ring around the dissolved area.
    float ring =
      smoothstep(uHoverRadius * 0.78, uHoverRadius * 1.02, pointerDistance) *
      (1.0 - smoothstep(uHoverRadius * 1.02, uHoverRadius * 1.7, pointerDistance));
    ring *= uPointerStrength;

    // Keep ring accent inside the same blue/purple palette (no white bloom).
    vec3 ringTint = vec3(0.5, 0.45, 0.98);
    vec3 color = mix(vColor, ringTint, ring * 0.52) * (1.0 + ring * 0.46);
    alpha *= (1.0 - hole * 0.78);
    alpha *= (1.0 + ring * 0.34);

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

    const globeCount = isMobile ? MOBILE_GLOBE_COUNT : DESKTOP_GLOBE_COUNT;

    const parallaxTarget = { x: 0, y: 0 };
    const parallaxCurrent = { x: 0, y: 0 };
    const spotlightTarget = { y: 42 };
    const spotlightCurrent = { y: 42 };
    const mouseNdc = new THREE.Vector2(2, 2);
    const raycaster = new THREE.Raycaster();
    const pointerLocalScratch = new THREE.Vector3();
    const pointerLocalTarget = new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25);
    const pointerLocalCurrent = new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25);
    let pointerStrengthTarget = 0;
    let pointerStrengthCurrent = 0;
    let isPointerInside = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, 29);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.position.y = 1.4;
    scene.add(globeGroup);

    const globeGeometry = createGlobeGeometry(globeCount);
    const globeMaterial = new THREE.ShaderMaterial({
      vertexShader: globeVertexShader,
      fragmentShader: globeFragmentShader,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, MAX_DPR) },
        // Reduced ~15% for calmer density.
        uSize: { value: isMobile ? 4.0 : 4.6 },
        uPointer: { value: new THREE.Vector3(0, 0, GLOBE_RADIUS * 0.25) },
        uPointerStrength: { value: 0 },
        uHoverRadius: { value: GLOBE_RADIUS * 0.16 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    const globePoints = new THREE.Points(globeGeometry, globeMaterial);
    globeGroup.add(globePoints);

    // Invisible target mesh for reliable ray intersections against the globe volume.
    const hoverSphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 24, 18),
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
      parallaxTarget.x = THREE.MathUtils.clamp(nx, -1, 1) * 6;
      parallaxTarget.y = THREE.MathUtils.clamp(ny, -1, 1) * 6;
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

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      globeGroup.rotation.y += GLOBE_ROTATION_SPEED * delta;
      globeGroup.rotation.x = 0.1 + Math.sin(elapsed * 0.12) * 0.025;

      const breath =
        1 + Math.sin((elapsed / BREATH_PERIOD_SECONDS) * Math.PI * 2) * BREATH_AMPLITUDE;
      globeGroup.scale.multiplyScalar(breath);

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

      pointerLocalCurrent.lerp(pointerLocalTarget, 0.16);
      pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.11;
      globeMaterial.uniforms.uPointer.value.copy(pointerLocalCurrent);
      globeMaterial.uniforms.uPointerStrength.value = pointerStrengthCurrent;

      parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.08;
      parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.08;
      spotlightCurrent.y += (spotlightTarget.y - spotlightCurrent.y) * 0.08;
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
    <div ref={wrapperRef} className={styles.wrapper} aria-hidden="true">
      <div className={styles.globeAura} />
      <div ref={containerRef} className={styles.canvas} />
      <div className={styles.vignette} />
      <div className={styles.contentShield} />
    </div>
  );
}
