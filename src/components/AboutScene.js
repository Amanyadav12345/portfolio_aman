import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── Code panel content ──────────────────────────────────────────────────
const PANELS = [
  {
    file: 'aman.js',
    lines: [
      { text: 'const dev = {',           color: '#cdd6f4' },
      { text: '  name: "Aman Yadav",',   color: '#a6e3a1' },
      { text: '  exp:  "5+ years",',     color: '#a6e3a1' },
      { text: '  stacks: Infinity,',     color: '#fab387' },
      { text: '  breaks: true,',         color: '#cba6f7' },
      { text: '  fixes:  true,',         color: '#cba6f7' },
      { text: '  ships:  eventually,',   color: '#fab387' },
      { text: '};',                      color: '#cdd6f4' },
      { text: '',                        color: '#cdd6f4' },
      { text: 'export default dev;',     color: '#89dceb' },
    ],
    bg:    '#1e1e2e',
    bar:   '#181825',
    w: 3.4, h: 2.2,
  },
  {
    file: 'terminal',
    lines: [
      { text: '$ git push origin main',  color: '#a6e3a1' },
      { text: '✓ Compressing objects',   color: '#6c7086' },
      { text: '✓ Writing: 100%',         color: '#6c7086' },
      { text: '🚀 Deployed to prod',     color: '#a6e3a1' },
      { text: '',                        color: '#cdd6f4' },
      { text: '$ npm run ship-it',       color: '#a6e3a1' },
      { text: '> Building…',             color: '#6c7086' },
      { text: '> Done in 2.3s',          color: '#fab387' },
    ],
    bg:    '#0f0f1a',
    bar:   '#0a0a12',
    w: 2.8, h: 2.0,
  },
];

// ── Floating symbols ────────────────────────────────────────────────────
const SYMS = ['{ }', '</>', '=>', '&&', '[ ]', 'async', 'class', '0x1F'];

// ── Canvas helpers ──────────────────────────────────────────────────────
function makePanelTex({ file, lines, bg, bar, w, h }) {
  const PX = 512, PY = Math.round(PX * (h / w));
  const c  = document.createElement('canvas');
  c.width  = PX; c.height = PY;
  const ctx = c.getContext('2d');

  // Body
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PX, PY);

  // Title bar
  const barH = 28;
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, PX, barH);

  // Traffic lights
  [['#ff5f57', 16], ['#febc2e', 38], ['#28c840', 60]].forEach(([col, x]) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, barH / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Filename
  ctx.fillStyle = '#6c7086';
  ctx.font      = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(file, PX / 2, barH - 8);
  ctx.textAlign = 'left';

  // Line numbers + code
  lines.forEach((ln, i) => {
    const y = barH + 14 + i * 22;
    ctx.fillStyle = '#3a3a5a';
    ctx.font      = '11px monospace';
    ctx.fillText(String(i + 1).padStart(2, ' '), 8, y);
    ctx.fillStyle = ln.color;
    ctx.font      = '13px monospace';
    ctx.fillText(ln.text, 36, y);
  });

  // Cursor blink on last line
  const cursorY = barH + 14 + lines.length * 22 + 4;
  ctx.fillStyle = '#cba6f7';
  ctx.fillRect(36, cursorY, 2, 14);

  return new THREE.CanvasTexture(c);
}

function makeSymSprite(text) {
  const c   = document.createElement('canvas');
  c.width   = 200; c.height = 60;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 200, 60);
  ctx.font      = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // glow
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = 'rgba(0,212,255,0.85)';
  ctx.fillText(text, 100, 30);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(1.1, 0.33, 1);
  return sp;
}

// ── Component ───────────────────────────────────────────────────────────
export default function AboutScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer, animId, ro;
    const textures = [];

    const init = () => {
      const rect = mount.getBoundingClientRect();
      const W = rect.width  || mount.offsetWidth  || 520;
      const H = rect.height || mount.offsetHeight || 520;
      if (W < 10 || H < 10) return false;

      // ── Renderer ─────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
      camera.position.set(0, 0, 6.5);

      // ── Lighting ─────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x223344, 2.5));
      const pl1 = new THREE.PointLight(0x00d4ff, 60, 18);
      pl1.position.set(-2, 2, 4);
      scene.add(pl1);
      const pl2 = new THREE.PointLight(0x7c3aed, 50, 18);
      pl2.position.set(3, -1, 3);
      scene.add(pl2);
      const pl3 = new THREE.PointLight(0x00ff88, 30, 12);
      pl3.position.set(0, -3, 2);
      scene.add(pl3);

      // ── Code panels ──────────────────────────────────────────────────
      const panelGroup = new THREE.Group();

      const panelDefs = [
        { panel: PANELS[0], pos: [-0.8,  0.35,  0],    rot: [0.04, 0.28,  -0.04] },
        { panel: PANELS[1], pos: [ 1.5, -0.55, -1.8],  rot: [0.02, -0.22,  0.03] },
      ];

      panelDefs.forEach(({ panel, pos, rot }) => {
        const tex = makePanelTex(panel);
        textures.push(tex);

        const geo = new THREE.PlaneGeometry(panel.w, panel.h);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.96 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.rotation.set(...rot);
        panelGroup.add(mesh);

        // Screen frame / border
        const edges = new THREE.EdgesGeometry(geo);
        const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4 }));
        frame.position.set(...pos);
        frame.rotation.set(...rot);
        panelGroup.add(frame);

        // Glow point near panel
        const gp = new THREE.PointLight(0x00d4ff, 12, 4);
        gp.position.set(pos[0], pos[1], pos[2] + 0.6);
        panelGroup.add(gp);
      });

      // ── Connecting beam between panels ───────────────────────────────
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.8,  0.35,  0),
        new THREE.Vector3( 1.5, -0.55, -1.8),
      ]);
      panelGroup.add(new THREE.Line(beamGeo, new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.2 })));

      scene.add(panelGroup);

      // ── Floating code symbols ─────────────────────────────────────────
      const symGroup = new THREE.Group();
      SYMS.forEach((s, i) => {
        const sp    = makeSymSprite(s);
        const angle = (i / SYMS.length) * Math.PI * 2;
        const r     = 2.5 + (i % 3) * 0.5;
        sp.position.set(
          Math.cos(angle) * r,
          Math.sin(angle) * r * 0.6,
          -1 + (i % 3) * -0.5
        );
        sp.userData.baseY  = sp.position.y;
        sp.userData.offset = i * 0.8;
        symGroup.add(sp);
      });
      scene.add(symGroup);

      // ── Small floating tech orbs ─────────────────────────────────────
      const orbColors = [0x00d4ff, 0x7c3aed, 0x00ff88, 0xff6b6b, 0xffd700];
      const orbs = [];
      orbColors.forEach((col, i) => {
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 12, 12),
          new THREE.MeshStandardMaterial({ color: col, metalness: 0.9, roughness: 0.05, emissive: col, emissiveIntensity: 0.5 })
        );
        const angle = (i / orbColors.length) * Math.PI * 2;
        orb.position.set(Math.cos(angle) * 3, Math.sin(angle) * 1.8, -0.5 + i * -0.3);
        orb.userData.angle  = angle;
        orb.userData.radius = 3;
        orb.userData.speed  = 0.18 + i * 0.04;
        scene.add(orb);
        orbs.push(orb);
      });

      // ── Particle field ────────────────────────────────────────────────
      const pCount = 600;
      const pPos   = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i*3]   = (Math.random() - 0.5) * 14;
        pPos[i*3+1] = (Math.random() - 0.5) * 10;
        pPos[i*3+2] = (Math.random() - 0.5) * 8;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.028, transparent: true, opacity: 0.4 })));

      // ── Mouse parallax ────────────────────────────────────────────────
      let mx = 0, my = 0, tmx = 0, tmy = 0;
      const onMouse = (e) => {
        const r = mount.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouse);

      // ── Animation ─────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      const tick  = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        // Smooth camera follow
        tmx += (mx - tmx) * 0.05;
        tmy += (my - tmy) * 0.05;
        camera.position.x = tmx * 1.2;
        camera.position.y = -tmy * 0.7;
        camera.lookAt(0, 0, 0);

        // Panels gentle float
        panelGroup.position.y = Math.sin(t * 0.4) * 0.08;
        panelGroup.rotation.y = Math.sin(t * 0.25) * 0.04;

        // Symbol drift
        symGroup.children.forEach((sp) => {
          sp.position.y = sp.userData.baseY + Math.sin(t * 0.7 + sp.userData.offset) * 0.18;
          sp.material.opacity = 0.55 + Math.sin(t * 0.9 + sp.userData.offset) * 0.25;
        });

        // Orbs orbit
        orbs.forEach((orb) => {
          orb.userData.angle += orb.userData.speed * 0.01;
          orb.position.x = Math.cos(orb.userData.angle) * orb.userData.radius;
          orb.position.y = Math.sin(orb.userData.angle) * orb.userData.radius * 0.5;
        });

        // Lights pulse
        pl1.intensity = 55 + Math.sin(t * 1.3) * 12;
        pl2.intensity = 45 + Math.cos(t * 1.1) * 10;

        renderer.render(scene, camera);
      };
      tick();

      renderer._cleanMouse  = () => window.removeEventListener('mousemove', onMouse);
      const onResize = () => {
        const nr = mount.getBoundingClientRect();
        if (!nr.width || !nr.height) return;
        camera.aspect = nr.width / nr.height;
        camera.updateProjectionMatrix();
        renderer.setSize(nr.width, nr.height);
      };
      window.addEventListener('resize', onResize);
      renderer._cleanResize = () => window.removeEventListener('resize', onResize);

      return true;
    };

    if (!init()) {
      ro = new ResizeObserver(() => { if (init()) { ro.disconnect(); ro = null; } });
      ro.observe(mount);
    }

    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(animId);
      textures.forEach(t => t.dispose());
      if (renderer) {
        renderer._cleanMouse?.();
        renderer._cleanResize?.();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}
