import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

/* --------------------------------------------------------------------------
 * SpiralScene — creates and manages both renderers, the shared scene/camera,
 * lighting, and the ambient starfield for the DevAstra spiral landing page.
 *
 * Usage:
 *   const sceneAPI = createSpiralScene(hostElement);
 *   // sceneAPI.scene, .camera, .webglRenderer, .cssRenderer, .cssScene
 *   // sceneAPI.render(), .resize(), .dispose()
 * -------------------------------------------------------------------------- */

const GOLD = 0xd9af67;
const INDIGO = 0x6366f1;
const VIOLET = 0x8b5cf6;
const TEAL = 0x14b8a6;

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, 'rgba(255,255,255,0.7)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createSpiralScene(host) {
  const disposables = [];
  const track = (obj) => { disposables.push(obj); return obj; };

  // === WebGL Renderer ===
  const webglRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  webglRenderer.setClearColor(0x060612, 1);
  webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  webglRenderer.toneMappingExposure = 1.1;
  webglRenderer.domElement.style.position = 'absolute';
  webglRenderer.domElement.style.inset = '0';
  webglRenderer.domElement.style.width = '100%';
  webglRenderer.domElement.style.height = '100%';
  webglRenderer.domElement.style.zIndex = '1';
  webglRenderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(webglRenderer.domElement);

  // === CSS3D Renderer ===
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.inset = '0';
  cssRenderer.domElement.style.width = '100%';
  cssRenderer.domElement.style.height = '100%';
  cssRenderer.domElement.style.zIndex = '2';
  cssRenderer.domElement.style.pointerEvents = 'none';
  host.appendChild(cssRenderer.domElement);

  // === Shared Scene & Camera ===
  const scene = new THREE.Scene();
  const cssScene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 10);

  // === Lighting ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff0d8, 1.0);
  keyLight.position.set(5, 8, 8);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(INDIGO, 1.5, 60);
  rimLight.position.set(-10, -4, 8);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(TEAL, 0.8, 50);
  accentLight.position.set(8, -6, 5);
  scene.add(accentLight);

  const goldLight = new THREE.PointLight(GOLD, 0.6, 40);
  goldLight.position.set(0, 10, 3);
  scene.add(goldLight);

  // === Ambient Starfield ===
  const STAR_COUNT = 400;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starColors = new Float32Array(STAR_COUNT * 3);
  const glowTexture = track(makeGlowTexture());
  const tempColor = new THREE.Color();
  const starPalette = [GOLD, INDIGO, VIOLET, TEAL, 0xffffff, 0xffffff];

  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 12 + Math.random() * 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    tempColor.setHex(starPalette[(Math.random() * starPalette.length) | 0]);
    const dim = 0.3 + Math.random() * 0.5;
    starColors[i * 3] = tempColor.r * dim;
    starColors[i * 3 + 1] = tempColor.g * dim;
    starColors[i * 3 + 2] = tempColor.b * dim;
  }

  const starGeo = track(new THREE.BufferGeometry());
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMat = track(new THREE.PointsMaterial({
    size: 0.15,
    map: glowTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }));
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // === Central Axis (luminous gold-to-indigo vertical beam) ===
  const axisGroup = new THREE.Group();
  scene.add(axisGroup);

  // Core beam
  const beamGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 80, 16));
  const beamMat = track(new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.6,
  }));
  const beam = new THREE.Mesh(beamGeo, beamMat);
  axisGroup.add(beam);

  // Glow beam (wider, more transparent)
  const glowBeamGeo = track(new THREE.CylinderGeometry(0.12, 0.12, 80, 8));
  const glowBeamMat = track(new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
  }));
  const glowBeam = new THREE.Mesh(glowBeamGeo, glowBeamMat);
  axisGroup.add(glowBeam);

  // Ring markers along the axis
  for (let i = 0; i < 20; i++) {
    const y = -40 + i * 4;
    const ringGeo = track(new THREE.TorusGeometry(0.22, 0.015, 8, 32));
    const ringColor = i % 2 === 0 ? GOLD : INDIGO;
    const ringMat = track(new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.35,
    }));
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    axisGroup.add(ring);
  }

  // === Resize ===
  function resize() {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    webglRenderer.setSize(width, height, false);
    cssRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();

  // === Render ===
  function render() {
    webglRenderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
  }

  // === Dispose ===
  function dispose() {
    disposables.forEach(d => d.dispose?.());
    scene.clear();
    cssScene.clear();
    webglRenderer.dispose();
    webglRenderer.forceContextLoss?.();
    if (webglRenderer.domElement.parentNode === host) {
      host.removeChild(webglRenderer.domElement);
    }
    if (cssRenderer.domElement.parentNode === host) {
      host.removeChild(cssRenderer.domElement);
    }
  }

  return {
    scene,
    cssScene,
    camera,
    webglRenderer,
    cssRenderer,
    axisGroup,
    stars,
    track,
    resize,
    render,
    dispose,
  };
}
