/**
 * Chapter 6 — the close.
 *
 * The story resolves: the hero's three plates — Assessed, Growth Path, Role
 * Match — drift in from their scattered hero positions and settle into one
 * aligned, interlocked constellation behind the CTA. Nothing here competes
 * with the buttons; the motion is slow, damped, and stops mattering once the
 * composition is assembled. The floor keeps a soft sheen so the object feels
 * placed in the same world as the chapters above.
 *
 * Progress comes from the chapter's ScrollTrigger-driven ref, so scrolling
 * backward genuinely re-scatters the plates.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

const PLATE_COUNT = 3;

export function createCtaResolve({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 8,
    floorY: -3.4,
  });
  scene.add(set.rig);
  scene.add(set.shadowGroup);

  const group = new THREE.Group();
  scene.add(group);

  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const metal = (accent, intensity = 0.35) =>
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.panel,
        metalness: 0.72,
        roughness: 0.3,
        clearcoat: 0.55,
        envMapIntensity: 1.25,
        emissive: palette[accent],
        emissiveIntensity: intensity,
        flatShading: true,
      })
    );

  /* three plates echo the hero: hexagon (gold), octagon (indigo), triangle-ish
     rounded slab (teal) — but smaller, quieter, arranged around the core */
  const hex = new THREE.Mesh(track(new THREE.CylinderGeometry(0.62, 0.62, 0.26, 6)), metal('gold', 0.4));
  const oct = new THREE.Mesh(track(new THREE.CylinderGeometry(0.56, 0.56, 0.24, 8)), metal('indigo', 0.4));
  const tri = new THREE.Mesh(track(new RoundedBoxGeometry(0.98, 0.98, 0.24, 3, 0.12)), metal('teal', 0.4));
  const core = new THREE.Mesh(
    track(new THREE.OctahedronGeometry(0.3, 0)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.gold,
        metalness: 0.9,
        roughness: 0.2,
        envMapIntensity: 1.6,
        emissive: palette.gold,
        emissiveIntensity: 0.7,
        flatShading: true,
      })
    )
  );
  const resolveRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.2, 0.025, 8, 64)),
    track(new THREE.MeshStandardMaterial({ color: palette.gold, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 }))
  );
  [hex, oct, tri, core, resolveRing].forEach((mesh) => {
    mesh.castShadow = true;
    group.add(mesh);
  });

  /* scattered (scroll = 0) and resolved (scroll = 1) poses */
  const SCATTERED = [
    new THREE.Vector3(-7.5, 3.2, -2.5),
    new THREE.Vector3(7.8, 3.5, -3.0),
    new THREE.Vector3(5.5, -2.8, -2.2),
  ];
  const RESOLVED = [
    new THREE.Vector3(-1.45, 0.55, 0.15),
    new THREE.Vector3(1.5, 0.35, -0.35),
    new THREE.Vector3(0.1, -1.25, 0.3),
  ];
  const rotations = [0.44, -0.46, 0.12];

  const plates = [hex, oct, tri].map((mesh, index) => ({
    mesh,
    scattered: SCATTERED[index],
    resolved: RESOLVED[index],
    restRotation: rotations[index],
    spin: 0.3 + index * 0.14,
    settle: 0,
  }));

  let fade = 0;

  const update = (dt, elapsed) => {
    const progress = clamp(context.progress?.current ?? 0);

    /* slow push-in as the chapter arrives */
    camera.position.set(state.pointer.x * 0.4, 0.2 + state.pointer.y * 0.3, mix(12.6, 11.6, progress));
    camera.lookAt(0, 0.1, 0);
    set.fit(camera);

    const align = smoothstep(0.12, 0.75, progress);
    fade = damp(fade, smoothstep(0.0, 0.2, progress), 4, dt);

    group.rotation.y = reduced ? 0.12 : Math.sin(elapsed * 0.1) * 0.05 + state.pointer.x * 0.03;
    group.position.y = -0.2;

    plates.forEach((plate, index) => {
      plate.settle = damp(plate.settle, align, 3.2, dt);
      const position = plate.scattered.clone().lerp(plate.resolved, plate.settle);
      plate.mesh.position.copy(position);
      plate.mesh.rotation.x = Math.PI / 2;
      plate.mesh.rotation.y = plate.restRotation + (reduced ? 0 : elapsed * plate.spin * (1 - plate.settle * 0.7));
      const bob = reduced ? 0 : Math.sin(elapsed * 0.6 + index * 2.1) * 0.05 * (1 - plate.settle * 0.6);
      plate.mesh.position.y += bob;
      plate.mesh.material.emissiveIntensity = 0.35 + plate.settle * 0.55;
    });

    core.rotation.y = reduced ? 0.4 : elapsed * 0.3;
    core.rotation.x = 0.3;
    core.scale.setScalar(mix(0.6, 1, plate0Settle(plates)));

    /* Resolve ring appears as the plates converge */
    resolveRing.rotation.x = Math.PI * 0.35;
    resolveRing.rotation.z = reduced ? 0 : elapsed * 0.12;
    resolveRing.material.opacity = align * 0.6;
    resolveRing.scale.setScalar(mix(2.2, 1, align));

    set.update(dt, elapsed, progress, state.pointer);
  };

  return {
    update,
    dispose() {
      disposables.forEach((object) => object.dispose?.());
      set.dispose();
    },
  };
}

function plate0Settle(plates) {
  return plates[0]?.settle ?? 0;
}
