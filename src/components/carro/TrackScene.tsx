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

// Visual Track: Straight 2-lane STEM Racing track with start blocks, guide lines and finish gantry
function TrackMesh() {
  return (
    <group position={[0, 0, TRACK_LEN / 2 - 4]}>
      {/* Pista principal (asfalto/superfície técnica texturizada) */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[4.2, 0.08, TRACK_LEN + 10]} />
        <meshStandardMaterial color="#0d111d" roughness={0.7} metalness={0.3} />
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
        <meshBasicMaterial color="#4d74ff" />
      </mesh>

      {/* Fios de guia de nylon / aço (STEM Racing guide lines) */}
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, TRACK_LEN + 10, 8]} />
          <meshStandardMaterial color="#c0c9d6" metalness={0.9} roughness={0.2} />
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
              <meshStandardMaterial color="#1a2542" roughness={0.4} metalness={0.6} />
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
          <meshStandardMaterial color="#0b1736" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[2.1, 1.4, 0]}>
          <boxGeometry args={[0.12, 2.8, 0.12]} />
          <meshStandardMaterial color="#0b1736" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[4.32, 0.3, 0.2]} />
          <meshStandardMaterial color="#011039" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0.11]}>
          <planeGeometry args={[3.8, 0.22]} />
          <meshBasicMaterial color="#8fa8ff" />
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
              <meshStandardMaterial color="#3a4560" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-2.6, 3.6, z]}>
              <boxGeometry args={[0.5, 0.1, 0.3]} />
              <meshBasicMaterial color="#dbe5ff" toneMapped={false} />
            </mesh>
            <pointLight position={[-2.6, 3.4, z]} intensity={14} distance={8} color="#dbe5ff" />
          </group>
        );
      })}
    </group>
  );
}

// CO2 Smoke burst effect on launch
function CO2Smoke({ active, launchTime }: { active: boolean; launchTime: number }) {
  const group = useRef<THREE.Group>(null);
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map(() => ({
      x: (Math.random() - 0.5) * 0.15,
      y: (Math.random() - 0.5) * 0.12 + 0.18,
      z: -(Math.random() * 0.4 + 1.8),
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 0.5 + 0.1,
      vz: -(Math.random() * 3.5 + 2.5),
      scale: Math.random() * 0.15 + 0.1,
    }));
  }, []);

  useFrame((state) => {
    if (!group.current || !active) return;
    const elapsed = state.clock.elapsedTime - launchTime;
    if (elapsed < 0 || elapsed > 1.8) {
      group.current.visible = false;
      return;
    }
    group.current.visible = true;
    const opacity = Math.max(0, 1 - elapsed / 1.5);
    group.current.children.forEach((c, idx) => {
      const p = particles[idx];
      const m = c as THREE.Mesh;
      m.position.x = p.x + p.vx * elapsed;
      m.position.y = p.y + p.vy * elapsed;
      m.position.z = p.z + p.vz * elapsed;
      const s = p.scale * (1 + elapsed * 3.5);
      m.scale.set(s, s, s);
      const mat = m.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = opacity * 0.75;
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
      const next = mats.map((mm) => acabamentoDe((mm as THREE.MeshStandardMaterial).color ?? new THREE.Color("#fff"), m.name, mm.name || ""));
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
      // Stationed at start line (Lane 1, centered on -0.95m)
      carGroup.current.position.set(-0.95, 0.03, 0);
      carGroup.current.rotation.set(0, 0, 0);
      smokeLaunchTime.current = 0;
      const cam = state.camera;
      cam.position.set(-2.8, 1.45, -2.5);
      cam.lookAt(-0.95, 0.45, 8.0);
    } else if (carState === "false_start") {
      // Small jerk forward on start line and sudden halt
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

      // Camera dynamic tracking during launch
      const cam = state.camera;
      if (z < 22) {
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, -2.5 + z * 0.32, 0.08);
        cam.lookAt(-0.95, 0.45, z + 6.0);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[-2.8, 1.45, -2.5]} fov={38} onUpdate={(c) => c.lookAt(-0.95, 0.45, 8.0)} />
      <color attach="background" args={["#030718"]} />
      <fog attach="fog" args={["#030718", 12, 55]} />
      <ambientLight intensity={0.25} />

      {/* Iluminação de estádio / pista */}
      <directionalLight position={[-6, 12, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} color="#ffffff" />
      <spotLight position={[0, 9, -2]} angle={0.65} penumbra={0.9} intensity={60} color="#9fb4ff" />
      <spotLight position={[-2, 6, 8]} angle={0.7} penumbra={0.8} intensity={40} color="#4d74ff" />

      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 8, 5]} scale={[14, 2, 1]} />
        <Lightformer intensity={1.5} color="#4d74ff" position={[-4, 2, 0]} scale={[12, 1, 1]} />
        <Lightformer intensity={1.2} color="#8fa8ff" position={[4, 2, 0]} scale={[12, 1, 1]} />
      </Environment>

      <TrackMesh />

      {/* Carro FB06 posicionado na raia 1 */}
      <group ref={carGroup} position={[-0.95, 0.03, 0]}>
        <primitive object={carModel} />
        <ContactShadows position={[0, 0.005, 0]} opacity={0.9} scale={6} blur={2.4} far={2} color="#000000" />
        <CO2Smoke active={carState === "launched"} launchTime={smokeLaunchTime.current} />
      </group>
    </>
  );
}
