import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Lighting
    const ambient = new THREE.AmbientLight(0x0a0a2e, 1);
    scene.add(ambient);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 80, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c3aed, 60, 30);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00ff88, 40, 20);
    pointLight3.position.set(0, -5, 2);
    scene.add(pointLight3);

    // ── Particles ──────────────────────────────────────────────────────────
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Floating meshes ─────────────────────────────────────────────────────
    const meshes = [];

    const addMesh = (geo, mat, x, y, z, rx = 0, ry = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, 0);
      m.castShadow = true;
      scene.add(m);
      meshes.push(m);
      return m;
    };

    const wireframeMat = (color) =>
      new THREE.MeshStandardMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });

    const solidMat = (color, metalness = 0.8, roughness = 0.2) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });

    // Central icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const icoMesh = addMesh(icoGeo, solidMat(0x00d4ff, 0.9, 0.1), 0, 0, 0);

    // Wireframe shell around it
    addMesh(new THREE.IcosahedronGeometry(1.55, 1), wireframeMat(0x7c3aed), 0, 0, 0);

    // Orbiting torus
    const torusGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 120);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 1, roughness: 0 });
    const torus1 = addMesh(torusGeo, torusMat, 0, 0, 0, Math.PI / 4, 0);

    const torus2 = addMesh(
      new THREE.TorusGeometry(2.4, 0.04, 16, 120),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 1, roughness: 0 }),
      0, 0, 0, -Math.PI / 4, Math.PI / 3
    );

    // Floating octahedrons
    const oct = [
      { pos: [-3.5, 2, -1], color: 0x00ff88 },
      { pos: [3.8, -1.5, -2], color: 0x7c3aed },
      { pos: [-2.5, -2.5, -1], color: 0x00d4ff },
      { pos: [3, 2.5, -3], color: 0xff6b6b },
      { pos: [1.5, 3.5, -2], color: 0x00d4ff },
    ];
    oct.forEach(({ pos, color }) => {
      const size = 0.2 + Math.random() * 0.35;
      addMesh(new THREE.OctahedronGeometry(size), solidMat(color), ...pos);
    });

    // Small floating boxes
    const boxes = [
      { pos: [-4, 0, -2], color: 0x00d4ff },
      { pos: [4.5, 1, -3], color: 0x7c3aed },
      { pos: [-1, -3.5, -1], color: 0x00ff88 },
      { pos: [2.5, -3, -2], color: 0xff6b6b },
    ];
    boxes.forEach(({ pos, color }) => {
      const s = 0.15 + Math.random() * 0.25;
      addMesh(new THREE.BoxGeometry(s, s, s), solidMat(color), ...pos);
    });

    // ── Mouse parallax ──────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ──────────────────────────────────────────────────────
    let frame;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth follow
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Camera drift
      camera.position.x = targetX * 1.2;
      camera.position.y = -targetY * 0.8;
      camera.lookAt(scene.position);

      // Central ico rotation
      icoMesh.rotation.y = t * 0.3;
      icoMesh.rotation.x = t * 0.15;

      // Torus rings
      torus1.rotation.y = t * 0.4;
      torus1.rotation.x = Math.PI / 4 + t * 0.1;
      torus2.rotation.z = t * 0.35;
      torus2.rotation.y = t * 0.2;

      // Float all meshes
      meshes.forEach((m, i) => {
        if (m === icoMesh || m === torus1 || m === torus2) return;
        m.rotation.x += 0.005 + i * 0.001;
        m.rotation.y += 0.008 + i * 0.0005;
        m.position.y += Math.sin(t + i) * 0.002;
      });

      // Animate point lights
      pointLight1.position.x = Math.sin(t * 0.7) * 6;
      pointLight1.position.y = Math.cos(t * 0.5) * 4;
      pointLight2.position.x = Math.cos(t * 0.6) * 5;
      pointLight2.position.z = Math.sin(t * 0.4) * 4;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />;
}
