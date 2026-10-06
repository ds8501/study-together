"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Dodecahedron, Torus } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

type Props = {
  name: string;
  workspaceName: string;
  streak: number;
};

function IdentityCore({ name, workspaceName, streak }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.4;
      ringRef.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.2) * 0.1;
    }
  });

  const initials = name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "SP";

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Polyhedron Core */}
      <Dodecahedron ref={meshRef} args={[1.1, 0]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={1.8}
          metalness={0.8}
          roughness={0.2}
        />
        <mesh scale={1.05}>
          <dodecahedronGeometry args={[1.1, 0]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      </Dodecahedron>

      {/* Orbiting Security & Streak Ring */}
      <Torus ref={ringRef} args={[1.65, 0.03, 16, 64]}>
        <meshStandardMaterial color="#ec4899" emissive="#db2777" emissiveIntensity={2} />
      </Torus>

    </group>
  );
}

export default function Settings3DIdentity({ name, workspaceName, streak }: Props) {
  const initials = name.split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ width: "100%", height: "230px", position: "relative", borderRadius: 16, overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, #1c1830 0%, #0d0c18 100%)", border: "1px solid #2b394d", marginBottom: 20 }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[3, 3, 3]} intensity={20} color="#8b5cf6" />
        <pointLight position={[-3, -2, 2]} intensity={16} color="#ec4899" />

        <Suspense fallback={null}>
          <IdentityCore name={name} workspaceName={workspaceName} streak={streak} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.3}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* 3D Center Identity Badge */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        textAlign: "center",
        color: "#fff",
        fontWeight: 900,
        textShadow: "0 0 16px rgba(0,0,0,0.9)",
        userSelect: "none",
        zIndex: 5
      }}>
        <div style={{ fontSize: 24, letterSpacing: "1px" }}>{initials}</div>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1px", color: "#fcd34d" }}>
          🔥 {streak}d STREAK
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
        ✨ Holographic Member ID · {workspaceName}
      </div>
    </div>
  );
}
