"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Cylinder, Torus } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  running: boolean;
  remaining: number;
  minutes: number;
  topicTitle?: string;
};

function FocusStation({ running, remaining, minutes, topicTitle }: Props) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const waveRef = useRef<THREE.Mesh>(null);

  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const progressRatio = minutes > 0 ? (minutes * 60 - remaining) / (minutes * 60) : 0;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * (running ? 0.8 : 0.2);
      const pulse = running ? 1 + Math.sin(t * 4) * 0.08 : 1;
      coreRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * (running ? 1.2 : 0.3);
    }
    if (waveRef.current) {
      waveRef.current.rotation.x = Math.PI / 2;
      const wavePulse = 1 + Math.sin(t * 3) * 0.15;
      waveRef.current.scale.setScalar(wavePulse);
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* 3D Circular Pedestal / Desk Mat */}
      <Cylinder args={[2.2, 2.4, 0.15, 48]} position={[0, -0.85, 0]}>
        <meshStandardMaterial color="#171626" roughness={0.6} metalness={0.4} />
      </Cylinder>
      <Torus args={[2.25, 0.02, 16, 64]} position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={running ? "#38bdf8" : "#8b5cf6"} emissive={running ? "#0284c7" : "#6d28d9"} emissiveIntensity={2} />
      </Torus>

      {/* 3D Holographic Timer Core */}
      <mesh ref={coreRef} position={[0, 0.2, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={running ? "#38bdf8" : "#8b5cf6"}
          emissive={running ? "#0284c7" : "#7c3aed"}
          emissiveIntensity={running ? 2.8 : 1.4}
          roughness={0.1}
          metalness={0.9}
        />
        <mesh scale={1.08}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      </mesh>

      {/* Orbiting Focus Progress Ring */}
      <Torus ref={ringRef} args={[1.5, 0.035, 16, 80]} position={[0, 0.2, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial
          color={running ? "#34d399" : "#a855f7"}
          emissive={running ? "#10b981" : "#9333ea"}
          emissiveIntensity={2.2}
          transparent
          opacity={0.85}
        />
      </Torus>

      {/* Soundwave Aura Ring */}
      <Torus ref={waveRef} args={[1.9, 0.015, 16, 64]} position={[0, -0.4, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={running ? 2 : 0.5}
          transparent
          opacity={running ? 0.6 : 0.2}
        />
      </Torus>

    </group>
  );
}

function AmbientDust({ running }: { running: boolean }) {
  const count = 120;
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = Math.random() * 4 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * (running ? 0.15 : 0.03);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={running ? "#7dd3fc" : "#c084fc"}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export default function StudyRoom3DDesk({ running, remaining, minutes, topicTitle }: Props) {
  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <div style={{ width: "100%", height: "290px", position: "relative", borderRadius: 16, overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, #151328 0%, #0d0c18 100%)", border: "1px solid #2b394d" }}>
      <Canvas
        camera={{ position: [0, 1.4, 4.5], fov: 46 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 4, 3]} intensity={running ? 30 : 16} color={running ? "#38bdf8" : "#8b5cf6"} />
        <pointLight position={[-3, 2, -2]} intensity={12} color="#ec4899" />
        <directionalLight position={[0, 5, 2]} intensity={1.2} />

        <Suspense fallback={null}>
          <FocusStation running={running} remaining={remaining} minutes={minutes} topicTitle={topicTitle} />
          <AmbientDust running={running} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!running}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 3}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* Floating Digital Clock Overlay */}
      <div style={{
        position: "absolute",
        top: "46%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        textAlign: "center",
        color: "#ffffff",
        fontFamily: "monospace",
        fontWeight: 900,
        textShadow: "0 0 20px rgba(0,0,0,0.95)",
        userSelect: "none",
        zIndex: 5
      }}>
        <div style={{
          fontSize: 32,
          letterSpacing: "1px",
          color: running ? "#38bdf8" : "#ffffff",
          textShadow: running ? "0 0 15px #38bdf8aa" : "none"
        }}>
          {formattedTime}
        </div>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: running ? "#34d399" : "#a1a1aa",
          marginTop: 2
        }}>
          {running ? "FOCUSING" : "READY"}
        </div>
      </div>
    </div>
  );
}
