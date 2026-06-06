import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SKILLS = [
  // Languages
  { label: 'Java',       cat: '#ff6b6b' },
  { label: 'Python',     cat: '#ff6b6b' },
  { label: 'JavaScript', cat: '#ff6b6b' },
  { label: 'TypeScript', cat: '#ff6b6b' },
  { label: 'Dart',       cat: '#ff6b6b' },
  { label: 'Kotlin',     cat: '#ff6b6b' },
  { label: 'Ruby',       cat: '#ff6b6b' },
  { label: 'Rust',       cat: '#ff6b6b' },
  // Frontend
  { label: 'React',      cat: '#00d4ff' },
  { label: 'Angular',    cat: '#00d4ff' },
  { label: 'Vue.js',     cat: '#00d4ff' },
  { label: 'Next.js',    cat: '#00d4ff' },
  { label: 'Flutter',    cat: '#00d4ff' },
  { label: 'Svelte',     cat: '#00d4ff' },
  { label: 'Tailwind',   cat: '#00d4ff' },
  { label: 'Three.js',   cat: '#00d4ff' },
  // Backend
  { label: 'Node.js',    cat: '#00ff88' },
  { label: 'Spring Boot',cat: '#00ff88' },
  { label: 'Django',     cat: '#00ff88' },
  { label: 'Express.js', cat: '#00ff88' },
  { label: 'GraphQL',    cat: '#00ff88' },
  // Databases
  { label: 'PostgreSQL', cat: '#ffd700' },
  { label: 'MongoDB',    cat: '#ffd700' },
  { label: 'MySQL',      cat: '#ffd700' },
  { label: 'CockroachDB',cat: '#ffd700' },
  { label: 'SQLite',     cat: '#ffd700' },
  // AI / ML
  { label: 'TensorFlow', cat: '#b06aed' },
  { label: 'PyTorch',    cat: '#b06aed' },
  { label: 'Scikit-learn',cat:'#b06aed' },
  { label: 'OpenCV',     cat: '#b06aed' },
  { label: 'Pandas',     cat: '#b06aed' },
  { label: 'BERT',       cat: '#b06aed' },
  { label: 'Mistral-7B', cat: '#b06aed' },
  // DevOps
  { label: 'Docker',     cat: '#ff8c00' },
  { label: 'Jenkins',    cat: '#ff8c00' },
  { label: 'AWS',        cat: '#ff8c00' },
  { label: 'Linux',      cat: '#ff8c00' },
  { label: 'Git',        cat: '#ff8c00' },
  { label: 'Nginx',      cat: '#ff8c00' },
  // Other
  { label: 'GSAP',       cat: '#ff69b4' },
  { label: 'D3.js',      cat: '#ff69b4' },
  { label: 'Cytoscape',  cat: '#ff69b4' },
  { label: 'Arduino',    cat: '#ff69b4' },
  { label: 'Selenium',   cat: '#ff69b4' },
];

export default function SkillsOrb() {
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
    camera.position.z = 7;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl = new THREE.PointLight(0x00d4ff, 60, 25);
    pl.position.set(4, 4, 4);
    scene.add(pl);
    const pl2 = new THREE.PointLight(0x7c3aed, 50, 25);
    pl2.position.set(-4, -3, 2);
    scene.add(pl2);

    const makeSprite = (text, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 72;
      const ctx = canvas.getContext('2d');
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);

      ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, 4, 248, 64, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 36);

      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.7, 0.48, 1);
      return sprite;
    };

    const group = new THREE.Group();
    const N = SKILLS.length;

    SKILLS.forEach((skill, i) => {
      const phi   = Math.acos(-1 + (2 * i) / N);
      const theta = Math.sqrt(N * Math.PI) * phi;
      const r = 3.2;
      const sprite = makeSprite(skill.label, skill.cat);
      sprite.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      group.add(sprite);
    });

    // Central core
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.75, 4),
      new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.95, roughness: 0.05, emissive: 0x001122 })
    );
    group.add(core);

    // Wireframe shell
    group.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 2),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.3 })
    ));

    // Orbit rings
    const addRing = (r, color, rx, ry) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.015, 8, 100),
        new THREE.MeshStandardMaterial({ color, metalness: 1, transparent: true, opacity: 0.55 })
      );
      m.rotation.set(rx, ry, 0);
      group.add(m);
      return m;
    };
    const ring1 = addRing(1.7, 0x00d4ff, Math.PI / 4, 0);
    const ring2 = addRing(1.7, 0x7c3aed, -Math.PI / 4, Math.PI / 3);
    const ring3 = addRing(2.0, 0x00ff88, Math.PI / 2, 0);

    scene.add(group);

    // Legend (static DOM overlay — not Three.js)
    const categories = [
      { label: 'Languages', color: '#ff6b6b' },
      { label: 'Frontend',  color: '#00d4ff' },
      { label: 'Backend',   color: '#00ff88' },
      { label: 'Databases', color: '#ffd700' },
      { label: 'AI / ML',   color: '#b06aed' },
      { label: 'DevOps',    color: '#ff8c00' },
      { label: 'Other',     color: '#ff69b4' },
    ];

    // Build legend overlay
    const legend = document.createElement('div');
    legend.style.cssText = `
      position:absolute; bottom:1.5rem; left:50%; transform:translateX(-50%);
      display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;
      font-family:monospace; font-size:0.7rem; letter-spacing:1px;
      pointer-events:none; z-index:2;
    `;
    categories.forEach(({ label, color }) => {
      const dot = document.createElement('span');
      dot.style.cssText = `display:flex;align-items:center;gap:0.3rem;color:rgba(255,255,255,0.6);`;
      dot.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span>${label}`;
      legend.appendChild(dot);
    });
    mount.style.position = 'relative';
    mount.appendChild(legend);

    // Mouse drag
    let isDragging = false, prevX = 0, prevY = 0;
    let rotVelX = 0.005, rotVelY = 0;
    let rotY = 0, rotX = 0;

    const onDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp   = () => { isDragging = false; };
    const onMove = (e) => {
      if (!isDragging) return;
      rotVelX = (e.clientX - prevX) * 0.005;
      rotVelY = (e.clientY - prevY) * 0.005;
      rotY += rotVelX; rotX += rotVelY;
      prevX = e.clientX; prevY = e.clientY;
    };

    mount.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    let frame;
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!isDragging) {
        rotVelX *= 0.96;
        rotY += rotVelX + 0.003;
      }
      rotVelY *= 0.95; rotX += rotVelY;

      group.rotation.y = rotY;
      group.rotation.x = rotX;

      ring1.rotation.z = t * 0.5;
      ring2.rotation.z = -t * 0.45;
      ring3.rotation.y = t * 0.35;
      core.rotation.y  = t * 0.4;

      pl.position.set(Math.sin(t * 0.6) * 5, Math.cos(t * 0.4) * 4, 3);

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
      mount.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      if (mount.contains(legend)) mount.removeChild(legend);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />;
}
