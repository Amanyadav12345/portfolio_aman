import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ProjectsScene() {
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
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 8;

    scene.add(new THREE.AmbientLight(0x050515, 1));

    // ── Neural network nodes ─────────────────────────────────────────────
    const NODE_COUNT = 90;
    const CONNECT_DIST = 3.2;
    const BOUNDS = { x: 14, y: 9, z: 5 };

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS.x,
        (Math.random() - 0.5) * BOUNDS.y,
        (Math.random() - 0.5) * BOUNDS.z
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.003
      ),
    }));

    // Points
    const pPositions = new Float32Array(NODE_COUNT * 3);
    nodes.forEach((n, i) => {
      pPositions[i * 3]     = n.pos.x;
      pPositions[i * 3 + 1] = n.pos.y;
      pPositions[i * 3 + 2] = n.pos.z;
    });
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.1, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Lines — compute once, preallocate a big buffer
    const MAX_LINES = NODE_COUNT * 10;
    const linePositions = new Float32Array(MAX_LINES * 6);
    const lineColors    = new Float32Array(MAX_LINES * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lGeo.setAttribute('color',    new THREE.BufferAttribute(lineColors,    3).setUsage(THREE.DynamicDrawUsage));
    const lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 });
    const lineSegs = new THREE.LineSegments(lGeo, lMat);
    scene.add(lineSegs);

    // Pulses along edges
    const pulses = [];
    const spawnPulse = () => {
      const i = Math.floor(Math.random() * NODE_COUNT);
      const j = Math.floor(Math.random() * NODE_COUNT);
      if (i === j) return;
      if (nodes[i].pos.distanceTo(nodes[j].pos) < CONNECT_DIST) {
        pulses.push({ from: nodes[i].pos, to: nodes[j].pos, t: 0, speed: 0.01 + Math.random() * 0.015 });
      }
    };

    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(20 * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3).setUsage(THREE.DynamicDrawUsage));
    scene.add(new THREE.Points(pulseGeo, new THREE.PointsMaterial({ color: 0x00ff88, size: 0.18, transparent: true, opacity: 0.9 })));

    let frame;
    const clock = new THREE.Clock();

    const updateLines = () => {
      let seg = 0;
      const c1 = new THREE.Color(0x00d4ff);
      const c2 = new THREE.Color(0x7c3aed);

      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (seg >= MAX_LINES) break;
          const d = nodes[i].pos.distanceTo(nodes[j].pos);
          if (d < CONNECT_DIST) {
            const alpha = 1 - d / CONNECT_DIST;
            const mixed = c1.clone().lerp(c2, Math.random() < 0.3 ? 1 : 0);
            const base = seg * 6;
            linePositions[base]     = nodes[i].pos.x; linePositions[base + 1] = nodes[i].pos.y; linePositions[base + 2] = nodes[i].pos.z;
            linePositions[base + 3] = nodes[j].pos.x; linePositions[base + 4] = nodes[j].pos.y; linePositions[base + 5] = nodes[j].pos.z;
            lineColors[base]     = mixed.r * alpha; lineColors[base + 1] = mixed.g * alpha; lineColors[base + 2] = mixed.b * alpha;
            lineColors[base + 3] = mixed.r * alpha; lineColors[base + 4] = mixed.g * alpha; lineColors[base + 5] = mixed.b * alpha;
            seg++;
          }
        }
      }
      lGeo.setDrawRange(0, seg * 2);
      lGeo.attributes.position.needsUpdate = true;
      lGeo.attributes.color.needsUpdate = true;
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Move nodes
      nodes.forEach((n) => {
        n.pos.add(n.vel);
        if (Math.abs(n.pos.x) > BOUNDS.x / 2) n.vel.x *= -1;
        if (Math.abs(n.pos.y) > BOUNDS.y / 2) n.vel.y *= -1;
        if (Math.abs(n.pos.z) > BOUNDS.z / 2) n.vel.z *= -1;
        pPositions[nodes.indexOf(n) * 3]     = n.pos.x;
        pPositions[nodes.indexOf(n) * 3 + 1] = n.pos.y;
        pPositions[nodes.indexOf(n) * 3 + 2] = n.pos.z;
      });
      pGeo.attributes.position.needsUpdate = true;

      if (Math.floor(t * 60) % 2 === 0) updateLines();
      if (Math.random() < 0.04 && pulses.length < 18) spawnPulse();

      // Update pulses
      let pi = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const pos = p.from.clone().lerp(p.to, p.t);
        pulsePos[pi * 3]     = pos.x;
        pulsePos[pi * 3 + 1] = pos.y;
        pulsePos[pi * 3 + 2] = pos.z;
        pi++;
      }
      pulseGeo.setDrawRange(0, pi);
      pulseGeo.attributes.position.needsUpdate = true;

      // Gentle camera drift
      camera.position.x = Math.sin(t * 0.08) * 0.8;
      camera.position.y = Math.cos(t * 0.06) * 0.5;
      camera.lookAt(0, 0, 0);

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
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />;
}
