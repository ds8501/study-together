"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Topic = {
  id?: string | number;
  title: string;
  category: string;
  status: "Completed" | "In progress" | "Not started";
  difficulty: string;
  hours: number;
  day: number;
  owner: "Divya" | "Alex";
  description: string;
};

type Props = {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
};

function MilestoneStar({ topic, position, onSelect, onHover }: { topic: Topic; position: [number, number, number]; onSelect: (t: Topic) => void; onHover: (t: Topic | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isDone = topic.status === "Completed";
  const isInProgress = topic.status === "In progress";
  const color = isDone ? "#34d399" : isInProgress ? "#a855f7" : "#64748b";

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = isInProgress ? 1 + Math.sin(clock.getElapsedTime() * 3.5) * 0.15 : 1;
      meshRef.current.scale.setScalar((hovered ? 1.4 : 1) * pulse);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(topic)}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(topic);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[isDone ? 0.15 : 0.12, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3.5 : isDone ? 2.4 : isInProgress ? 2.0 : 0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Halo glow */}
      <mesh scale={hovered ? 2.0 : 1.4}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.25 : 0.08} />
      </mesh>
    </group>
  );
}

function ConstellationPath({ topics, onSelect, onHover }: Props & { onHover: (t: Topic | null) => void }) {
  const mine = topics.filter(t => t.owner === "Divya").sort((a, b) => a.day - b.day);

  const points = useMemo(() => {
    return mine.map((_, i) => {
      const x = (i - (mine.length - 1) / 2) * 1.1;
      const y = Math.sin(i * 0.9) * 0.6;
      const z = Math.cos(i * 0.8) * 0.5;
      return [x, y, z] as [number, number, number];
    });
  }, [mine]);

  const tubeGeometry = useMemo(() => {
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(points.length * 16, 32), 0.02, 8, false);
  }, [points]);

  return (
    <group>
      {tubeGeometry && (
        <mesh geometry={tubeGeometry}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#7c3aed"
            emissiveIntensity={1.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {points.map((p, i) => (
        <MilestoneStar key={mine[i]?.id ?? mine[i]?.title ?? i} topic={mine[i]} position={p} onSelect={onSelect} onHover={onHover} />
      ))}
    </group>
  );
}

function SpaceDust() {
  const count = 180;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#e0e7ff" transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

export default function Roadmap3DGalaxy({ topics, onSelect }: Props) {
  const [hoveredTopic, setHoveredTopic] = useState<Topic | null>(null);

  return (
    <div style={{ width: "100%", height: "240px", position: "relative", borderRadius: 16, overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, #17152b 0%, #0d0c18 100%)", border: "1px solid #2b394d", marginBottom: 20 }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[-4, 3, 3]} intensity={22} color="#8b5cf6" />
        <pointLight position={[4, -2, 2]} intensity={18} color="#34d399" />

        <Suspense fallback={null}>
          <ConstellationPath topics={topics} onSelect={onSelect} onHover={setHoveredTopic} />
          <SpaceDust />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.25}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.4}
          dampingFactor={0.06}
        />
      </Canvas>

      {hoveredTopic && (
        <div style={{
          position: "absolute",
          top: 12,
          left: 14,
          background: "rgba(15, 14, 28, 0.95)",
          border: `1px solid ${hoveredTopic.status === "Completed" ? "#34d399" : hoveredTopic.status === "In progress" ? "#a855f7" : "#64748b"}`,
          borderRadius: 8,
          padding: "6px 12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          color: "#fff",
          fontSize: 11,
          pointerEvents: "none",
          zIndex: 10,
          backdropFilter: "blur(8px)"
        }}>
          <div style={{ fontWeight: 700 }}>{hoveredTopic.title}</div>
          <div style={{ fontSize: 9, color: "#cbd5e1" }}>Day {hoveredTopic.day} · {hoveredTopic.status} · {hoveredTopic.category}</div>
        </div>
      )}

      <div style={{
        position: "absolute",
        bottom: 10,
        right: 14,
        fontSize: 10,
        color: "#94a3b8",
        pointerEvents: "none",
        background: "rgba(15,14,28,0.7)",
        padding: "3px 8px",
        borderRadius: 6
      }}>
        ✨ Interactive 3D Galaxy · Drag to rotate · Click node to inspect
      </div>
    </div>
  );
}
