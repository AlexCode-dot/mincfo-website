"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import styles from "./BeamBackground.module.scss";

type ThreeSceneObject = {
  geometry?: { dispose?: () => void };
  material?: { dispose?: () => void };
};

type ThreeUniforms = {
  time: { type: string; value: number };
  resolution: { type: string; value: { x: number; y: number } };
  uvOffsetY: { type: string; value: number };
};

type ThreeRenderer = {
  domElement: HTMLCanvasElement;
  setPixelRatio: (value: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  render: (scene: ThreeScene, camera: ThreeCamera) => void;
  dispose: () => void;
};

type ThreeCamera = {
  position: { z: number };
};

type ThreeScene = {
  add: (mesh: unknown) => void;
  traverse: (cb: (obj: ThreeSceneObject) => void) => void;
};

type ThreeNamespace = {
  Camera: new () => ThreeCamera;
  Scene: new () => ThreeScene;
  PlaneBufferGeometry: new (width: number, height: number) => unknown;
  Vector2: new () => { x: number; y: number };
  ShaderMaterial: new (options: {
    uniforms: ThreeUniforms;
    vertexShader: string;
    fragmentShader: string;
  }) => unknown;
  Mesh: new (geometry: unknown, material: unknown) => unknown;
  WebGLRenderer: new (options: { alpha: boolean; antialias: boolean }) => ThreeRenderer;
};

declare global {
  interface Window {
    THREE?: ThreeNamespace;
  }
}

type BeamBackgroundProps = {
  className?: string;
  extendBottom?: number;
  offsetY?: number;
  shaderOffsetY?: number;
};

export default function BeamBackground({
  className,
  extendBottom = 0,
  offsetY = 0,
  shaderOffsetY = 0,
}: BeamBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<{
    camera: ThreeCamera | null;
    scene: ThreeScene | null;
    renderer: ThreeRenderer | null;
    uniforms: ThreeUniforms | null;
    animationId: number | null;
    onResize: (() => void) | null;
  }>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
    onResize: null,
  });

  useEffect(() => {
    const cleanupScene = () => {
      const current = sceneRef.current;
      if (current.animationId) {
        window.cancelAnimationFrame(current.animationId);
      }
      if (current.onResize) {
        window.removeEventListener("resize", current.onResize);
      }
      if (current.scene) {
        current.scene.traverse((obj) => {
          if (obj.geometry?.dispose) obj.geometry.dispose();
          if (obj.material?.dispose) obj.material.dispose();
        });
      }
      if (current.renderer) {
        current.renderer.dispose();
      }
      sceneRef.current = {
        camera: null,
        scene: null,
        renderer: null,
        uniforms: null,
        animationId: null,
        onResize: null,
      };
    };

    const initThreeJS = () => {
      const container = containerRef.current;
      const THREE = window.THREE;
      if (!container || !THREE) return;

      cleanupScene();
      container.innerHTML = "";

      const camera = new THREE.Camera();
      camera.position.z = 1;

      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneBufferGeometry(2, 2);

      const uniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        uvOffsetY: { type: "f", value: shaderOffsetY },
      };

      const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

      const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float uvOffsetY;
      
      float random (in float x) {
        return fract(sin(x) * 1e4);
      }

      float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      varying vec2 vUv;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        uv.y += uvOffsetY;
        vec2 ringCenter = vec2(0.0, -0.16);
        float ringDist = length(uv - ringCenter);

        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

        float t = time * 0.06 + random(uv.x) * 0.4;
        float lineWidth = 0.0008;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) - ringDist);
          }
        }

        vec3 baseColor = vec3(color[2], color[1], color[0]);
        float intensity = clamp(max(baseColor.r, max(baseColor.g, baseColor.b)), 0.0, 1.0);
        vec3 primaryBlue = vec3(0.31, 0.27, 0.90) * intensity;
        vec3 finalColor = mix(baseColor, primaryBlue, 0.48);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const onResize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
      };

      onResize();
      window.addEventListener("resize", onResize, false);

      const animate = () => {
        sceneRef.current.animationId = window.requestAnimationFrame(animate);
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
      };

      sceneRef.current = {
        camera,
        scene,
        renderer,
        uniforms,
        animationId: null,
        onResize,
      };

      animate();
    };

    let script: HTMLScriptElement | null = null;
    if (window.THREE) {
      initThreeJS();
    } else {
      script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";
      script.onload = initThreeJS;
      document.head.appendChild(script);
    }

    return () => {
      cleanupScene();
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [shaderOffsetY]);

  const wrapperStyle: CSSProperties = {
    ...(extendBottom > 0 ? { bottom: `-${extendBottom}px` } : {}),
    ...(offsetY !== 0 ? { transform: `translateY(${offsetY}px)` } : {}),
  };

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      aria-hidden="true"
    >
      <div ref={containerRef} className={styles.shader} />
    </div>
  );
}
