"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Icosahedron, Torus } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  progress: number;
  completed: number;
  inProgress: number;
  remaining: number;
  streak: number;
};

function MasteryCore({ progress, completed, inProgress }: { progress: number; completed: number; inProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const primaryColor = progress >= 100 ? "#10b981" : progress > 50 ? "#8b5cf6" : "#38bdf8";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.4;
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      meshRef.current.scale.setScalar((hovered ? 1.15 : 1) * pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.5;
      ringRef.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.3) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central 3D Icosahedron Core */}
      <Icosahedron
        ref={meshRef}
        args={[1.15, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={hovered ? 2.5 : 1.6}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
        {/* Wireframe outer shell */}
        <mesh scale={1.08}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
        </mesh>
      </Icosahedron>

      {/* Orbiting Mastery Ring */}
      <Torus ref={ringRef} args={[1.75, 0.035, 16, 80]}>
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </Torus>

      {/* Orbiting Satellite Milestones */}
      {Array.from({ length: Math.min(8, completed + inProgress + 1) }).map((_, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const radius = 2.1;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isDone = idx < completed;
        const nodeColor = isDone ? "#34d399" : "#a78bfa";

        return (
          <Float key={idx} speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
            <mesh position={[x, Math.sin(idx) * 0.4, z]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={1.8}
              />
            </mesh>
          </Float>
        );
      })}

    </group>
  );
}

function OrbitDust() {
  const points = useMemo(() => {
    const p = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 1.5;
      p[i * 3] = Math.cos(theta) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      p[i * 3 + 2] = Math.sin(theta) * r;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color="#c084fc" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Dashboard3DCore({ progress, completed, inProgress, remaining, streak }: Props) {
  return (
    <div style={{ width: "100%", height: "260px", position: "relative", borderRadius: 16, overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[3, 3, 3]} intensity={18} color="#8b5cf6" />
        <pointLight position={[-3, -2, 2]} intensity={14} color="#38bdf8" />

        <Suspense fallback={null}>
          <MasteryCore progress={progress} completed={completed} inProgress={inProgress} />
          <OrbitDust />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          dampingFactor={0.05}
        />
      </Canvas>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        textAlign: "center",
        color: "#fff",
        fontWeight: 800,
        textShadow: "0 0 16px rgba(0,0,0,0.9)",
        userSelect: "none",
        zIndex: 5
      }}>
        <span style={{ fontSize: 26, display: "block", letterSpacing: "-1px" }}>{progress}%</span>
        <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.85 }}>Mastery</span>
      </div>
    </div>
  );
}
