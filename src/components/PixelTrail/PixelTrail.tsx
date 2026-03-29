/* eslint-disable react/no-unknown-property */
import type { ComponentProps } from 'react';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { shaderMaterial, useTrailTexture } from '@react-three/drei';
import * as THREE from 'three';

import './PixelTrail.css';

export interface PixelTrailGooeyFilter {
  id?: string;
  strength?: number;
}

export interface PixelTrailProps {
  gridSize?: number;
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  easingFunction?: (x: number) => number;
  canvasProps?: Omit<ComponentProps<typeof Canvas>, 'children' | 'gl'>;
  glProps?: Partial<THREE.WebGLRendererParameters> & {
    powerPreference?: WebGLPowerPreference;
  };
  gooeyFilter?: PixelTrailGooeyFilter;
  /** Если false — без SVG goo-фильтра */
  gooeyEnabled?: boolean;
  gooStrength?: number;
  color?: string;
  className?: string;
}

const GooeyFilter = ({ id = 'goo-filter', strength = 10 }: { id?: string; strength?: number }) => (
  <svg className="goo-filter-container" aria-hidden>
    <defs>
      <filter id={id}>
        <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(1, 1),
    mouseTrail: null as THREE.Texture | null,
    gridSize: 100,
    pixelColor: new THREE.Color('#ffffff'),
  },
  `
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform vec3 pixelColor;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      float trail = texture2D(mouseTrail, gridUvCenter).r;

      gl_FragColor = vec4(pixelColor, trail);
    }
  `
);

function Scene({
  gridSize,
  trailSize,
  maxAge,
  interpolate,
  easingFunction,
  pixelColor,
}: {
  gridSize: number;
  trailSize: number;
  maxAge: number;
  interpolate: number;
  easingFunction: (x: number) => number;
  pixelColor: string;
}) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);

  const dotMaterial = useMemo(() => new DotMaterial(), []);

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: trailSize,
    maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || ((x: number) => x),
  });

  useLayoutEffect(() => {
    if (!trail) return;
    trail.minFilter = THREE.NearestFilter;
    trail.magFilter = THREE.NearestFilter;
    trail.wrapS = THREE.ClampToEdgeWrapping;
    trail.wrapT = THREE.ClampToEdgeWrapping;
  }, [trail]);

  const colorThree = useMemo(() => new THREE.Color(pixelColor), [pixelColor]);

  useLayoutEffect(() => {
    dotMaterial.uniforms.pixelColor.value.copy(colorThree);
  }, [dotMaterial, colorThree]);

  useLayoutEffect(() => {
    dotMaterial.uniforms.gridSize.value = gridSize;
  }, [dotMaterial, gridSize]);

  useLayoutEffect(() => {
    dotMaterial.uniforms.resolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
  }, [dotMaterial, size.width, size.height, viewport.dpr]);

  useLayoutEffect(() => {
    if (trail) dotMaterial.uniforms.mouseTrail.value = trail;
  }, [dotMaterial, trail]);

  /** Canvas под контентом (z-0) не получает pointer — трекаем курсор по window и даём UV как у R3F. */
  useEffect(() => {
    const pushUv = (clientX: number, clientY: number) => {
      const r = gl.domElement.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height));
      onMove({ uv: new THREE.Vector2(x, y) } as never);
    };

    const onPointerMove = (e: PointerEvent) => pushUv(e.clientX, e.clientY);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [gl, onMove]);

  const scale = Math.max(viewport.width, viewport.height) / 2;

  return (
    <mesh scale={[scale, scale, 1]}>
      <planeGeometry args={[2, 2]} />
      <primitive object={dotMaterial} attach="material" />
    </mesh>
  );
}

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = (x: number) => x,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true,
  },
  gooeyFilter,
  gooeyEnabled = true,
  gooStrength,
  color = '#ffffff',
  className = '',
}: PixelTrailProps) {
  const filterId = gooeyFilter?.id ?? 'goo-filter';
  const blurStrength = gooeyFilter?.strength ?? gooStrength ?? 2;
  const showGoo = gooeyEnabled;

  return (
    <>
      {showGoo && <GooeyFilter id={filterId} strength={blurStrength} />}
      <Canvas
        {...canvasProps}
        gl={glProps}
        className={`pixel-canvas ${className}`.trim()}
        style={{
          ...(canvasProps.style as object),
          ...(showGoo ? { filter: `url(#${filterId})` } : {}),
        }}
      >
        <Scene
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          pixelColor={color}
        />
      </Canvas>
    </>
  );
}
