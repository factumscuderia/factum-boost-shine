import { useMemo, useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CARRO_FB06 } from "./cars";

const CAR_LEN = 4.0;
const TRACK_LEN = 45;

function acabamentoDe(c: THREE.Color, meshName: string, matName: string): THREE.MeshPhysicalMaterial {
  const n = (matName + " " + meshName).toLowerCase();
  const base = { envMapIntensity: 1.2, transparent: true };
  if (/eixo|steel|aço|satin|roda|wheel|hubcap/.test(n))
    return new THREE.MeshPhysicalMaterial({ ...base, color: "#ffffff", metalness: 0.85, roughness: 0.2 });
  if (/blue|chassi|body|sidepod|difusor|assoalho/.test(n))
    return new THREE.MeshPhysicalMaterial({ ...base, color: "#2a4fd4", metalness: 0.55, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 });
  if (/black|halo|asa|wing/.test(n))
    return new THREE.MeshPhysicalMaterial({ ...base, color: "#011039", metalness: 0.2, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.1 });
  return new THREE.MeshPhysicalMaterial({ ...base, color: "#ffffff", metalness: 0.1, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.15 });
}

// Visual Track: Straight 2-lane STEM Racing track with start blocks, guide lines and finish gantry
function TrackMesh() {
  return (
    <group position={[0, 0, TRACK_LEN / 2 - 4]}>
      {/* Pista principal (asfalto/superfície técnica) */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[4.2, 0.08, TRACK_LEN + 10]} />
        <meshStandardMaterial color="#011039" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Faixas laterais de pista */}
      {[-2.05, 2.05].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0]}>
          <boxGeometry args={[0.1, 0.04, TRACK_LEN + 10]} />
          <meshBasicMaterial color="#2a4fd4" />
        </mesh>
      ))}

      {/* Divisória central das 2 raias (Lane 1 e Lane 2) */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.06, 0.02, TRACK_LEN + 10]} />
        <meshBasicMaterial color="#2a4fd4" />
      </mesh>

      {/* Fios de guia de nylon / aço (STEM Racing guide lines) */}
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, TRACK_LEN + 10, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Linha de largada (Start Line) */}
      <group position={[0, 0.036, -TRACK_LEN / 2 + 4]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.0, 0.01, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Marcadores de gate de largada */}
        {[-0.95, 0.95].map((x, idx) => (
          <group key={idx} position={[x, 0.12, -0.4]}>
            <mesh>
              <boxGeometry args={[0.3, 0.2, 0.15]} />
              <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshBasicMaterial color="#2a4fd4" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Linha de chegada (Finish Line) xadrez */}
      <group position={[0, 0.036, TRACK_LEN / 2 + 2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.0, 0.01, 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Pórtico de Chegada / Sensores de tempo */}
        <mesh position={[-2.1, 1.4, 0]}>
          <boxGeometry args={[0.12, 2.8, 0.12]} />
          <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[2.1, 1.4, 0]}>
          <boxGeometry args={[0.12, 2.8, 0.12]} />
          <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[4.32, 0.3, 0.2]} />
          <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0.11]}>
          <planeGeometry args={[3.8, 0.22]} />
          <meshBasicMaterial color="#2a4fd4" />
        </mesh>
      </group>

      {/* Barreiras de segurança e iluminação da pista */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const z = -12 + idx * 8;
        return (
          <group key={idx}>
            {/* Postes de luz lateral */}
            <mesh position={[-2.8, 1.8, z]}>
              <cylinderGeometry args={[0.04, 0.05, 3.6, 8]} />
              <meshStandardMaterial color="#011039" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-2.6, 3.6, z]}>
              <boxGeometry args={[0.5, 0.1, 0.3]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <pointLight position={[-2.6, 3.4, z]} intensity={14} distance={8} color="#ffffff" />
          </group>
        );
      })}
    </group>
  );
}

// CO2 Smoke burst effect on launch
function CO2Smoke({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const burstStart = useRef<number | null>(null);
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map(() => ({
      x: (Math.random() - 0.5) * 0.22,
      y: (Math.random() - 0.5) * 0.1 + 0.2,
      z: -(Math.random() * 0.22 + 1.82),
      vx: (Math.random() - 0.5) * 0.65,
      vy: Math.random() * 0.38 + 0.08,
      vz: -(Math.random() * 4 + 3),
      scale: Math.random() * 0.12 + 0.08,
    }));
  }, []);

  useEffect(() => {
    burstStart.current = active ? null : 0;
    if (!active && group.current) group.current.visible = false;
  }, [active]);

  useFrame((state) => {
    if (!group.current || !active) return;
    if (burstStart.current === null) burstStart.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - burstStart.current;
    if (elapsed > 0.85) {
      group.current.visible = false;
      return;
    }
    group.current.visible = true;
    const flashIn = Math.min(1, elapsed / 0.045);
    const dissipate = Math.max(0, 1 - elapsed / 0.85);
    const opacity = flashIn * dissipate * dissipate;
    group.current.children.forEach((c, idx) => {
      const p = particles[idx];
      const m = c as THREE.Mesh;
      m.position.x = p.x + p.vx * elapsed;
      m.position.y = p.y + p.vy * elapsed;
      m.position.z = p.z + p.vz * elapsed;
      const s = p.scale * (1 + elapsed * 5);
      m.scale.set(s, s, s);
      const mat = m.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = opacity * 0.9;
    });
  });

  return (
    <group ref={group} visible={false}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

type TrackSceneProps = {
  carState: "ready" | "launched" | "false_start";
  launchTimestamp: number;
};

export function TrackScene({ carState, launchTimestamp }: TrackSceneProps) {
  const loaded = useLoader(GLTFLoader, CARRO_FB06.arquivoModelo) as unknown as THREE.Object3D & { scene?: THREE.Object3D };
  const carGroup = useRef<THREE.Group>(null);
  const smokeLaunchTime = useRef(0);
  const animStartTime = useRef(0);

  const carModel = useMemo(() => {
    const src = (loaded.scene ?? loaded) as THREE.Object3D;
    const root = src.clone(true);
    root.rotation.set(...CARRO_FB06.rotacao);
    const wrap = new THREE.Group();
    wrap.add(root);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = ([] as THREE.Material[]).concat(m.material);
      const next = mats.map((mm) => acabamentoDe((mm as THREE.MeshStandardMaterial).color ?? new THREE.Color("#ffffff"), m.name, mm.name || ""));
      m.material = Array.isArray(m.material) ? next : next[0];
      m.castShadow = true;
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
    // Align front nose straight down +Z (forward along longitudinal track axis)
    holder.rotation.y = -Math.PI / 2;
    return holder;
  }, [loaded]);

  useEffect(() => {
    if (carState === "launched") {
      animStartTime.current = performance.now();
    }
  }, [carState]);

  useFrame((state) => {
    if (!carGroup.current) return;

    if (carState === "ready") {
      // Stationed at start line (Lane 1, centered on -0.95m, rotation locked at 0)
      carGroup.current.position.set(-0.95, 0.03, 0);
      carGroup.current.rotation.set(0, 0, 0);
      smokeLaunchTime.current = 0;
      const cam = state.camera;
      // Centered directly on lane 1 (-0.95) looking straight down the lane to the vanishing point
      cam.position.set(-0.95, 1.15, -3.2);
      cam.lookAt(-0.95, 0.45, 25.0);
    } else if (carState === "false_start") {
      // Small jerk forward on start line and sudden halt, orientation stays straight
      carGroup.current.position.set(-0.95, 0.03, 0.22);
      carGroup.current.rotation.set(0, 0, 0);
    } else if (carState === "launched") {
      if (smokeLaunchTime.current === 0) {
        smokeLaunchTime.current = state.clock.elapsedTime;
      }
      const t = Math.max(0, (performance.now() - animStartTime.current) / 1000);
      // Realistic STEM Racing acceleration: accelerates smoothly from zero along straight track line (+Z)
      let z = 0;
      const tCo2 = 0.35;
      const a = 46; // m/s^2 acceleration from zero
      if (t < tCo2) {
        z = 0.5 * a * t * t;
      } else {
        const vCoast = a * tCo2; // ~16.1 m/s (~58 km/h)
        z = 0.5 * a * tCo2 * tCo2 + vCoast * (t - tCo2);
      }
      z = Math.min(z, TRACK_LEN + 4);
      // Move strictly in a straight line along the longitudinal Z axis
      carGroup.current.position.set(-0.95, 0.03, z);
      carGroup.current.rotation.set(0, 0, 0);

      // Camera follows straight along lane 1 (-0.95) towards the vanishing point
      const cam = state.camera;
      if (z < 25) {
        cam.position.set(-0.95, 1.15, -3.2 + z * 0.35);
        cam.lookAt(-0.95, 0.45, z + 8.0);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[-0.95, 1.15, -3.2]} fov={38} onUpdate={(c) => c.lookAt(-0.95, 0.45, 25.0)} />
      <color attach="background" args={["#011039"]} />
      <fog attach="fog" args={["#011039", 12, 55]} />
      <ambientLight intensity={0.25} />

      {/* Iluminação de estádio / pista */}
      <directionalLight position={[-6, 12, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} color="#ffffff" />
      <spotLight position={[0, 9, -2]} angle={0.65} penumbra={0.9} intensity={60} color="#2a4fd4" />
      <spotLight position={[-2, 6, 8]} angle={0.7} penumbra={0.8} intensity={40} color="#2a4fd4" />

      <Environment resolution={typeof window !== "undefined" && window.innerWidth < 768 ? 128 : 256}>
        <Lightformer intensity={2} position={[0, 8, 5]} scale={[14, 2, 1]} />
        <Lightformer intensity={1.5} color="#2a4fd4" position={[-4, 2, 0]} scale={[12, 1, 1]} />
        <Lightformer intensity={1.2} color="#ffffff" position={[4, 2, 0]} scale={[12, 1, 1]} />
      </Environment>

      <TrackMesh />

      {/* Carro FB06 posicionado na raia 1 */}
      <group ref={carGroup} position={[-0.95, 0.03, 0]}>
        <primitive object={carModel} />
        <ContactShadows position={[0, 0.005, 0]} opacity={0.9} scale={6} blur={2.4} far={2} resolution={typeof window !== "undefined" && window.innerWidth < 768 ? 256 : 512} color="#000000" />
        <CO2Smoke active={carState === "launched"} />
      </group>
    </>
  );
}
