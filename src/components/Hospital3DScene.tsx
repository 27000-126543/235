import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useHospitalStore } from '../store/useHospitalStore';

const areaColors: Record<string, string> = {
  outpatient: '#0099ff',
  inpatient: '#00cc66',
  emergency: '#ff3366',
  pharmacy: '#ff9900',
  operating: '#9966ff',
  cssd: '#00cccc',
  waste: '#996633',
};

const areaNames: Record<string, string> = {
  outpatient: '门诊大厅',
  inpatient: '住院楼',
  emergency: '急诊中心',
  pharmacy: '药房',
  operating: '手术室',
  cssd: '消毒供应中心',
  waste: '废物处理站',
};

interface BuildingProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  windowsOpen?: number;
  hasAlert?: boolean;
  buildingType: string;
}

const GlassWindow: React.FC<{ position: [number, number, number]; isOpen: boolean; color: string }> = ({ position, isOpen, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetY = isOpen ? 0.4 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      material.opacity = isOpen ? 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.7, 1.1]} />
      <meshPhysicalMaterial
        color={isOpen ? '#ffffaa' : color}
        transparent
        opacity={0.7}
        transmission={0.9}
        roughness={0.1}
        metalness={0.1}
        thickness={0.5}
        envMapIntensity={1}
      />
    </mesh>
  );
};

const AlertLight: React.FC<{ position: [number, number, number]; color: string; active: boolean }> = ({ position, color, active }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightRef.current && active) {
      const intensity = 2 + Math.sin(state.clock.elapsedTime * 8) * 1.5;
      lightRef.current.intensity = intensity;
    }
    if (meshRef.current && active) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
      meshRef.current.scale.setScalar(scale);
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.5;
    }
  });

  if (!active) return null;

  return (
    <group position={position}>
      <pointLight ref={lightRef} color={color} intensity={2} distance={10} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.05, 0.1, 0.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

const Building: React.FC<BuildingProps> = ({ position, size, color, label, isActive, onClick, windowsOpen = 0, hasAlert = false, buildingType }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  const windows = useMemo(() => {
    const wins: JSX.Element[] = [];
    const [width, height, depth] = size;
    const windowRows = Math.max(2, Math.floor(height / 2.5));
    const windowCols = Math.max(2, Math.floor(width / 2.5));
    let winIndex = 0;
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const isOpen = winIndex < windowsOpen;
        const x = -width / 2 + 1.2 + col * 2;
        const y = 1.2 + row * 2.2;
        wins.push(
          <GlassWindow
            key={`win-front-${row}-${col}`}
            position={[x, y, depth / 2 + 0.02]}
            isOpen={isOpen}
            color={color}
          />
        );
        wins.push(
          <GlassWindow
            key={`win-back-${row}-${col}`}
            position={[x, y, -depth / 2 - 0.02]}
            isOpen={isOpen}
            color={color}
          />
        );
        winIndex++;
      }
    }
    
    const sideRows = Math.max(2, Math.floor(height / 2.5));
    const sideCols = Math.max(1, Math.floor(depth / 2.5));
    for (let row = 0; row < sideRows; row++) {
      for (let col = 0; col < sideCols; col++) {
        const isOpen = (row + col) % 2 === 0;
        const z = -depth / 2 + 1.2 + col * 2;
        const y = 1.2 + row * 2.2;
        wins.push(
          <mesh key={`win-left-${row}-${col}`} position={[-width / 2 - 0.02, y, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.7, 1.1]} />
            <meshPhysicalMaterial
              color={isOpen ? '#ffffaa' : color}
              transparent
              opacity={0.7}
              transmission={0.9}
              roughness={0.1}
            />
          </mesh>
        );
      }
    }
    
    return wins;
  }, [size, windowsOpen, color]);

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={isActive ? 0.5 : 0.35}
          transmission={0.3}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={isActive ? 0.15 : 0.05}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={isActive ? '#ffffff' : color} linewidth={2} transparent opacity={0.8} />
      </lineSegments>

      {windows}

      <AlertLight
        position={[size[0] / 2 - 0.5, size[1] + 0.5, size[2] / 2 - 0.5]}
        color="#ff3366"
        active={hasAlert}
      />
      <AlertLight
        position={[-size[0] / 2 + 0.5, size[1] + 0.5, -size[2] / 2 + 0.5]}
        color="#ff9900"
        active={hasAlert && buildingType === 'emergency'}
      />

      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, size[1] / 2 + 2, 0]}
          fontSize={0.7}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Float>
    </group>
  );
};

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#0d1a2d" />
    </mesh>
  );
};

const Grid: React.FC = () => {
  return (
    <group>
      <gridHelper args={[120, 60, '#004488', '#002244']} position={[0, 0.01, 0]} />
      <gridHelper args={[120, 60, '#004488', '#002244']} position={[0, 0.01, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

interface FlowPathProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  active?: boolean;
}

const FlowPath: React.FC<FlowPathProps> = ({ start, end, color = '#00ffff', active = true }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const curve = useMemo(() => {
    const midY = Math.max(start[1], end[1]) + 4;
    const points = [
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, midY, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [start, end]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 128, 0.12, 12, false);
  }, [curve]);

  useFrame((state) => {
    if (meshRef.current && active) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        const t = ((state.clock.elapsedTime * 0.3 + i * 0.1) % 1);
        const point = curve.getPointAt(t);
        positions.setXYZ(i, point.x, point.y, point.z);
      }
      positions.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={meshRef}>
        <primitive object={tubeGeometry} attach="geometry" />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={15}
            array={new Float32Array(15 * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.3} transparent opacity={0.9} sizeAttenuation />
      </points>
    </group>
  );
};

const ResourceMarker: React.FC<{ position: [number, number, number]; type: string; progress?: number }> = ({ position, type }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const colors: Record<string, string> = {
    bed: '#00cc66',
    staff: '#ff9900',
    equipment: '#0099ff',
  };

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color={colors[type] || '#ffffff'} emissive={colors[type]} emissiveIntensity={0.5} />
      </mesh>
      <pointLight color={colors[type]} intensity={1} distance={5} />
    </group>
  );
};

const SceneContent: React.FC = () => {
  const { currentView, setCurrentView, departments, beds, wasteBins, activeEmergencyPlan, resourceMovements } = useHospitalStore();
  
  const abnormalBeds = beds.filter(b => b.isAbnormal).length;
  const fullWasteBins = wasteBins.filter(w => w.needsPickup).length;
  const outpatientWindows = departments.reduce((sum, d) => sum + d.openWindows, 0);

  const buildingConfigs = [
    { id: 'outpatient', position: [-18, 3, -12] as [number, number, number], size: [14, 6, 10] as [number, number, number], windowsOpen: outpatientWindows, hasAlert: false },
    { id: 'inpatient', position: [0, 6, -15] as [number, number, number], size: [12, 14, 10] as [number, number, number], windowsOpen: 25, hasAlert: abnormalBeds > 0 },
    { id: 'emergency', position: [18, 5, -10] as [number, number, number], size: [12, 10, 10] as [number, number, number], windowsOpen: 10, hasAlert: true },
    { id: 'pharmacy', position: [-22, 3, 6] as [number, number, number], size: [10, 6, 8] as [number, number, number], windowsOpen: 5, hasAlert: false },
    { id: 'operating', position: [0, 5, 10] as [number, number, number], size: [12, 10, 10] as [number, number, number], windowsOpen: 8, hasAlert: false },
    { id: 'cssd', position: [22, 3, 8] as [number, number, number], size: [10, 6, 8] as [number, number, number], windowsOpen: 4, hasAlert: false },
    { id: 'waste', position: [30, 2, -6] as [number, number, number], size: [8, 4, 6] as [number, number, number], windowsOpen: 2, hasAlert: fullWasteBins > 0 },
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[15, 30, 15]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-15, 15, -15]} intensity={0.4} color="#0099ff" />
      <pointLight position={[15, 15, 15]} intensity={0.4} color="#ff9900" />
      <pointLight position={[0, 20, 0]} intensity={0.3} color="#ffffff" />
      
      <Ground />
      <Grid />
      
      {buildingConfigs.map(config => (
        <Building
          key={config.id}
          position={config.position}
          size={config.size}
          color={areaColors[config.id]}
          label={areaNames[config.id]}
          isActive={currentView === config.id}
          onClick={() => setCurrentView(config.id)}
          windowsOpen={config.windowsOpen}
          hasAlert={config.hasAlert}
          buildingType={config.id}
        />
      ))}

      {activeEmergencyPlan && (
        <>
          <FlowPath start={[0, 14, -15]} end={[18, 10, -10]} color="#ff3366" active={true} />
          <FlowPath start={[0, 10, 10]} end={[18, 10, -10]} color="#ff9900" active={true} />
          <FlowPath start={[-18, 6, -12]} end={[18, 10, -10]} color="#00cc66" active={true} />
          <FlowPath start={[-22, 6, 6]} end={[18, 10, -10]} color="#0099ff" active={true} />
        </>
      )}

      {resourceMovements.map((movement) => {
        const t = (Date.now() % 5000) / 5000;
        const x = movement.from[0] + (movement.to[0] - movement.from[0]) * t;
        const y = movement.from[1] + (movement.to[1] - movement.from[1]) * t + Math.sin(t * Math.PI) * 3;
        const z = movement.from[2] + (movement.to[2] - movement.from[2]) * t;
        return (
          <ResourceMarker
            key={movement.id}
            position={[x, y, z]}
            type={movement.type}
            progress={t}
          />
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={100}
        target={[0, 8, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.2}
      />
    </>
  );
};

const Hospital3DScene: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 40, 55], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050d1a']} />
        <fog attach="fog" args={['#050d1a', 40, 100]} />
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Hospital3DScene;
