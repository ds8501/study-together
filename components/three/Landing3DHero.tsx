"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Torus, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function CelestialCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.35;
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.15) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.25;
      ring2Ref.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Pulsing Holographic Orb */}
      <Sphere ref={meshRef} args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.8}
          distort={0.35}
          speed={2.2}
          transparent
          opacity={0.88}
        />
      </Sphere>

      {/* Outer Orbiting Energy Rings */}
      <Torus ref={ring1Ref} args={[1.8, 0.03, 16, 100]}>
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={2.5}
          transparent
          opacity={0.75}
        />
      </Torus>

      <Torus ref={ring2Ref} args={[2.3, 0.025, 16, 100]}>
        <meshStandardMaterial
          color="#ec4899"
          emissive="#db2777"
          emissiveIntensity={2.2}
          transparent
          opacity={0.65}
        />
      </Torus>
    </group>
  );
}

function FloatingStudyCubes() {
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      position: [
        (Math.sin(i * 1.3) * 2.8) + (Math.random() - 0.5) * 0.5,
        ((i - 7) * 0.35) + Math.cos(i) * 0.4,
        (Math.cos(i * 1.3) * 2.5) + (Math.random() - 0.5) * 0.5
      ] as [number, number, number],
      scale: 0.12 + (i % 3) * 0.07,
      color: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#38bdf8" : "#34d399",
      speed: 0.8 + (i % 4) * 0.3
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((item, idx) => (
        <Float key={idx} speed={item.speed} rotationIntensity={1.5} floatIntensity={1.8}>
          <mesh position={item.position} rotation={[idx * 0.4, idx * 0.3, 0]}>
            <boxGeometry args={[item.scale, item.scale * 1.3, item.scale * 0.3]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={1.2}
              roughness={0.25}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function CosmicDust() {
  const count = 320;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#c4b5fd"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export default function Landing3DHero({ className = "" }: { className?: string }) {
  return (
    <div className={`landing-3d-canvas-wrap ${className}`} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 46 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[5, 4, 4]} intensity={25} color="#8b5cf6" />
        <pointLight position={[-5, -3, 3]} intensity={18} color="#38bdf8" />
        <directionalLight position={[0, 6, 2]} intensity={1.5} color="#ffffff" />

        <Suspense fallback={null}>
          <CelestialCore />
          <FloatingStudyCubes />
          <CosmicDust />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.3}
          autoRotate
          autoRotateSpeed={0.4}
          dampingFactor={0.06}
        />
      </Canvas>
    </div>
  );
}
