import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Sample REU program locations (latitude, longitude)
const locations = [
  { name: 'MIT', lat: 42.3601, lng: -71.0942 },
  { name: 'Stanford', lat: 37.4419, lng: -122.1430 },
  { name: 'UC Berkeley', lat: 37.8719, lng: -122.2585 },
  { name: 'Harvard', lat: 42.3744, lng: -71.1169 },
  { name: 'Yale', lat: 41.3163, lng: -72.9223 },
  { name: 'Princeton', lat: 40.3573, lng: -74.6672 },
  { name: 'Caltech', lat: 34.1377, lng: -118.1253 },
  { name: 'UChicago', lat: 41.7886, lng: -87.5987 },
];

const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

const Arc = ({ start, end, color = '#ff3d00' }) => {
  const points = [];
  const radius = 5;
  const startVec = latLngToVector3(start.lat, start.lng, radius);
  const endVec = latLngToVector3(end.lat, end.lng, radius);
  
  // Create arc points
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const point = startVec.clone().lerp(endVec, t);
    point.normalize().multiplyScalar(radius + 0.1);
    points.push(point);
  }

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      opacity={0.6}
    />
  );
};

const Location = ({ position, name }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#ff3d00" />
    </mesh>
  );
};

const Globe = () => {
  const globeRef = useRef();
  const [currentArc, setCurrentArc] = useState(0);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={globeRef}>
      <Sphere args={[5, 64, 64]}>
        <meshPhongMaterial
          color="#1a237e"
          transparent
          opacity={0.8}
          wireframe
        />
      </Sphere>
      
      {locations.map((location, index) => (
        <Location
          key={location.name}
          position={latLngToVector3(location.lat, location.lng, 5)}
          name={location.name}
        />
      ))}

      {locations.map((location, index) => {
        const nextIndex = (index + 1) % locations.length;
        return (
          <Arc
            key={`${location.name}-${locations[nextIndex].name}`}
            start={location}
            end={locations[nextIndex]}
            color={index === currentArc ? '#ff3d00' : '#2196f3'}
          />
        );
      })}
    </group>
  );
};

const InteractiveGlobe = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Globe />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};

export default InteractiveGlobe; 