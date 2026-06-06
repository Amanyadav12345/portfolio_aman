import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ContactScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 3.5, 7);
    camera.lookAt(0, 0, 0);

    const pl1 = new THREE.PointLight(0x00d4ff, 60, 20);
    pl1.position.set(0, 4, 3);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x7c3aed, 40, 20);
    pl2.position.set(-5, 2, -2);
    scene.add(pl2);
    scene.add(new THREE.AmbientLight(0x020210, 1));

    // ── Wave mesh ────────────────────────────────────────────────────────
    const SEG = 60;
    const geo = new THREE.PlaneGeometry(22, 16, SEG, SEG);
    geo.rotateX(-Math.PI / 2.5);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      metalness: 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -1.5;
    scene.add(mesh);

    // Solid (non-wireframe) very dark wave underneath for depth
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x020220,
      metalness: 0.2,
      roughness: 0.8,
      transparent: true,
      opacity: 0.6,
    });
    const solidMesh = new THREE.Mesh(geo.clone(), solidMat);
    solidMesh.position.y = -1.55;
    scene.add(solidMesh);

    // Floating glowing orbs above the wave
    const orbColors = [0x00d4ff, 0x7c3aed, 0x00ff88, 0xff6b6b];
    const orbs = orbColors.map((color, i) => {
      const angle = (i / orbColors.length) * Math.PI * 2;
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.05, emissive: color, emissiveIntensity: 0.4 })
      );
      orb.position.set(Math.cos(angle) * 3.5, 0.5, Math.sin(angle) * 2);
      scene.add(orb);
      return { mesh: orb, baseAngle: angle };
    });

    // Particle field
    const pCount = 600;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 1] = Math.random() * 5 - 1;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x7c3aed, size: 0.04, transparent: true, opacity: 0.55 })));

    // Mouse parallax
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    let frame;
    const clock = new THREE.Clock();
    const posAttr = geo.attributes.position;
    const origZ = new Float32Array(posAttr.array.length);
    origZ.set(posAttr.array);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Animate wave vertices
      for (let i = 0; i <= SEG; i++) {
        for (let j = 0; j <= SEG; j++) {
          const idx = (i * (SEG + 1) + j) * 3;
          const x = origZ[idx];
          const y = origZ[idx + 1];
          posAttr.array[idx + 2] = origZ[idx + 2] + Math.sin(x * 0.5 + t * 0.8) * 0.35 + Math.cos(y * 0.4 + t * 0.6) * 0.25;
        }
      }
      posAttr.needsUpdate = true;

      // Orbit orbs
      orbs.forEach(({ mesh: o, baseAngle }, i) => {
        const a = baseAngle + t * 0.25;
        const r = 3.5 + Math.sin(t * 0.5 + i) * 0.3;
        o.position.x = Math.cos(a) * r;
        o.position.z = Math.sin(a) * r * 0.55;
        o.position.y = 0.5 + Math.sin(t * 0.8 + i * 1.5) * 0.4;
      });

      // Camera drift
      camera.position.x += (mx * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (-my * 0.6 + 3.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      pl1.position.x = Math.sin(t * 0.5) * 5;
      pl1.position.z = Math.cos(t * 0.4) * 4;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />;
}
