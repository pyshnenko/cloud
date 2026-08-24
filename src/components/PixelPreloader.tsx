import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PixelPreloaderProps {
  renderMode: 'light' | 'dark';
  onComplete: () => void;
}

export default React.memo(function PixelPreloader({ renderMode, onComplete }: PixelPreloaderProps) {
  console.log(renderMode)
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

    const count = 3500;
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

    // Изменяем скорость зажигания пикселей с 800мс на более быструю (400мс)
    const INTRO_DURATION = 400;   // Время плавного зажигания пикселей из темноты
    const EXPLOSION_DELAY = 2400; // Немного сдвинем взрыв пораньше, чтобы не затягивать заставку
    const FADE_DELAY = 3400;      
    const TOTAL_DURATION = 4200;  

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
      const w = window.innerWidth; 
      const h = window.innerHeight;
      camera.aspect = w / h; 
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Сохраняем ссылку на элемент DOM в область видимости эффекта для безопасного удаления
    const currentContainer = containerRef.current;
    const currentDomElement = renderer.domElement;

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      // Безопасное удаление холста Three.js
      if (currentContainer && currentDomElement && currentContainer.contains(currentDomElement)) {
        currentContainer.removeChild(currentDomElement);
      }
      
      // Освобождаем память WebGL
      geometry.dispose(); 
      material.dispose(); 
      renderer.dispose();
    };
  }, [onComplete, renderMode]);

  const isDark = renderMode === 'dark';

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed', // Заменяем на fixed, чтобы прелоадер гарантированно перекрывал всё окно
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        // 🌟 ДИНАМИЧЕСКИЙ ЦВЕТ: подстраиваем под текущую тему
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        zIndex: 99999,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeInPreloader 0.6s ease-out forwards',
        transition: 'background-color 0.3s ease',
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
});