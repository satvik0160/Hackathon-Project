import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { SPIRAL_CARDS, CARD_COUNT } from './SpiralCardRegistry';
import { SpiralDirector } from './SpiralDirector';
import { useTheme } from '../../../hooks/useTheme';

const GITHUB_REPO_URL = 'https://github.com/satvik0160/Hackathon-Project-Ai-Manthan-2.0-';

/* ── Palette ─────────────────────────────────────────────────────────── */
const GOLD = 0xd9af67;
const INDIGO = 0x6366f1;
const VIOLET = 0x8b5cf6;
const TEAL = 0x14b8a6;

/* ── Helix constants (mirror SpiralDirector) ─────────────────────────── */
const ANGLE_STEP = (34 * Math.PI) / 180;
const VERTICAL_PITCH = 2.1;
const AXIS_RADIUS = 2.5;
const CARD_3D_SCALE = 0.0058;
const CARD_WIDTH_PX = 620;
const CARD_HEIGHT_PX = 680;

/* ── WebGL detection ─────────────────────────────────────────────────── */
function detectWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

function makeGlowTexture() {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(0.22,'rgba(255,255,255,0.7)');
  g.addColorStop(0.5,'rgba(255,255,255,0.2)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

/* ── No-WebGL Fallback ───────────────────────────────────────────────── */
function SpiralFallback() {
  return (
    <div className="spiral-fallback">
      {SPIRAL_CARDS.map((card) => {
        const Content = card.Content;
        return (
          <section key={card.id} id={card.id} className="spiral-fallback-card">
            <Content />
          </section>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SpiralLandingExperience
   ══════════════════════════════════════════════════════════════════════ */
export default function SpiralLandingExperience() {
  const hostRef = useRef(null);
  const webgl = useMemo(() => detectWebGL(), []);
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardDomNodes, setCardDomNodes] = useState([]);
  const reducedMotion = useMemo(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches, []);

  const scrollToCard = useCallback((cardId) => {
    const el = document.getElementById(`spiral-section-${cardId}`);
    if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  /* ── 3D setup effect ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!webgl || !hostRef.current) return;
    const host = hostRef.current;
    const disposables = [];
    const track = (o) => { disposables.push(o); return o; };

    /* WebGL Renderer */
    let wgl;
    try { wgl = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch { return; }
    wgl.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    wgl.setClearColor(0x060612, 1);
    wgl.toneMapping = THREE.ACESFilmicToneMapping;
    wgl.toneMappingExposure = 1.1;
    wgl.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;';
    wgl.domElement.setAttribute('aria-hidden','true');
    host.appendChild(wgl.domElement);

    /* CSS3D Renderer */
    const css = new CSS3DRenderer();
    css.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;';
    host.appendChild(css.domElement);

    /* Scene & Camera */
    const scene = new THREE.Scene();
    const cssScene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    /* Lighting */
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const kl = new THREE.DirectionalLight(0xfff0d8, 1.0);
    kl.position.set(5, 8, 8); scene.add(kl);
    const rl = new THREE.PointLight(INDIGO, 1.5, 60);
    rl.position.set(-10, -4, 8); scene.add(rl);
    const al = new THREE.PointLight(TEAL, 0.7, 50);
    al.position.set(8, -6, 5); scene.add(al);
    const gl = new THREE.PointLight(GOLD, 0.5, 40);
    gl.position.set(0, 10, 3); scene.add(gl);

    /* Starfield */
    const SC = 400;
    const sp = new Float32Array(SC * 3), sc2 = new Float32Array(SC * 3);
    const gt = track(makeGlowTexture()), tc = new THREE.Color();
    const pal = [GOLD, INDIGO, VIOLET, TEAL, 0xffffff, 0xffffff];
    for (let i = 0; i < SC; i++) {
      const r = 12 + Math.random() * 25;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      sp[i*3] = r*Math.sin(ph)*Math.cos(th);
      sp[i*3+1] = r*Math.cos(ph)*0.7;
      sp[i*3+2] = r*Math.sin(ph)*Math.sin(th);
      tc.setHex(pal[(Math.random()*pal.length)|0]);
      const d = 0.3 + Math.random()*0.5;
      sc2[i*3]=tc.r*d; sc2[i*3+1]=tc.g*d; sc2[i*3+2]=tc.b*d;
    }
    const sg = track(new THREE.BufferGeometry());
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(sc2, 3));
    const stars = new THREE.Points(sg, track(new THREE.PointsMaterial({
      size: 0.15, map: gt, vertexColors: true, transparent: true,
      opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    })));
    scene.add(stars);

    /* Central Axis */
    const axis = new THREE.Group(); scene.add(axis);
    axis.add(new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.035, 0.035, 80, 16)),
      track(new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 }))
    ));
    axis.add(new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.12, 0.12, 80, 8)),
      track(new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending }))
    ));
    for (let i = 0; i < 20; i++) {
      const rm = new THREE.Mesh(
        track(new THREE.TorusGeometry(0.22, 0.015, 8, 32)),
        track(new THREE.MeshBasicMaterial({ color: i%2===0?GOLD:INDIGO, transparent: true, opacity: 0.3 }))
      );
      rm.position.y = -40 + i * 4;
      rm.rotation.x = Math.PI / 2;
      axis.add(rm);
    }

    /* Card frames (WebGL) */
    const cardW = CARD_WIDTH_PX * CARD_3D_SCALE;
    const cardH = CARD_HEIGHT_PX * CARD_3D_SCALE;
    const fd = 0.06, cr = 0.12;
    function rrShape(w,h,r) {
      const s = new THREE.Shape();
      s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2);
      s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); s.lineTo(w/2,h/2-r);
      s.quadraticCurveTo(w/2,h/2,w/2-r,h/2); s.lineTo(-w/2+r,h/2);
      s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); s.lineTo(-w/2,-h/2+r);
      s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      return s;
    }
    const shape = rrShape(cardW, cardH, cr);
    const extCfg = { depth: fd, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 };
    const fgeo = track(new THREE.ExtrudeGeometry(shape, extCfg));
    fgeo.translate(0, 0, -fd/2);

    const frames = [];
    const cssObjs = [];
    const domEls = [];

    SPIRAL_CARDS.forEach((card, i) => {
      const theta = i * ANGLE_STEP;
      const y = -i * VERTICAL_PITCH;
      const x = AXIS_RADIUS * Math.cos(theta);
      const z = AXIS_RADIUS * Math.sin(theta);

      // WebGL frame
      const fm = track(new THREE.MeshStandardMaterial({
        color: 0x1a1a3e, metalness: 0.7, roughness: 0.3,
        transparent: true, opacity: 0.85,
        emissive: i === 0 ? GOLD : INDIGO, emissiveIntensity: 0.08,
      }));
      const f = new THREE.Mesh(fgeo.clone(), fm);
      f.position.set(x, y, z);
      f.rotation.y = theta + Math.PI / 2;
      scene.add(f);

      // Edge lines
      const eg = track(new THREE.EdgesGeometry(fgeo));
      const el = new THREE.LineSegments(eg, track(new THREE.LineBasicMaterial({
        color: i%2===0?GOLD:INDIGO, transparent: true, opacity: 0.5,
      })));
      el.position.copy(f.position); el.rotation.copy(f.rotation);
      scene.add(el);

      frames.push({ mesh: f, edges: el, mat: fm });

      // CSS3D card face
      const dom = document.createElement('div');
      dom.className = 'spiral-3d-card';
      dom.id = `spiral-card-face-${card.id}`;
      dom.style.width = `${CARD_WIDTH_PX}px`;
      dom.style.height = `${CARD_HEIGHT_PX}px`;
      dom.style.pointerEvents = 'auto';
      domEls.push(dom);

      const co = new CSS3DObject(dom);
      co.position.set(x, y, z);
      co.rotation.y = theta + Math.PI / 2;
      co.scale.setScalar(CARD_3D_SCALE);
      cssScene.add(co);
      cssObjs.push(co);
    });

    // Expose DOM elements for React portals
    setCardDomNodes([...domEls]);

    /* Director */
    const director = new SpiralDirector();

    /* Scroll */
    let sRaf = 0;
    const onScroll = () => {
      if (sRaf) return;
      sRaf = requestAnimationFrame(() => {
        sRaf = 0;
        const sy = window.scrollY;
        const ms = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        director.setScrollProgress(Math.max(0, Math.min(1, sy / ms)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Pointer */
    const onPtr = (e) => {
      const r = host.getBoundingClientRect();
      director.setPointer(
        ((e.clientX - r.left) / r.width - 0.5) * 2,
        ((e.clientY - r.top) / r.height - 0.5) * 2
      );
    };
    if (!reducedMotion) window.addEventListener('pointermove', onPtr, { passive: true });

    /* Resize */
    const resize = () => {
      const r = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      wgl.setSize(w, h, false);
      css.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize); ro.observe(host);
    } else window.addEventListener('resize', resize);

    /* Animation */
    const clock = new THREE.Clock();
    let fid = 0, running = true, lastAi = -1;

    function tick() {
      fid = 0;
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();
      stars.rotation.y = -t * 0.008;

      const st = director.update(dt);
      cam.position.set(st.cameraPosition.x + st.pointerX, st.cameraPosition.y - st.pointerY, st.cameraPosition.z);
      cam.lookAt(st.cameraLookAt);

      st.cardTransforms.forEach((ct, i) => {
        const { mesh, edges, mat } = frames[i];
        const co = cssObjs[i];
        mesh.position.copy(ct.position); edges.position.copy(ct.position); co.position.copy(ct.position);
        mesh.rotation.y = ct.rotationY; edges.rotation.y = ct.rotationY; co.rotation.y = ct.rotationY;
        const s = ct.scale;
        mesh.scale.setScalar(s); edges.scale.setScalar(s); co.scale.setScalar(CARD_3D_SCALE * s);
        mat.opacity = ct.opacity * 0.85;
        mat.emissiveIntensity = ct.isActive ? 0.15 : 0.05;
        const de = domEls[i];
        de.style.opacity = String(ct.opacity);
        de.style.pointerEvents = ct.isActive ? 'auto' : 'none';
        de.classList.toggle('spiral-3d-card--active', ct.isActive);
      });

      if (st.activeIndex !== lastAi) { lastAi = st.activeIndex; setActiveIndex(st.activeIndex); }

      wgl.render(scene, cam);
      css.render(cssScene, cam);
      fid = requestAnimationFrame(tick);
    }

    const start = () => { if (reducedMotion || fid || !running) return; clock.start(); fid = requestAnimationFrame(tick); };
    const vis = () => { running = !document.hidden; if (running) start(); };
    document.addEventListener('visibilitychange', vis);

    if (reducedMotion) {
      // Static frame + scroll redraw
      const drawStatic = () => {
        const st = director.update(0.016);
        cam.position.copy(st.cameraPosition); cam.lookAt(st.cameraLookAt);
        st.cardTransforms.forEach((ct, i) => {
          frames[i].mesh.position.copy(ct.position); frames[i].edges.position.copy(ct.position);
          cssObjs[i].position.copy(ct.position);
          frames[i].mesh.rotation.y = ct.rotationY; frames[i].edges.rotation.y = ct.rotationY;
          cssObjs[i].rotation.y = ct.rotationY;
          frames[i].mesh.scale.setScalar(ct.scale); frames[i].edges.scale.setScalar(ct.scale);
          cssObjs[i].scale.setScalar(CARD_3D_SCALE * ct.scale);
          domEls[i].style.opacity = String(ct.opacity);
          domEls[i].classList.toggle('spiral-3d-card--active', ct.isActive);
        });
        wgl.render(scene, cam); css.render(cssScene, cam);
      };
      drawStatic();
      const onScrollS = () => { onScroll(); requestAnimationFrame(drawStatic); };
      window.addEventListener('scroll', onScrollS, { passive: true });
    } else start();

    return () => {
      running = false;
      if (fid) cancelAnimationFrame(fid);
      if (sRaf) cancelAnimationFrame(sRaf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPtr);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', vis);
      if (ro) ro.disconnect();
      cssObjs.forEach(o => cssScene.remove(o));
      disposables.forEach(d => d.dispose?.());
      scene.clear(); cssScene.clear();
      wgl.dispose(); wgl.forceContextLoss?.();
      if (wgl.domElement.parentNode === host) host.removeChild(wgl.domElement);
      if (css.domElement.parentNode === host) host.removeChild(css.domElement);
      setCardDomNodes([]);
    };
  }, [webgl, reducedMotion]);

  if (!webgl) return <SpiralFallback />;

  return (
    <div className="spiral-landing">
      <SpiralHud activeIndex={activeIndex} scrollToCard={scrollToCard} />

      {/* Scroll sections (each card gets scroll distance) */}
      <div className="spiral-scroll-sections">
        {SPIRAL_CARDS.map((card) => (
          <section
            key={card.id}
            id={`spiral-section-${card.id}`}
            className="spiral-scroll-section"
            data-card-id={card.id}
          />
        ))}
      </div>

      {/* 3D viewport */}
      <div ref={hostRef} className="spiral-viewport" aria-label="3D spiral interface" />

      {/* React portals into CSS3D card faces */}
      {cardDomNodes.map((domNode, i) => {
        const card = SPIRAL_CARDS[i];
        if (!card || !domNode) return null;
        const Content = card.Content;
        return createPortal(<Content />, domNode, card.id);
      })}

      <footer className="spiral-footer">
        <div className="spiral-footer-inner">
          <div className="spiral-footer-grid">
            <div className="spiral-footer-brand">
              <div className="flex items-center gap-3">
                <span className="spiral-brand-badge">
                  <img src="/devlogo.jpg" alt="" aria-hidden="true" />
                </span>
                <span className="spiral-wordmark">DevAstra</span>
              </div>
              <p className="spiral-footer-desc">
                An AI-powered academia–industry skill intelligence platform. Built natively on InsForge.
              </p>
            </div>
            <div className="spiral-footer-col">
              <span className="spiral-footer-heading">EXPLORE</span>
              <button type="button" className="spiral-footer-link" onClick={() => scrollToCard('problem')}>The gap</button>
              <button type="button" className="spiral-footer-link" onClick={() => scrollToCard('copilot')}>Features</button>
              <button type="button" className="spiral-footer-link" onClick={() => scrollToCard('assess')}>How it works</button>
              <button type="button" className="spiral-footer-link" onClick={() => scrollToCard('students')}>Who it's for</button>
            </div>
            <div className="spiral-footer-col">
              <span className="spiral-footer-heading">GET STARTED</span>
              <Link className="spiral-footer-link" to="/login">Log In</Link>
              <Link className="spiral-footer-link" to="/register">Create an account</Link>
              <a className="spiral-footer-link" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" aria-hidden="true" /> GitHub repository
              </a>
            </div>
          </div>
          <div className="spiral-footer-bottom">
            <p>© {new Date().getFullYear()} DevAstra</p>
            <p>Master Your Skills. Shape Your Career.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── SpiralHud ───────────────────────────────────────────────────────── */
function SpiralHud({ activeIndex, scrollToCard }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`spiral-hud ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="spiral-hud-inner">
        <Link to="/" className="spiral-hud-brand" aria-label="DevAstra home">
          <span className="spiral-brand-badge">
            <img src="/devlogo.jpg" alt="" aria-hidden="true" />
          </span>
          <span className="spiral-hud-brand-text">
            <span className="spiral-wordmark">DevAstra</span>
            <span className="spiral-brand-sub">Intelligence OS</span>
          </span>
        </Link>

        <nav className="spiral-hud-nav" aria-label="Landing page sections">
          {[
            { label: 'The gap', id: 'problem' },
            { label: 'How it works', id: 'assess' },
            { label: 'Features', id: 'copilot' },
            { label: "Who it's for", id: 'students' },
          ].map(l => (
            <button key={l.id} type="button" className="spiral-hud-link" onClick={() => scrollToCard(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className="spiral-hud-progress">
          <span className="spiral-hud-counter">
            {String(activeIndex + 1).padStart(2, '0')} / {CARD_COUNT}
          </span>
        </div>

        <div className="spiral-hud-actions">
          <Link to="/login" className="spiral-btn spiral-btn-ghost">Log In</Link>
          <Link to="/register" className="spiral-btn spiral-btn-primary">
            Sign Up <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
