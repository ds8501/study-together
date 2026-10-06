"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Cylinder } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

type Row = {
  name: string;
  completed: number;
  streak?: number;
  you?: boolean;
};

type Props = {
  rows: Row[];
};

function TrophyObject({ color = "#fbbf24", scale = 1 }: { color?: string; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.9;
    }
  });

  return (
    <group ref={meshRef} scale={scale}>
      {/* Cup bowl */}
      <Cylinder args={[0.3, 0.15, 0.45, 16]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} emissive={color} emissiveIntensity={0.6} />
      </Cylinder>
      {/* Stem */}
      <Cylinder args={[0.06, 0.06, 0.25, 16]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </Cylinder>
      {/* Base */}
      <Cylinder args={[0.22, 0.25, 0.12, 16]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </Cylinder>
      {/* Gem inside cup */}
      <mesh position={[0, 0.48, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function PodiumPedestals({ rows }: { rows: Row[] }) {
  const leader = rows[0];
  const second = rows[1];

  return (
    <group position={[0, -0.4, 0]}>
      {/* 1st Place Podium (Gold) - Center */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[0.8, 0.9, 1.4, 24]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#2d2215" roughness={0.4} metalness={0.7} />
        </Cylinder>
        <Cylinder args={[0.82, 0.82, 0.08, 24]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
        </Cylinder>

        {/* Floating 1st Trophy */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <group position={[0, 1.1, 0]}>
            <TrophyObject color="#fbbf24" scale={1.1} />
          </group>
        </Float>
      </group>

      {/* 2nd Place Podium (Silver / Violet) - Right */}
      <group position={[1.8, -0.3, -0.4]}>
        <Cylinder args={[0.7, 0.8, 1.0, 24]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#1e1c31" roughness={0.4} metalness={0.7} />
        </Cylinder>
        <Cylinder args={[0.72, 0.72, 0.06, 24]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={1.2} metalness={0.8} />
        </Cylinder>

        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
          <group position={[0, 0.75, 0]}>
            <TrophyObject color="#e2e8f0" scale={0.8} />
          </group>
        </Float>
      </group>
    </group>
  );
}

function CelebrationParticles() {
  const count = 160;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 8;
      p[i * 3 + 1] = Math.random() * 5 - 1;
      p[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#fbbf24" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function Leaderboard3DPodium({ rows }: Props) {
  const leader = rows[0];
  const second = rows[1];

  return (
    <div style={{ width: "100%", height: "270px", position: "relative", borderRadius: 16, overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, #201a33 0%, #0d0c18 100%)", border: "1px solid #2b394d" }}>
      <Canvas
        camera={{ position: [0, 1.2, 5.2], fov: 44 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[0, 4, 3]} intensity={25} color="#fbbf24" />
        <pointLight position={[-4, 2, 2]} intensity={14} color="#8b5cf6" />
        <pointLight position={[4, 2, 2]} intensity={14} color="#38bdf8" />

        <Suspense fallback={null}>
          <PodiumPedestals rows={rows} />
          <CelebrationParticles />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 2.8}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* #1 Champion Podium Badge */}
      <div style={{
        position: "absolute",
        top: "16%",
        left: "34%",
        transform: "translateX(-50%)",
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 5,
        textShadow: "0 2px 10px rgba(0,0,0,0.9)"
      }}>
        <span style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          color: "#18181b",
          fontWeight: 800,
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 12,
          marginBottom: 3
        }}>
          #1 CHAMPION
        </span>
        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13 }}>
          {leader ? leader.name : "Divya Singh"} {leader?.you && <small style={{ color: "#fef08a" }}> (YOU)</small>}
        </div>
        <div style={{ color: "#fcd34d", fontSize: 11, fontWeight: 600 }}>
          {leader ? `${leader.completed} topics completed` : "Mastery Leader"}
        </div>
      </div>

      {/* #2 Runner Up Podium Badge */}
      <div style={{
        position: "absolute",
        top: "26%",
        left: "72%",
        transform: "translateX(-50%)",
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 5,
        textShadow: "0 2px 10px rgba(0,0,0,0.9)"
      }}>
        <span style={{
          display: "inline-block",
          background: "#64748b",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 9,
          padding: "1px 6px",
          borderRadius: 10,
          marginBottom: 2
        }}>
          #2 RUNNER UP
        </span>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>
          {second ? second.name : "Study Partner"}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 10 }}>
          {second ? `${second.completed} topics` : "Challenger"}
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 8,
        right: 12,
        fontSize: 10,
        color: "#94a3b8",
        pointerEvents: "none",
        background: "rgba(15,14,28,0.7)",
        padding: "3px 8px",
        borderRadius: 6
      }}>
        ✨ Real-time 3D Championship Podium
      </div>
    </div>
  );
}
