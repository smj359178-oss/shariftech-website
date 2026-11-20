"use client";

// ===========================================================================
// صحنه سه‌بعدی هیرو: کره شبکه عصبی + icosahedron داخلی + اشکال شناور + Sparkles
// عملکرد بهینه: تمام هندسه‌ها با useMemo پیش‌محاسبه شده‌اند، بدون نور و سایه
// مقاوم در برابر خطا: اگر WebGL پشتیبانی نشود یا Canvas خطا بدهد،
// یک پس‌زمینه CSS سه‌بعدی زیبا جایگزین می‌شود (سایت هرگز خراب دیده نمی‌شود)
// ===========================================================================
import { Component, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const POINT_COUNT = 140;
const SPHERE_RADIUS = 2.1;
const LINK_DISTANCE = 0.85;

/** بررسی پشتیبانی WebGL در محیط اجرا */
function isWebGLAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.WebGLRenderingContext) return false;
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/**
 * تشخیص محیط کم‌توان / ترجیح کاربر برای بارگذاری صحنه سبک:
 *  • prefers-reduced-motion — کاربر حرکت را نمی‌خواهد (صحنه ۳بعدی مبتنی بر
 *    requestAnimationFrame است، پس باید کاملاً جایگزین شود)
 *  • Save-Data — اینترنت محدود یا داده کم
 *  • حافظه کم (deviceMemory ≤ 4) یا CPU ضعیف (hardwareConcurrency ≤ 2)
 *  • Media HUD رندر موبایل ضعیف (screen کوچک با رفرش پایین صحنه سنگین است)
 * در همه این موارد پس‌زمینه CSS استاتیک نمایش داده می‌شود — سایت هرگز
 * خراب یا سنگین دیده نمی‌شود.
 */
function shouldUseLightScene(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    if (nav.connection?.saveData) return true;
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 4) return true;
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2) return true;
    return false;
  } catch {
    return false;
  }
}

/** مرز خطا: اگر هر خطایی داخل Canvas رخ دهد، پس‌زمینه CSS نمایش داده می‌شود */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[HeroScene] WebGL scene failed, using CSS fallback:", error);
  }

  render() {
    if (this.state.failed) return <CssSphereFallback />;
    return this.props.children;
  }
}

/** پس‌زمینه جایگزین CSS: کره شبکه‌ای چرخان بدون نیاز به WebGL */
function CssSphereFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
      <div className="relative size-[560px] max-w-[92vw]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_65%)] blur-2xl" />
        <div className="absolute inset-[12%] rounded-full border border-emerald-400/25 opacity-70 [animation:spin_26s_linear_infinite] [border-style:dashed]" />
        <div className="absolute inset-[26%] rounded-full border border-amber-400/30 [animation:spin_18s_linear_infinite_reverse]" />
        <div className="absolute inset-[38%] rounded-full border border-teal-300/40 opacity-70 [border-style:dotted] [animation:spin_32s_linear_infinite]" />
        <div className="absolute inset-[44%] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.35),rgba(16,185,129,0.12)_60%,transparent_75%)] blur-md" />
      </div>
    </div>
  );
}

/** توزیع فیبوناچی نقاط روی کره (توزیع یکنواخت و پایدار) */
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * ringRadius * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ringRadius * radius;
  }
  return positions;
}

/** بافت دایره‌ای نرم برای اسپرایت نقاط (بدون فایل خارجی) */
function useDotTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.45, "rgba(255,255,255,0.85)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

/** کره شبکه عصبی: نقاط + خطوط اتصال بین نقاط نزدیک */
function NeuralSphere() {
  const positions = useMemo(() => fibonacciSphere(POINT_COUNT, SPHERE_RADIUS), []);
  const dotTexture = useDotTexture();

  const linePositions = useMemo(() => {
    const segments: number[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      for (let j = i + 1; j < POINT_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < LINK_DISTANCE) {
          segments.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2],
          );
        }
      }
    }
    return new Float32Array(segments);
  }, [positions]);

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          map={dotTexture}
          color="#34d399"
          transparent
          alphaTest={0.01}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#6ee7b7" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

/** هسته داخلی: icosahedron وایرفریم کهربایی با چرخش معکوس */
function InnerCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y -= delta * 0.3;
    meshRef.current.rotation.x += delta * 0.12;
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.15, 1]} />
      <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.5} />
    </mesh>
  );
}

/** سه شکل وایرفریم شناور اطراف کره */
function FloatingShapes() {
  return (
    <group>
      <Float speed={1.6} rotationIntensity={1.4} floatIntensity={1.8} position={[-2.8, 1.15, 0.2]}>
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.55} />
        </mesh>
      </Float>
      <Float speed={1.3} rotationIntensity={1.6} floatIntensity={1.5} position={[2.6, 0.85, 0.2]}>
        <mesh>
          <torusKnotGeometry args={[0.28, 0.09, 96, 12]} />
          <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.5} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2} position={[-2.35, -1.7, 0.5]}>
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshBasicMaterial color="#2dd4bf" wireframe transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

/** گروه با پارالاکس ملایم ماوس */
function ParallaxGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -state.pointer.y * 0.1, 0.05);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, state.pointer.x * 0.15, 0.05);
  });
  return <group ref={groupRef}>{children}</group>;
}

/** گروه با چرخش پیوسته و آرام */
function RotatingGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });
  return <group ref={groupRef}>{children}</group>;
}

/** صحنه کامل هیرو سه‌بعدی (پس‌زمینه شفاف) با fallback امن */
export default function HeroScene() {
  // بدون WebGL یا در محیط کم‌توان / ترجیح reduced-motion: پس‌زمینه CSS
  // جایگزین می‌شود تا تجربه کاربر همیشه روان و سبک باشد
  if (!isWebGLAvailable() || shouldUseLightScene()) {
    return <CssSphereFallback />;
  }

  return (
    <SceneErrorBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ParallaxGroup>
          <RotatingGroup>
            <NeuralSphere />
            <InnerCore />
            <FloatingShapes />
          </RotatingGroup>
          <Sparkles count={80} scale={10} size={2} speed={0.4} color="#34d399" opacity={0.5} />
        </ParallaxGroup>
      </Canvas>
    </SceneErrorBoundary>
  );
}
