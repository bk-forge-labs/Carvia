'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './TurntableScene.module.css';

export default function CvShowroom({ className }: { className: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (motion.matches || connection?.saveData) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    async function start() {
      const [THREE, { GLTFLoader }, { HDRLoader }, { SVGLoader }] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'), import('three/addons/loaders/HDRLoader.js'), import('three/addons/loaders/SVGLoader.js'),
      ]);
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ canvas: canvas!, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(Math.min(1920, Math.max(1280, innerWidth)), Math.min(1920, Math.max(1280, innerWidth)) / 1.6, false);
      renderer.setClearColor(0, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      const scene = new THREE.Scene();
      const onContextLost = (event: Event) => { event.preventDefault(); setReady(false); };
      canvas!.addEventListener('webglcontextlost', onContextLost);
      const camera = new THREE.PerspectiveCamera(2 * Math.atan(Math.tan(.5829135775566101 / 2) / 1.6) * 180 / Math.PI, 1.6, .1, 80);
      camera.position.set(8, 3.45, 13); camera.lookAt(-1.7, .75, 0);
      const sculpture = new THREE.Group(); scene.add(sculpture);
      let frame = 0;
      let previous = 0;
      let visible = true;
      const resources: { dispose: () => void }[] = [];
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .05 });
      observer.observe(canvas!);
      cleanup = () => {
        cancelAnimationFrame(frame); observer.disconnect(); canvas!.removeEventListener('webglcontextlost', onContextLost);
        scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => material.dispose());
          }
        });
        resources.forEach(resource => resource.dispose()); renderer.dispose();
      };
      try {
        const [model, environment, emblem] = await Promise.all([
          new GLTFLoader().loadAsync('/brand/cv/carvia-cv.glb'),
          new HDRLoader().loadAsync('/brand/cv/studio.hdr'),
          new SVGLoader().loadAsync('/logo/veltrenne/emblem-gold.svg'),
        ]);
        if (disposed) {
          environment.dispose();
          model.scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose()); } });
          return;
        }
        const pmrem = new THREE.PMREMGenerator(renderer);
        const lighting = pmrem.fromEquirectangular(environment);
        scene.environment = lighting.texture; scene.environmentIntensity = 1.2;
        resources.push(lighting); environment.dispose(); pmrem.dispose();
        sculpture.add(model.scene);
        model.scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true; object.receiveShadow = true;
            if (object.name.includes('graphite') || object.name.includes('plinth')) {
              (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose());
              object.material = new THREE.MeshStandardMaterial({ color: '#181917', metalness: .15, roughness: .65 });
            }

          }
        });
        // Keep the approved platform; replace only the old monogram geometry.
        const oldLetters: InstanceType<typeof THREE.Mesh>[] = [];
        model.scene.traverse(object => { if (object instanceof THREE.Mesh && object.name.startsWith('CV')) oldLetters.push(object); });
        oldLetters.forEach(object => {
          object.removeFromParent(); object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        });
        const mark = new THREE.Group();
        const gold = new THREE.MeshStandardMaterial({ color: '#bda47e', metalness: .92, roughness: .3 });
        emblem.paths.forEach(path => path.toShapes().forEach(shape => {
          const geometry = new THREE.ExtrudeGeometry(shape, { depth: 30, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.6, bevelSegments: 3, curveSegments: 24 });
          geometry.translate(-250, -143, -15);
          geometry.scale(.0072, -.0072, .0072);
          // Reflection of SVG's downwards Y axis reverses the winding order.
          const positions = geometry.getAttribute('position');
          for (let i = 0; i < positions.count; i += 3) {
            const x = positions.getX(i + 1), y = positions.getY(i + 1), z = positions.getZ(i + 1);
            positions.setXYZ(i + 1, positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2));
            positions.setXYZ(i + 2, x, y, z);
          }
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(geometry, gold); mesh.castShadow = true; mesh.receiveShadow = true; mark.add(mesh);
        }));
        mark.position.y = 1.23; mark.rotation.y = .55; sculpture.add(mark);
        const key = new THREE.DirectionalLight('#fff1dd', 1.5); key.position.set(6, 6, 10); key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.normalBias = .025;
        scene.add(key);
        const rim = new THREE.DirectionalLight('#e8c190', 1); rim.position.set(3, 4, -4); scene.add(rim);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: .13 }));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = -.015; scene.add(floor);
        renderer.render(scene, camera); setReady(true);
        function tick(now: number) {
          if (disposed) return;
          const delta = previous ? Math.min((now - previous) / 1000, .05) : 0; previous = now;
          if (visible && !document.hidden && !pausedRef.current && !motion.matches) {
            sculpture.rotation.y -= delta * Math.PI * 2 / 24;
            renderer.render(scene, camera);
          }
          frame = requestAnimationFrame(tick);
        }
        frame = requestAnimationFrame(tick);
      } catch { cleanup?.(); }
    }
    start().catch(() => { cleanup?.(); });
    return () => { disposed = true; cleanup?.(); };
  }, []);
  return <>
    <Image src='/brand/cv/showroom.webp' alt='' fill priority sizes='100vw' className={className} />
    <Image src='/logo/veltrenne/emblem-gold.svg' alt='' width={500} height={286} priority style={{ position: 'absolute', left: '53%', top: '28%', width: '30%', height: 'auto', opacity: ready ? 0 : 1 }} />
    <canvas ref={canvasRef} className={className} aria-hidden='true' style={{ opacity: ready ? 1 : 0, transition: 'opacity 500ms ease' }} />
    {ready && <button type='button' className={styles.control} aria-label={paused ? 'Play logo motion' : 'Pause logo motion'} onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }}>{paused ? '▶ Play motion' : 'Ⅱ Pause motion'}</button>}
  </>;
}
