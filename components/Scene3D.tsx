'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import DurianModel3D from './DurianModel3D'

interface Scene3DProps {
  scrollProgress: number
  enableControls?: boolean
}

export default function Scene3D({ scrollProgress, enableControls = false }: Scene3DProps) {
  return (
    <Canvas
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Durian Model */}
      <DurianModel3D scrollProgress={scrollProgress} />

      {/* Optional controls */}
      {enableControls && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  )
}
