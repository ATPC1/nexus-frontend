import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Galaxy(props) {
  const pointsRef = useRef();
  const groupRef = useRef();
  
  const [positions, colors] = useMemo(() => {
    const count = 25000; // Increased particle count for denser galaxy
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Galaxy parameters
    const radius = 8;
    const branches = 5; // More spiral branches
    const spin = 1.5;
    const randomness = 0.3;
    const randomnessPower = 3;
    
    // Vibrant Color Palette
    const colorInside = new THREE.Color('#ffffff'); // Core
    const outerColors = [
      new THREE.Color('#ec4899'), // Pink
      new THREE.Color('#8b5cf6'), // Purple
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#10b981'), // Emerald
      new THREE.Color('#f59e0b')  // Amber
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const r = Math.random() * radius;
      const spinAngle = r * spin;
      const branchIndex = i % branches;
      const branchAngle = (branchIndex / branches) * Math.PI * 2;

      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY * 0.5; // Flatten the Y axis for a disc shape
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Select a vibrant color based on the branch and blend it with the core
      const targetOuterColor = outerColors[branchIndex];
      const mixedColor = colorInside.clone().lerp(targetOuterColor, r / radius + 0.1);
      
      // Add a slight chance for random bright colored stars scattered around
      if (Math.random() > 0.98) {
        mixedColor.lerp(new THREE.Color('#ffffff'), 0.8);
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth dynamic rotation
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.z += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 + Math.PI / 3;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 3, 0, 0]}>
      {/* Supermassive Core Glow */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
        
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </mesh>
      
      {/* Colorful Spinning Stars */}
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          vertexColors
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}
