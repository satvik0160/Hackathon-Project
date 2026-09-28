/**
 * Shared WebGL stage for the landing page chapters.
 *
 * One renderer + one camera + exactly one requestAnimationFrame loop per
 * chapter, and nothing else. Everything a scene needs to talk to the page —
 * pointer position, section progress, frame delta — is read from the stage
 * rather than created ad hoc, which is what keeps three chapters on screen
 * from scheduling three competing loops.
 *
 * Lifecycle guarantees (the parts that are easy to get wrong):
 *  - rendering stops while a chapter is off screen or the tab is hidden;
 *  - device pixel ratio is capped (2 for the hero, 1.5 for the rest — six
 *    full-viewport canvases must not each ask for full-retina buffers);
 *  - every geometry/material/texture is disposed on teardown;
 *  - a lost WebGL context stops the loop and reports back so the chapter can
 *    swap in its static diagram instead of showing a blank box.
 */
import * as THREE from 'three';
import { clamp } from '../motion.js';

const MAX_PIXEL_RATIO = 2;
const MAX_FRAME_DELTA = 1 / 20; // never integrate more than 50 ms in one step

export function createStage(canvas, { pointerElement = canvas, reduced = false, maxPixelRatio = MAX_PIXEL_RATIO } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Filmic response: metals and emissives roll off instead of clipping, which
  // is what keeps the gold from reading as a flat yellow blob.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(0, 0, 14);

  const state = {
    width: 1,
    height: 1,
    aspect: 1,
    dt: 0,
    elapsed: 0,
    /** Damped, normalized -1..1 pointer inside the chapter. */
    pointer: new THREE.Vector2(0, 0),
    /** Raw pointer target the damped value chases. */
    pointerTarget: new THREE.Vector2(0, 0),
    pointerInside: false,
    /** Set on every pointer move; scenes clear it once they have raycast. */
    pointerMoved: false,
  };

  const listeners = { down: new Set(), up: new Set(), enter: new Set(), leave: new Set() };

  let update = () => {};
  let frameId = 0;
  let running = false;
  let lastSeconds = 0;
  let disposed = false;
  let lost = false;
  let onContextLost = null;
  let resizeObserver = null;

  const emit = (type, event, ndc) => {
    listeners[type].forEach((fn) => fn(event, ndc));
  };

  const ndcFromEvent = (event) => {
    const bounds = pointerElement.getBoundingClientRect();
    const width = bounds.width || 1;
    const height = bounds.height || 1;
    return new THREE.Vector2(
      clamp(((event.clientX - bounds.left) / width) * 2 - 1, -1, 1),
      clamp(-(((event.clientY - bounds.top) / height) * 2 - 1), -1, 1)
    );
  };

  const handlePointerMove = (event) => {
    const ndc = ndcFromEvent(event);
    state.pointerTarget.copy(ndc);
    state.pointerInside = true;
    state.pointerMoved = true;
  };

  const handlePointerEnter = (event) => {
    state.pointerInside = true;
    emit('enter', event, ndcFromEvent(event));
  };

  const handlePointerLeave = () => {
    state.pointerInside = false;
    state.pointerTarget.set(0, 0);
    emit('leave');
  };

  const handlePointerDown = (event) => {
    emit('down', event, ndcFromEvent(event));
  };

  const handlePointerUp = (event) => {
    emit('up', event, ndcFromEvent(event));
  };

  const handleContextLost = (event) => {
    event.preventDefault();
    lost = true;
    stop();
    if (onContextLost) onContextLost();
  };

  const resize = () => {
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    if (width === state.width && height === state.height) return;
    state.width = width;
    state.height = height;
    state.aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = state.aspect;
    camera.updateProjectionMatrix();
    if (reduced) render();
  };

  const render = () => {
    if (lost || disposed) return;
    renderer.render(scene, camera);
  };

  const frame = (timeMs) => {
    if (!running || disposed) return;
    const seconds = timeMs / 1000;
    const dt = lastSeconds ? Math.min(seconds - lastSeconds, MAX_FRAME_DELTA) : 0;
    lastSeconds = seconds;
    state.dt = dt;
    state.elapsed += dt;

    // 1 - e^(-6 * dt): responsive, and identical on 60 Hz and 144 Hz.
    const alpha = 1 - Math.exp(-6 * Math.max(dt, 1 / 240));
    state.pointer.x += (state.pointerTarget.x - state.pointer.x) * alpha;
    state.pointer.y += (state.pointerTarget.y - state.pointer.y) * alpha;

    update(dt, state.elapsed, state);
    state.pointerMoved = false;
    render();

    frameId = window.requestAnimationFrame(frame);
  };

  function start() {
    if (disposed || lost || running) return;
    running = true;
    lastSeconds = 0;
    if (reduced) {
      // Static pose: draw once, then only when the layout or theme changes.
      resize();
      render();
      return;
    }
    frameId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    if (resizeObserver) resizeObserver.disconnect();
    pointerElement.removeEventListener('pointermove', handlePointerMove);
    pointerElement.removeEventListener('pointerenter', handlePointerEnter);
    pointerElement.removeEventListener('pointerleave', handlePointerLeave);
    pointerElement.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    listeners.down.clear();
    listeners.up.clear();
    listeners.enter.clear();
    listeners.leave.clear();

    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      const material = object.material;
      if (!material) return;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((entry) => {
        Object.values(entry).forEach((value) => {
          if (value && value.isTexture) value.dispose();
        });
        entry.dispose();
      });
    });
    scene.clear();
    renderer.dispose();
  }

  pointerElement.addEventListener('pointermove', handlePointerMove, { passive: true });
  pointerElement.addEventListener('pointerenter', handlePointerEnter, { passive: true });
  pointerElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  pointerElement.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('pointerup', handlePointerUp, { passive: true });
  canvas.addEventListener('webglcontextlost', handleContextLost, false);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
  }
  resize();

  return {
    THREE,
    renderer,
    scene,
    camera,
    state,
    setUpdate(fn) {
      update = fn;
    },
    onPointer(type, fn) {
      listeners[type].add(fn);
      return () => listeners[type].delete(fn);
    },
    onContextLost(fn) {
      onContextLost = fn;
    },
    resize,
    render,
    start,
    stop,
    dispose,
  };
}
