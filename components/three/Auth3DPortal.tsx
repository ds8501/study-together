"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Torus } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function PortalRings() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.2;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.3;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.15;
    if (groupRef.current) groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* Central dimensional sphere */}
      <Sphere args={[1.3, 32, 32]}>
        <meshStandardMaterial
          color="#311042"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          wireframe
        />
      </Sphere>

      {/* Outer portal rings */}
      <Torus ref={ring1Ref} args={[2.2, 0.02, 16, 80]}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
      </Torus>
      <Torus ref={ring2Ref} args={[2.7, 0.015, 16, 80]} rotation={[Math.PI / 4, 0, 0]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </Torus>
      <Torus ref={ring3Ref} args={[3.2, 0.01, 16, 80]} rotation={[-Math.PI / 4, 0, 0]}>
        <meshBasicMaterial color="#ec4899" transparent opacity={0.4} />
      </Torus>
    </group>
  );
}

function PortalParticles() {
  const count = 240;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#c4b5fd" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

export default function Auth3DPortal() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.65 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 2]} intensity={18} color="#8b5cf6" />
        <pointLight position={[-3, -3, 2]} intensity={14} color="#38bdf8" />

        <Suspense fallback={null}>
          <PortalRings />
          <PortalParticles />
        </Suspense>
      </Canvas>
    </div>
  );
}
