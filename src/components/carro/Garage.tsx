import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Lightformer, MeshReflectorMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Carro, Peca } from "./cars";

function createProceduralFB06(): { holder: THREE.Group; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  const meshes: THREE.Mesh[] = [];

  const addMesh = (
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    name: string,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1]
  ) => {
    const m = new THREE.Mesh(geom, mat);
    m.name = name;
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    meshes.push(m);
    return m;
  };

  // 1. Chassi & Sidepods (empty_4) - Drop shape blue metallic body
  const bodyGeom = new THREE.ConeGeometry(0.55, 3.8, 32);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: "#0d2f7a",
    metalness: 0.65,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  addMesh(bodyGeom, bodyMat, "empty_4", [0, 0.45, 0], [Math.PI / 2, 0, 0], [0.85, 1, 0.65]);

  // Cockpit hood & nose bridge
  const noseGeom = new THREE.CylinderGeometry(0.12, 0.45, 1.8, 24);
  addMesh(noseGeom, bodyMat.clone(), "empty_4", [0, 0.42, 1.2], [Math.PI / 2, 0, 0], [0.9, 1, 0.6]);

  // 2. Front Wing (empty_2, empty_22)
  const fwMat = new THREE.MeshPhysicalMaterial({ color: "#1e1e1e", metalness: 0.3, roughness: 0.3, clearcoat: 0.8 });
  const fwMainGeom = new THREE.BoxGeometry(2.1, 0.06, 0.45);
  addMesh(fwMainGeom, fwMat, "empty_2", [0, 0.22, 1.85]);
  const epGeom = new THREE.BoxGeometry(0.04, 0.35, 0.55);
  addMesh(epGeom, fwMat.clone(), "empty_22", [-1.05, 0.28, 1.85]);
  addMesh(epGeom, fwMat.clone(), "empty_22", [1.05, 0.28, 1.85]);

  // 3. Rear Wing (empty_21)
  const rwMat = new THREE.MeshPhysicalMaterial({ color: "#1e1e1e", metalness: 0.3, roughness: 0.3, clearcoat: 0.8 });
  const rwMainGeom = new THREE.BoxGeometry(1.8, 0.06, 0.4);
  addMesh(rwMainGeom, rwMat, "empty_21", [0, 0.95, -1.55]);
  const rwEpGeom = new THREE.BoxGeometry(0.04, 0.6, 0.5);
  addMesh(rwEpGeom, rwMat.clone(), "empty_21", [-0.9, 0.85, -1.55]);
  addMesh(rwEpGeom, rwMat.clone(), "empty_21", [0.9, 0.85, -1.55]);

  // 4. Eixos (empty_6, empty_8) - Satin steel
  const axleMat = new THREE.MeshPhysicalMaterial({ color: "#b4bcc6", metalness: 1, roughness: 0.18 });
  const axleGeom = new THREE.CylinderGeometry(0.035, 0.035, 2.0, 16);
  addMesh(axleGeom, axleMat, "empty_6", [0, 0.26, 1.3], [0, 0, Math.PI / 2]);
  addMesh(axleGeom, axleMat.clone(), "empty_8", [0, 0.26, -1.1], [0, 0, Math.PI / 2]);

  // 5. Rodas com Hubcaps (empty_11, empty_12, empty_13, empty_14) - ABS White
  const wheelMat = new THREE.MeshPhysicalMaterial({ color: "#f0f0ed", metalness: 0.05, roughness: 0.35, clearcoat: 0.5 });
  const wheelGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 28);
  addMesh(wheelGeom, wheelMat, "empty_11", [-1.02, 0.26, 1.3], [0, 0, Math.PI / 2]);
  addMesh(wheelGeom, wheelMat.clone(), "empty_12", [1.02, 0.26, 1.3], [0, 0, Math.PI / 2]);
  addMesh(wheelGeom, wheelMat.clone(), "empty_13", [-1.02, 0.26, -1.1], [0, 0, Math.PI / 2]);
  addMesh(wheelGeom, wheelMat.clone(), "empty_14", [1.02, 0.26, -1.1], [0, 0, Math.PI / 2]);

  // 6. Halo (empty_3) - Nylon Black
  const haloMat = new THREE.MeshPhysicalMaterial({ color: "#111218", metalness: 0.4, roughness: 0.35, clearcoat: 0.9 });
  const haloGeom = new THREE.TorusGeometry(0.26, 0.04, 16, 32, Math.PI);
  addMesh(haloGeom, haloMat, "empty_3", [0, 0.65, 0.1], [Math.PI / 2 + 0.2, 0, 0]);

  // 7. CO2 Chamber (empty_7) - Metallic silver canister
  const co2Mat = new THREE.MeshPhysicalMaterial({ color: "#8a929e", metalness: 0.9, roughness: 0.25 });
  const co2Geom = new THREE.CylinderGeometry(0.16, 0.16, 1.1, 24);
  addMesh(co2Geom, co2Mat, "empty_7", [0, 0.48, -1.0], [Math.PI / 2, 0, 0]);

  // 8. Assoalho & Difusor (empty_23)
  const floorMat = new THREE.MeshPhysicalMaterial({ color: "#071b48", metalness: 0.5, roughness: 0.3 });
  const floorGeom = new THREE.BoxGeometry(1.4, 0.04, 3.2);
  addMesh(floorGeom, floorMat, "empty_23", [0, 0.12, 0.1]);

  // 9. Capacete (empty_5)
  const helmMat = new THREE.MeshPhysicalMaterial({ color: "#e8e6dc", metalness: 0.1, roughness: 0.3, clearcoat: 1 });
  const helmGeom = new THREE.SphereGeometry(0.17, 24, 24);
  addMesh(helmGeom, helmMat, "empty_5", [0, 0.62, 0.3]);

  const holder = new THREE.Group();
  holder.add(group);
  return { holder, meshes };
}

function useCarModel(carro: Carro) {
  return useMemo(() => {
    return createProceduralFB06();
  }, [carro]);
}

type Props = {
  carro: Carro;
  selecionada: Peca | null;
  onSelect: (p: Peca | null) => void;
  onHover: (p: Peca | null, x: number, y: number) => void;
  onReady: () => void;
};

export function CarModel({
  carro,
  selecionada,
  onSelect,
  onHover,
  onReady,
  controls,
}: Props & { controls: React.RefObject<CameraControls | null> }) {
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

  useEffect(() => {
    onReady();
  }, [holder, onReady]);

  // Câmera: aproxima da peça selecionada ou volta à vista geral
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
        const targetOp = dim ? 0.15 : 1;
        mat.opacity += (targetOp - mat.opacity) * (1 - Math.exp(-8 * d));
        mat.depthWrite = mat.opacity > 0.9;
        mat.emissive.set("#2a4fd4");
        mat.emissiveIntensity =
          isH || isS ? 0.45 + Math.sin(t * 4) * 0.2 : p && !selecionada ? 0.03 + Math.sin(t * 1.6) * 0.03 : 0;
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
        onPointerOut={() => {
          setHover(null);
          onHover(null, 0, 0);
          document.body.style.cursor = "";
        }}
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
  const tex = useTexture("/images/logo-factum.png");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return (
    <group position={[0, 0, -6]}>
      {/* parede */}
      <mesh position={[0, 3, -0.05]} receiveShadow>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#011039" roughness={0.9} metalness={0.1} />
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
          <meshBasicMaterial color="#2a4fd4" toneMapped={false} />
        </mesh>
      ))}
      {[-7.5, 7.5].map((x) => (
        <mesh key={x} position={[x, 2.6, 0.02]}>
          <boxGeometry args={[0.05, 3.8, 0.02]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function GarageScene(props: Props) {
  const controls = useRef<CameraControls>(null);
  return (
    <>
      <color attach="background" args={["#011039"]} />
      <fog attach="fog" args={["#011039", 10, 26]} />
      <ambientLight intensity={0.35} />
      <spotLight
        position={[0, 7, 1]}
        angle={0.45}
        penumbra={0.8}
        intensity={120}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
      />
      <spotLight position={[-5, 4, 4]} angle={0.5} penumbra={1} intensity={45} color="#2a4fd4" />
      <spotLight position={[5, 3, -3]} angle={0.5} penumbra={1} intensity={40} color="#2a4fd4" />

      <Environment resolution={typeof window !== "undefined" && window.innerWidth < 768 ? 128 : 256}>
        <Lightformer intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.5} position={[-5, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1, 1]} />
        <Lightformer intensity={1.5} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 1, 1]} />
        <Lightformer intensity={2} color="#2a4fd4" position={[0, 1, -6]} scale={[12, 1.5, 1]} />
        <Lightformer intensity={0.8} position={[0, 1, 6]} scale={[10, 3, 1]} />
      </Environment>

      <CarModel {...props} controls={controls} />

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.85}
        scale={10}
        blur={2.2}
        far={2}
        resolution={typeof window !== "undefined" && window.innerWidth < 768 ? 256 : 512}
        color="#000000"
      />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={typeof window !== "undefined" && window.innerWidth < 768 ? 512 : 1024}
          mixBlur={1}
          mixStrength={30}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#011039"
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
        smoothTime={0.4}
      />
    </>
  );
}
