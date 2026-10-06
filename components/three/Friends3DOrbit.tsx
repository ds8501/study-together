"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Torus } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  currentName: string;
  friendName: string;
  memberCount: number;
};

function DualOrbit({ currentName, friendName, memberCount }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Shared Gravitational Orbit Ring */}
      <Torus ref={ringRef} args={[2.0, 0.02, 16, 100]} rotation={[Math.PI / 2.3, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={2} transparent opacity={0.6} />
      </Torus>

      <group ref={groupRef}>
        {/* User Planet (Divya - Purple Star) */}
        <group position={[-1.7, 0, 0]}>
          <Sphere args={[0.55, 32, 32]}>
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#7c3aed"
              emissiveIntensity={2.2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
          <Torus args={[0.85, 0.02, 16, 48]} rotation={[Math.PI / 3, 0, 0]}>
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1.5} />
          </Torus>
        </group>

        {/* Energy Beam between the two stars */}
        <mesh ref={beamRef} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 3.4, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>

        {/* Partner Planet (Alex - Cyan/Emerald Star) */}
        <group position={[1.7, 0, 0]}>
          <Sphere args={[memberCount > 1 ? 0.52 : 0.4, 32, 32]}>
            <meshStandardMaterial
              color={memberCount > 1 ? "#34d399" : "#64748b"}
              emissive={memberCount > 1 ? "#059669" : "#334155"}
              emissiveIntensity={memberCount > 1 ? 2.2 : 0.8}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
          {memberCount > 1 && (
            <Torus args={[0.8, 0.02, 16, 48]} rotation={[-Math.PI / 3, 0, 0]}>
              <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={1.5} />
            </Torus>
          )}
        </group>
      </group>
    </group>
  );
}

function SyncDust() {
  const count = 100;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.0 + Math.random() * 2.2;
      p[i * 3] = Math.cos(angle) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      p[i * 3 + 2] = Math.sin(angle) * r;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a5f3fc" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Friends3DOrbit({ currentName, friendName, memberCount }: Props) {
  return (
    <div style={{ width: "100%", height: "260px", position: "relative", borderRadius: 16, overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, #17152b 0%, #0d0c18 100%)", border: "1px solid #2b394d" }}>
      <Canvas
        camera={{ position: [0, 1.8, 5.0], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[-3, 3, 3]} intensity={20} color="#8b5cf6" />
        <pointLight position={[3, 3, 3]} intensity={20} color="#34d399" />

        <Suspense fallback={null}>
          <DualOrbit currentName={currentName} friendName={friendName} memberCount={memberCount} />
          <SyncDust />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 3}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* User Badge - Left */}
      <div style={{
        position: "absolute",
        top: 14,
        left: 16,
        pointerEvents: "none",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(15,14,28,0.85)",
        border: "1px solid rgba(139,92,246,0.4)",
        borderRadius: 20,
        padding: "4px 12px 4px 6px",
        backdropFilter: "blur(6px)"
      }}>
        <span style={{
          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 10
        }}>
          YOU
        </span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{currentName}</span>
      </div>

      {/* Partner Badge - Right */}
      <div style={{
        position: "absolute",
        top: 14,
        right: 16,
        pointerEvents: "none",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(15,14,28,0.85)",
        border: `1px solid ${memberCount > 1 ? "rgba(16,185,129,0.4)" : "rgba(100,116,139,0.4)"}`,
        borderRadius: 20,
        padding: "4px 12px 4px 6px",
        backdropFilter: "blur(6px)"
      }}>
        <span style={{
          background: memberCount > 1 ? "#10b981" : "#475569",
          color: "#fff",
          fontWeight: 800,
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 10
        }}>
          {memberCount > 1 ? "PARTNER" : "WAITING"}
        </span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{friendName}</span>
      </div>

      {/* Sync Status - Bottom Center */}
      <div style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 10,
        color: "#94a3b8",
        pointerEvents: "none",
        background: "rgba(15,14,28,0.7)",
        padding: "3px 10px",
        borderRadius: 6
      }}>
        {memberCount > 1 ? "✨ Gravitational Study Sync Active" : "Invite your partner with your workspace code"}
      </div>
    </div>
  );
}
