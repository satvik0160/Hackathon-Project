/**
 * The shared stage set: everything six scenes would otherwise each rebuild.
 *
 * Per chapter this assembles, in one coordinate system:
 *   - a theme-targeted backdrop (a deep-ink vertical wash in dark mode, a pale
 *     paper wash in light), sized off the frustum so it always fills frame;
 *   - a soft elliptical contact shadow on the floor;
 *   - a drifting gold-dust field (the same particles, never re-randomised);
 *   - a restrained constellation backdrop: a few dozen faint stars and a
 *     sparser handful of linked ones, slanted along the Milky Way band but
 *     never a nebula wallpaper;
 *   - a studio lighting rig: warm key, cool fill, gold rim, plus a small
 *     RoomEnvironment so MeshStandard/MeshPhysical materials get real
 *     speculars instead of hand-painted fake ones.
 *
 * Everything is driven from the chapter's own progress value via `update()`,
 * so nothing here moves on a clock the rest of the page disagrees with.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, mix, smoothstep } from '../motion.js';

/* Source-space colours. IMPORTANT: the dark set is written to survive the
   app's `html.dark { filter: invert(1) hue-rotate(180deg) ... }` pass — the
   canvas carries `.revert-dark`, so unlike the DOM these hex values render
   exactly as authored in both themes. Solve new values with the closed-form
   chain, not by eye (see the palette notes in landing.css). */
const BACKDROPS = {
  dark: {
    top: '#060a18',
    mid: '#0e1430',
    bottom: '#05070f',
    shadow: 0x03040a,
    star: 0x9fb2d8,
    dust: 0xe2b76a,
  },
  light: {
    top: '#f2f4fc',
    mid: '#e6eaf8',
    bottom: '#dfe4f2',
    shadow: 0x33395c,
    star: 0x8f97b8,
    dust: 0xb45309,
  },
};

function makeBackdropTrack(colors) {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(0.52, colors.mid);
  gradient.addColorStop(1, colors.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeRig({ palette, depth }) {
  const rig = new THREE.Group();

  const key = new THREE.DirectionalLight(0xfff2dc, 3.2);
  key.position.set(6, 9, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = -depth;
  key.shadow.camera.right = depth;
  key.shadow.camera.top = depth;
  key.shadow.camera.bottom = -depth;
  key.shadow.bias = -0.0005;
  rig.add(key);

  const fill = new THREE.DirectionalLight(palette.indigo, 0.55);
  fill.position.set(-7, 2, 6);
  rig.add(fill);

  const rim = new THREE.DirectionalLight(palette.gold, 1.35);
  rim.position.set(-4, 5, -7);
  rig.add(rim);

  const bounce = new THREE.HemisphereLight(palette.faint, 0x05070d, 0.5);
  rig.add(bounce);

  return rig;
}

/**
 * Builds the stage set. `depth` scales the shadow frustum; `floorY` places the
 * contact shadow relative to the chapter group's origin (in local units).
 */
export function createStageSet({ scene, renderer, palette, theme, depth = 9, floorY = -3.6 }) {
  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const colors = BACKDROPS[theme] ?? BACKDROPS.dark;

  /* ---- backdrop plane, sized off the frustum ---- */
  const backdropTexture = track(makeBackdropTrack(colors));
  const backdropMaterial = track(new THREE.MeshBasicMaterial({ map: backdropTexture, depthWrite: false }));
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backdropMaterial);
  backdrop.name = 'stage-backdrop';
  backdrop.renderOrder = -10;
  backdrop.position.set(0, 0, -depth - 2);
  backdrop.userData.backdrop = true;
  scene.add(backdrop);

  /* ---- constellation band ---- */
  const starCount = 90;
  const starGeometry = track(new THREE.BufferGeometry());
  {
    const positions = new Float32Array(starCount * 3);
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < starCount; i += 1) {
      // A slanted band plus a light scatter — the Milky Way suggestion.
      const band = i < 64;
      const x = (random() - 0.5) * 46;
      const y = band ? (random() - 0.5) * 7 + (x / 46) * 5 : (random() - 0.5) * 22;
      const z = -14 - random() * 6;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }
  const starMaterial = track(
    new THREE.PointsMaterial({
      color: colors.star,
      size: 0.075,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.position.set(0, 0, -depth - 1);
  scene.add(stars);

  /* linked constellation subset: a handful of line pairs */
  const linkGeometry = track(new THREE.BufferGeometry());
  {
    const points = [];
    const starPositions = starGeometry.attributes.position;
    for (let i = 2; i < 20; i += 4) {
      points.push(
        starPositions.getX(i),
        starPositions.getY(i),
        starPositions.getZ(i),
        starPositions.getX(i + 1),
        starPositions.getY(i + 1),
        starPositions.getZ(i + 1)
      );
    }
    linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  }
  const linkMaterial = track(
    new THREE.LineBasicMaterial({ color: colors.star, transparent: true, opacity: 0.14, depthWrite: false })
  );
  const links = new THREE.LineSegments(linkGeometry, linkMaterial);
  scene.add(links);

  /* ---- gold dust ---- */
  const dustCount = 120;
  const dustGeometry = track(new THREE.BufferGeometry());
  const dustSeeds = [];
  {
    const positions = new Float32Array(dustCount * 3);
    let seed = 23;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < dustCount; i += 1) {
      positions[i * 3] = (random() - 0.5) * 26;
      positions[i * 3 + 1] = (random() - 0.5) * 14;
      positions[i * 3 + 2] = -3 - random() * 7;
      dustSeeds.push(random() * Math.PI * 2);
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }
  const dustMaterial = track(
    new THREE.PointsMaterial({
      color: colors.dust,
      size: 0.055,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  /* ---- soft contact shadow ---- */
  const shadowTexture = track(makeShadowTexture());
  const shadowMaterial = track(
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.5, depthWrite: false })
  );
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = floorY - 0.01;
  shadow.renderOrder = -5;
  const shadowGroup = new THREE.Group();
  shadowGroup.add(shadow);

  /* ---- studio rig + environment speculars ---- */
  const rig = makeRig({ palette, depth });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  });
  scene.environment = environment;
  scene.environmentIntensity = 0.22;

  const update = (dt, elapsed, progress = 0, pointer = null) => {
    // Dust drifts on the chapter's own clock, eased to a stop under reduced
    // motion (the caller simply stops calling update there).
    const positions = dustGeometry.attributes.position;
    for (let i = 0; i < dustCount; i += 1) {
      const seed = dustSeeds[i];
      positions.setY(i, positions.getY(i) + Math.sin(elapsed * 0.35 + seed) * 0.0018);
      positions.setX(i, positions.getX(i) + Math.cos(elapsed * 0.22 + seed) * 0.0012);
    }
    positions.needsUpdate = true;
    dustMaterial.opacity = 0.34 + Math.sin(elapsed * 0.6) * 0.08;

    // A very slow parallax so the sky is alive without being a screensaver.
    stars.rotation.y = Math.sin(elapsed * 0.02) * 0.02 + (pointer ? pointer.x * 0.012 : 0);
    starMaterial.opacity = 0.4 + smoothstep(0, 1, Math.sin(elapsed * 0.11)) * 0.2;
    links.rotation.y = stars.rotation.y;

    // Backdrop dims a touch as a chapter's scrub deepens — reads as the
    // camera pushing into the scene.
    backdropMaterial.color.setScalar(mix(1, 0.72, clamp(progress)));
    shadowMaterial.opacity = 0.42 * (1 - clamp(progress * 1.8, 0, 1));
  };

  /**
   * Fits the backdrop and contact shadow to the camera's current frustum.
   * Cheap enough to call every frame, which keeps everything sized through
   * both resizes and the scenes' own camera moves.
   */
  const fit = (camera) => {
    const vFov = (camera.fov * Math.PI) / 180;
    const half = Math.tan((vFov / 2) * 1.06);
    const distance = camera.position.z - backdrop.position.z;
    const height = 2 * half * distance;
    const width = height * camera.aspect;
    backdrop.scale.set(width, height, 1);
    const floorWidth = 2 * half * camera.position.z * camera.aspect;
    shadow.scale.set(floorWidth * 0.4, floorWidth * 0.22, 1);
  };

  const dispose = () => {
    disposables.forEach((object) => object.dispose?.());
    environment.dispose();
    pmrem.dispose();
    scene.environment = null;
  };

  return { update, fit, dispose, rig, shadowGroup, backdrop };
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
