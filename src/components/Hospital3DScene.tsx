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
}

const Building: React.FC<BuildingProps> = ({ position, size, color, label, isActive, onClick, windowsOpen = 0, hasAlert }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.EdgesGeometry>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const windows = useMemo(() => {
    const wins: JSX.Element[] = [];
    const [width, height, depth] = size;
    const windowRows = Math.floor(height / 2);
    const windowCols = Math.floor(width / 2);
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const isOpen = (row * windowCols + col) < windowsOpen;
        wins.push(
          <mesh
            key={`win-${row}-${col}`}
            position={[
              -width / 2 + 1 + col * 2,
              1 + row * 2,
              depth / 2 + 0.01,
            ]}
          >
            <planeGeometry args={[0.8, 1.2]} />
            <meshBasicMaterial color={isOpen ? '#ffff99' : '#334455'} transparent opacity={isOpen ? 0.9 : 0.6} />
          </mesh>
        );
      }
    }
    return wins;
  }, [size, windowsOpen]);

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isActive ? 0.8 : 0.6}
          emissive={color}
          emissiveIntensity={isActive ? 0.3 : 0.1}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry ref={edgesRef} args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={isActive ? '#ffffff' : color} linewidth={2} />
      </lineSegments>
      
      {windows}
      
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <Text
          position={[0, size[1] / 2 + 1.5, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>

      {hasAlert && (
        <Float speed={4} rotationIntensity={0} floatIntensity={1}>
          <mesh position={[size[0] / 2 + 0.5, size[1] / 2 + 0.5, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color="#ff3366" />
          </mesh>
        </Float>
      )}
    </group>
  );
};

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a2a4a" />
    </mesh>
  );
};

const Grid: React.FC = () => {
  return (
    <gridHelper args={[100, 50, '#0066cc', '#003366']} position={[0, 0.01, 0]} />
  );
};

interface PathAnimationProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}

const PathAnimation: React.FC<PathAnimationProps> = ({ start, end, color = '#00ffff' }) => {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
    }
  });

  const points = useMemo(() => {
    const midY = Math.max(start[1], end[1]) + 3;
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, midY, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end),
    ];
  }, [start, end]);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
  }, [curve]);

  return (
    <line ref={lineRef}>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <lineBasicMaterial color={color} transparent opacity={0.8} />
    </line>
  );
};

const SceneContent: React.FC = () => {
  const { currentView, setCurrentView, departments, beds, wasteBins, activeEmergencyPlan } = useHospitalStore();
  
  const abnormalBeds = beds.filter(b => b.isAbnormal).length;
  const fullWasteBins = wasteBins.filter(w => w.needsPickup).length;
  const outpatientWindows = departments.reduce((sum, d) => sum + d.openWindows, 0);

  const buildingConfigs = [
    { id: 'outpatient', position: [-15, 3, -10] as [number, number, number], size: [12, 6, 8] as [number, number, number], windowsOpen: outpatientWindows, hasAlert: false },
    { id: 'inpatient', position: [0, 6, -12] as [number, number, number], size: [10, 12, 8] as [number, number, number], windowsOpen: 20, hasAlert: abnormalBeds > 0 },
    { id: 'emergency', position: [15, 4, -8] as [number, number, number], size: [10, 8, 8] as [number, number, number], windowsOpen: 8, hasAlert: true },
    { id: 'pharmacy', position: [-18, 3, 5] as [number, number, number], size: [8, 6, 6] as [number, number, number], windowsOpen: 4, hasAlert: false },
    { id: 'operating', position: [0, 4, 8] as [number, number, number], size: [10, 8, 8] as [number, number, number], windowsOpen: 6, hasAlert: false },
    { id: 'cssd', position: [18, 3, 5] as [number, number, number], size: [8, 6, 6] as [number, number, number], windowsOpen: 3, hasAlert: false },
    { id: 'waste', position: [25, 2, -5] as [number, number, number], size: [6, 4, 5] as [number, number, number], windowsOpen: 1, hasAlert: fullWasteBins > 0 },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0099ff" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ff9900" />
      
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
        />
      ))}

      {activeEmergencyPlan && (
        <>
          <PathAnimation start={[0, 8, 8]} end={[15, 8, -8]} color="#ff3366" />
          <PathAnimation start={[0, 8, 8]} end={[0, 12, -12]} color="#ff9900" />
          <PathAnimation start={[0, 8, 8]} end={[-15, 6, -10]} color="#00cc66" />
        </>
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={80}
        target={[0, 5, 0]}
      />
    </>
  );
};

const Hospital3DScene: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 30, 40], fov: 50 }}
        shadows
      >
        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 30, 80]} />
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Hospital3DScene;
