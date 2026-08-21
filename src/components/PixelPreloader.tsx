import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PixelPreloaderProps {
  renderMode: 'light' | 'dark';
  onComplete: () => void;
}

export default function PixelPreloader({ renderMode, onComplete }: PixelPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const count = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8; 

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      velocities[i * 3] = x * 0.15;
      velocities[i * 3 + 1] = y * 0.15;
      velocities[i * 3 + 2] = z * 0.15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const isDark = renderMode === 'dark';
    const material = new THREE.PointsMaterial({
      color: isDark ? 0x00f2fe : 0x0ea5e9,
      size: isDark ? 0.15 : 0.18,
      transparent: true,
      opacity: 0.0, // 🌟 Стартуем с абсолютной темноты для частиц
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let startTime = Date.now();
    let stage = 0;

    const INTRO_DURATION = 800;   // Время плавного зажигания пикселей
    const EXPLOSION_DELAY = 2800; // Момент взрыва
    const FADE_DELAY = 3800;      // Начало растворения всей сцены
    const TOTAL_DURATION = 4600;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = Date.now() - startTime;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;

      if (elapsedTime > TOTAL_DURATION) {
        onComplete();
        return;
      }

      // 🌟 Логика изменения прозрачности (Вход, Взрыв, Растворение)
      if (elapsedTime < INTRO_DURATION) {
        // Плавный вход: от 0 до 1 за первые 800мс
        material.opacity = elapsedTime / INTRO_DURATION;
      } else if (elapsedTime > FADE_DELAY) {
        // Плавный выход
        stage = 2;
        material.opacity = Math.max(0, material.opacity - 0.04);
      } else if (elapsedTime > EXPLOSION_DELAY) {
        if (stage === 0) {
          material.color.setHex(isDark ? 0x9d4edd : 0x7c3aed);
          material.size = isDark ? 0.35 : 0.38;
          stage = 1;
        }
      }

      for (let i = 0; i < count; i++) {
        if (stage === 0) {
          const factor = 1 + Math.sin(elapsedTime * 0.005 + i) * 0.002;
          posAttr.array[i * 3] *= factor;
          posAttr.array[i * 3 + 1] *= factor;
          posAttr.array[i * 3 + 2] *= factor;
        } else {
          posAttr.array[i * 3] += velocities[i * 3];
          posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
          posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];
          velocities[i * 3] *= 0.98;
          velocities[i * 3 + 1] *= 0.98;
          velocities[i * 3 + 2] *= 0.98;
        }
      }

      posAttr.needsUpdate = true;
      particles.rotation.y += 0.015;
      particles.rotation.x += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth; const h = window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) containerRef.current.removeChild(renderer.domElement);
      geometry.dispose(); material.dispose(); renderer.dispose();
    };
  }, [onComplete, renderMode]);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeInPreloader 0.6s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes fadeInPreloader {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
