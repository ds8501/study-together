"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { displayTopicTitle } from "@/lib/topic-title";

type Topic = {
  title: string;
  category: string;
  status: "Completed" | "In progress" | "Not started";
  difficulty: string;
  hours: number;
  day: number;
  owner: "Divya" | "Alex";
  description: string;
};
type Owner = Topic["owner"];
type SelectTopic = (topic: Topic) => void;

const colorFor = (status: Topic["status"]) => status === "Completed" ? "#55d6aa" : status === "In progress" ? "#ac91ff" : "#646b7f";

function Node({ topic, position, onSelect, reduceMotion }: { topic: Topic; position: [number, number, number]; onSelect: SelectTopic; reduceMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const color = colorFor(topic.status);

  useFrame(({ clock }) => {
    if (ref.current && !reduceMotion) {
      const pulse = topic.status === "In progress" ? 1 + Math.sin(clock.elapsedTime * 2.8) * 0.15 : 1;
      ref.current.scale.setScalar((hover ? 1.32 : 1) * pulse);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={() => onSelect(topic)}
        onPointerOver={event => { event.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[topic.status === "Completed" ? 0.105 : 0.09, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={topic.status === "Not started" ? 0.25 : hover ? 3.8 : 2.4} roughness={0.3} />
      </mesh>
      <mesh scale={hover ? 1.5 : 1}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={hover ? 0.14 : 0.06} />
      </mesh>
      {hover && <Text position={[0, 0.28, 0]} fontSize={0.105} color="white" anchorX="center" outlineWidth={0.008} outlineColor="#11131b" maxWidth={2}>{displayTopicTitle(topic.title)}</Text>}
    </group>
  );
}

function Path({ topics, owner, onSelect, reduceMotion }: { topics: Topic[]; owner: Owner; onSelect: SelectTopic; reduceMotion: boolean }) {
  const selected = useMemo(() => topics.filter(topic => topic.owner === owner).sort((a, b) => a.day - b.day), [topics, owner]);
  const points = useMemo(() => selected.map((_, index) => {
    const x = (index - (selected.length - 1) / 2) * 0.93;
    const y = Math.sin(index * 0.9) * 0.34 + (owner === "Divya" ? 0.48 : -0.48);
    return [x, y, Math.cos(index * 0.8) * 0.3] as [number, number, number];
  }), [selected, owner]);
  const line = useMemo(() => {
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, Math.max(points.length * 12, 24), 0.012, 5, false);
  }, [points]);

  return (
    <group>
      {line && <mesh geometry={line}><meshStandardMaterial color={owner === "Divya" ? "#8e77ff" : "#49bc9a"} emissive={owner === "Divya" ? "#6048d5" : "#279876"} emissiveIntensity={0.65} transparent opacity={0.68} /></mesh>}
      {points.map((point, index) => <Node key={`${owner}-${selected[index]?.title}`} topic={selected[index]} position={point} onSelect={onSelect} reduceMotion={reduceMotion} />)}
      {points.map((point, index) => <mesh key={`${owner}-star-${index}`} position={[point[0], point[1] + 0.25, point[2]]}><sphereGeometry args={[0.009, 8, 8]} /><meshBasicMaterial color="#d0c5ff" /></mesh>)}
    </group>
  );
}

function Dust({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(210 * 3);
    for (let index = 0; index < 210; index++) {
      data[index * 3] = ((index * 37) % 101) / 100 * 11 - 5.5;
      data[index * 3 + 1] = ((index * 53) % 97) / 96 * 5 - 2.5;
      data[index * 3 + 2] = ((index * 29) % 89) / 88 * 4 - 2;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current && !reduceMotion) ref.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#b8b1df" size={0.018} transparent opacity={0.62} sizeAttenuation /></points>;
}

export default function Universe({ topics, onSelect }: { topics: Topic[]; onSelect: SelectTopic }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <Canvas frameloop={reduceMotion ? "demand" : "always"} camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#11131b"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[-2, 2, 3]} intensity={22} color="#7960ed" />
      <pointLight position={[2, -1, 2]} intensity={12} color="#35bd9a" />
      <Suspense fallback={null}>
        <Dust reduceMotion={reduceMotion} />
        <Path topics={topics} owner="Divya" onSelect={onSelect} reduceMotion={reduceMotion} />
        <Path topics={topics} owner="Alex" onSelect={onSelect} reduceMotion={reduceMotion} />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={8} minPolarAngle={Math.PI * 0.32} maxPolarAngle={Math.PI * 0.68} autoRotate={!reduceMotion} autoRotateSpeed={0.22} enableDamping={!reduceMotion} dampingFactor={0.08} />
    </Canvas>
  );
}
