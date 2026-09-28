import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Lightformer, MeshReflectorMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import logo from "@/assets/logo-factum.png.asset.json";
import type { Carro, Peca } from "./cars";

const CAR_LEN = 4.2;

function acabamentoDe(c: THREE.Color, meshName: string, matName: string): THREE.MeshPhysicalMaterial {
  const n = (matName + " " + meshName).toLowerCase();
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  const base = { envMapIntensity: 1.2, transparent: true };
  if (/eixo|steel|aço|satin/.test(n) || (hsl.s < 0.1 && hsl.l > 0.3 && hsl.l < 0.5))
    return new THREE.MeshPhysicalMaterial({ ...base, color: "#b8c0c8", metalness: 1, roughness: 0.22 });
  if (/blue/.test(n) || (hsl.s > 0.4 && hsl.h > 0.55 && hsl.h < 0.72))
    return new THREE.MeshPhysicalMaterial({ ...base, color: /blue/.test(n) ? "#0d2f7a" : c.clone().multiplyScalar(0.75), metalness: 0.6, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04 });
  if (/black/.test(n) || hsl.l < 0.22)
    return new THREE.MeshPhysicalMaterial({ ...base, color: "#0b0c10", metalness: 0.3, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  return new THREE.MeshPhysicalMaterial({ ...base, color: hsl.l > 0.8 ? "#f4f4f0" : c, metalness: 0, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.15 });
}

function useCarModel(carro: Carro) {
  const Loader = (carro.formato === "fbx" ? FBXLoader : GLTFLoader) as typeof GLTFLoader;
  const loaded = useLoader(Loader, carro.arquivoModelo) as unknown as THREE.Object3D & { scene?: THREE.Object3D };
  return useMemo(() => {
    const src = (loaded.scene ?? loaded) as THREE.Object3D;
    const root = src.clone(true);
    root.rotation.set(...carro.rotacao);
    const wrap = new THREE.Group();
    wrap.add(root);
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = ([] as THREE.Material[]).concat(m.material);
      const next = mats.map((mm) => acabamentoDe((mm as THREE.MeshStandardMaterial).color ?? new THREE.Color("#fff"), m.name, mm.name || ""));
      m.material = Array.isArray(m.material) ? next : next[0];
      m.castShadow = true;
      meshes.push(m);
    });
    wrap.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrap);
    const size = box.getSize(new THREE.Vector3());
    const s = CAR_LEN / Math.max(size.x, size.z);
    wrap.scale.setScalar(s);
    wrap.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(wrap);
    const c = b2.getCenter(new THREE.Vector3());
    wrap.position.set(-c.x, -b2.min.y, -c.z);
    const holder = new THREE.Group();
    holder.add(wrap);
    return { holder, meshes };
  }, [loaded, carro]);
}

type Props = {
  carro: Carro;
  selecionada: Peca | null;
  onSelect: (p: Peca | null) => void;
  onHover: (p: Peca | null, x: number, y: number) => void;
  onReady: () => void;
};

export function CarModel({ carro, selecionada, onSelect, onHover, onReady, controls }: Props & { controls: React.RefObject<CameraControls | null> }) {
  const { holder, meshes } = useCarModel(carro);
  const spin = useRef<THREE.Group>(null);
  const [hover, setHover] = useState<Peca | null>(null);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const meshToPeca = useMemo(() => {
    const map = new Map<THREE.Object3D, Peca>();
    for (const p of carro.pecas) {
      for (const m of meshes) {
        if (p.meshes.includes(m.name) && !map.has(m)) {
          map.set(m, p);
        }
      }
    }
    return map;
  }, [carro, meshes]);

  useEffect(() => { onReady(); }, [holder, onReady]);

  // câmera: aproxima da peça selecionada ou volta à vista geral
  useEffect(() => {
    const cc = controls.current;
    if (!cc) return;
    if (!selecionada) {
      cc.setLookAt(5.2, 2.4, 5.6, 0, 0.35, 0, true);
      return;
    }
    if (spin.current) spin.current.updateMatrixWorld(true);
    const box = new THREE.Box3();
    meshes.forEach((m) => selecionada.meshes.includes(m.name) && box.expandByObject(m));
    if (!box.isEmpty()) {
      const c = box.getCenter(new THREE.Vector3());
      const r = Math.max(box.getSize(new THREE.Vector3()).length(), 0.6);
      const dir = new THREE.Vector3(1, 0.6, 1.1).normalize();
      const pos = c.clone().addScaledVector(dir, r * 1.9 + 0.8);
      cc.setLookAt(pos.x, Math.max(pos.y, 0.25), pos.z, c.x, c.y, c.z, true);
    }
  }, [selecionada, meshes, controls]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    if (spin.current && !selecionada && !reduce) spin.current.rotation.y += d * 0.18;
    const t = state.clock.elapsedTime;
    for (const m of meshes) {
      const p = meshToPeca.get(m);
      const isSelectedMesh = selecionada ? selecionada.meshes.includes(m.name) : false;
      const dim = selecionada && !isSelectedMesh;
      const isH = p && hover?.id === p.id;
      const isS = isSelectedMesh;
      for (const mat of ([] as THREE.MeshPhysicalMaterial[]).concat(m.material as THREE.MeshPhysicalMaterial)) {
        const targetOp = dim ? 0.12 : 1;
        mat.opacity += (targetOp - mat.opacity) * (1 - Math.exp(-8 * d));
        mat.depthWrite = mat.opacity > 0.9;
        mat.emissive.set("#2a4fd4");
        mat.emissiveIntensity = isH || isS ? 0.35 + Math.sin(t * 4) * 0.1 : p && !selecionada ? 0.03 + Math.sin(t * 1.6) * 0.03 : 0;
      }
    }
  });

  const pecaDe = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    for (const hit of e.intersections) {
      const p = meshToPeca.get(hit.object);
      if (!p) continue;
      if (selecionada && p.id !== selecionada.id) continue;
      return p;
    }
    return null;
  };

  return (
    <group ref={spin}>
      <primitive
        object={holder}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const p = pecaDe(e);
          setHover(p);
          onHover(p, e.nativeEvent.clientX, e.nativeEvent.clientY);
          document.body.style.cursor = p ? "pointer" : "grab";
        }}
        onPointerOut={() => { setHover(null); onHover(null, 0, 0); document.body.style.cursor = ""; }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.delta > 6) return;
          const p = pecaDe(e);
          if (p) onSelect(p);
        }}
      />
    </group>
  );
}

function LogoWall() {
  const tex = useTexture(logo.url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return (
    <group position={[0, 0, -6]}>
      {/* parede */}
      <mesh position={[0, 3, -0.05]} receiveShadow>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#050b22" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* painel pit-wall */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[9, 3.8, 0.08]} />
        <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.6, 0.05]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
      {/* faixas de luz */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 2.6 + s * 1.92, 0.06]}>
          <boxGeometry args={[9, 0.04, 0.02]} />
          <meshBasicMaterial color="#4d74ff" toneMapped={false} />
        </mesh>
      ))}
      {[-7.5, 7.5].map((x) => (
        <mesh key={x} position={[x, 2.6, 0.02]}>
          <boxGeometry args={[0.05, 3.8, 0.02]} />
          <meshBasicMaterial color="#8fa8ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function GarageScene(props: Props) {
  const controls = useRef<CameraControls>(null);
  return (
    <>
      <color attach="background" args={["#02061a"]} />
      <fog attach="fog" args={["#02061a", 10, 26]} />
      <ambientLight intensity={0.15} />
      <spotLight position={[0, 7, 1]} angle={0.45} penumbra={0.8} intensity={120} castShadow shadow-mapSize={[1024, 1024]} color="#ffffff" />
      <spotLight position={[-5, 4, 4]} angle={0.5} penumbra={1} intensity={45} color="#9fb4ff" />
      <spotLight position={[5, 3, -3]} angle={0.5} penumbra={1} intensity={40} color="#4d74ff" />

      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.5} position={[-5, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1, 1]} />
        <Lightformer intensity={1.5} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 1, 1]} />
        <Lightformer intensity={2} color="#4d74ff" position={[0, 1, -6]} scale={[12, 1.5, 1]} />
        <Lightformer intensity={0.8} position={[0, 1, 6]} scale={[10, 3, 1]} />
      </Environment>

      <CarModel {...props} controls={controls} />

      <ContactShadows position={[0, 0.005, 0]} opacity={0.85} scale={10} blur={2.2} far={2} resolution={512} color="#000000" />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0a0f22"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>
      {/* marcações do box no piso */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]}>
        <ringGeometry args={[3.2, 3.24, 96]} />
        <meshBasicMaterial color="#2a4fd4" transparent opacity={0.7} toneMapped={false} />
      </mesh>

      <LogoWall />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={1.2}
        maxDistance={11}
        maxPolarAngle={Math.PI / 2.08}
        smoothTime={0.6}
      />
    </>
  );
}
