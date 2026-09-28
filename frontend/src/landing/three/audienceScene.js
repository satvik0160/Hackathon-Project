/**
 * Chapter 5 — the audience evidence system.
 *
 * ONE live scene, three configurations. The same parts — a verified profile,
 * a route, an opportunity marker, an industry demand wall, a cohort field —
 * re-compose into whichever perspective the visitor selects:
 *
 *   students      profile prism → ascending roadmap steps → opportunity ring
 *   industry      demand wall and candidate evidence face each other over a
 *                 shortlist bench — the hiring conversation in miniature
 *   institutions  a cohort field of thin columns (two flagged short) resolves
 *                 onto an alignment board — pattern in, curriculum decision out
 *
 * `context.selection.current` (0/1/2, written by the React tabs) is read every
 * frame; every reconfiguration is damped, so switching tabs reads as one
 * system re-ordering itself, never a swap.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

export function createAudienceScene({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 8,
    floorY: -3.1,
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
        roughness: 0.32,
        clearcoat: 0.5,
        envMapIntensity: 1.2,
        emissive: palette[accent],
        emissiveIntensity: intensity,
        flatShading: true,
      })
    );

  /* ---------------- shared parts ---------------- */

  const profile = new THREE.Mesh(
    track(new RoundedBoxGeometry(1.0, 1.0, 0.55, 3, 0.14)),
    metal('gold', 0.5)
  );
  profile.castShadow = true;
  group.add(profile);
  const profileFacet = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.55, 0.55, 0.1, 2, 0.08)),
    track(new THREE.MeshBasicMaterial({ color: palette.gold }))
  );
  profile.add(profileFacet);
  profileFacet.position.z = 0.32;

  const roadmap = [0, 1, 2].map((index) => {
    const step = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.62, 0.3, 0.62, 3, 0.08)),
      metal('indigo', 0.4)
    );
    step.castShadow = true;
    group.add(step);
    return { step, index };
  });

  const opportunity = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.55, 0.09, 12, 48)),
    metal('teal', 0.55)
  );
  opportunity.castShadow = true;
  group.add(opportunity);

  const demandWall = Array.from({ length: 6 }, (_, index) => {
    const pillar = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.34, 1.0, 0.34, 3, 0.07)),
      metal('teal', 0.4)
    );
    pillar.castShadow = true;
    group.add(pillar);
    return { pillar, index };
  });

  const shortlistBench = new THREE.Mesh(
    track(new RoundedBoxGeometry(2.2, 0.18, 0.8, 3, 0.08)),
    metal('indigo', 0.4)
  );
  shortlistBench.castShadow = true;
  group.add(shortlistBench);

  const cohort = [];
  for (let column = 0; column < 6; column += 1) {
    const gap = column === 2 || column === 4; // the flagged short columns
    const height = gap ? 0.7 : mix(1.3, 2.4, ((column * 7) % 5) / 4);
    const mesh = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.4, 1, 0.4, 3, 0.08)),
      metal(gap ? 'gold' : 'indigo', gap ? 0.65 : 0.3)
    );
    mesh.castShadow = true;
    mesh.userData.height = height;
    group.add(mesh);
    cohort.push({ mesh, column, gap });
  }

  const alignmentBoard = new THREE.Mesh(
    track(new RoundedBoxGeometry(3.4, 0.24, 0.9, 3, 0.1)),
    metal('gold', 0.45)
  );
  alignmentBoard.castShadow = true;
  group.add(alignmentBoard);

  /* ---------------- the travelling signal ---------------- */
  const signal = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(0.15, 0)),
    track(new THREE.MeshStandardMaterial({ color: palette.gold, emissive: palette.gold, emissiveIntensity: 1.6 }))
  );
  group.add(signal);

  /* ---------------- configurations ---------------- */

  /* Each config: where every part stands, what it fades to, and where the
     signal orbits. Positions are group-local; z keeps real depth separation. */
  const CONFIGS = [
    {
      profile: [2.9, 0.1, 0],
      roadmap: (index) => [0.4 + index * 0.85, -0.35 + index * 0.55, -0.2 + index * 0.25],
      opportunity: [-2.4, 0.45, 0.2],
      demandWall: null,
      shortlistBench: null,
      cohort: null,
      alignmentBoard: null,
      signalRadius: 1.35,
      signalCenter: [0.2, 0.2, 0.3],
      profileSpin: 0.24,
    },
    {
      profile: [2.6, 0.15, 0.4],
      roadmap: null,
      opportunity: null,
      demandWall: (index) => [-2.9 + (index % 3) * 0.62, -0.5 + Math.floor(index / 3) * 1.15, -1.1],
      shortlistBench: [0.1, -0.1, 0.2],
      cohort: null,
      alignmentBoard: null,
      signalRadius: 1.05,
      signalCenter: [-0.2, 0.35, 0.2],
      profileSpin: 0.4,
    },
    {
      profile: null,
      roadmap: null,
      opportunity: null,
      demandWall: null,
      shortlistBench: null,
      cohort: (index) => [-2.55 + index * 1.02, -1.35, -0.3],
      alignmentBoard: [0.15, -0.15, 0.6],
      signalRadius: 1.7,
      signalCenter: [0.15, 0.35, 0.4],
      profileSpin: 0,
    },
  ];

  /* current transform state, damped toward the active config */
  const parts = {
    profile: { object: profile, position: new THREE.Vector3().copy(CONFIGS[0].profile), weight: 1, targetScale: 1 },
    opportunity: { object: opportunity, position: new THREE.Vector3().copy(CONFIGS[0].opportunity), weight: 1, targetScale: 1 },
    shortlistBench: { object: shortlistBench, position: new THREE.Vector3(0, -2.6, 0), weight: 0, targetScale: 1 },
    alignmentBoard: { object: alignmentBoard, position: new THREE.Vector3(0, -2.6, 0), weight: 0, targetScale: 1 },
  };
  roadmap.forEach(({ step, index }) => {
    parts[`roadmap${index}`] = { object: step, position: new THREE.Vector3(0, -2.6, 0), weight: 1, targetScale: 1 };
  });
  demandWall.forEach(({ pillar, index }) => {
    parts[`demand${index}`] = { object: pillar, position: new THREE.Vector3(0, -2.8, 0), weight: 0, targetScale: 1 };
  });
  cohort.forEach(({ mesh, column }) => {
    parts[`cohort${column}`] = { object: mesh, position: new THREE.Vector3(0, -2.8, 0), weight: 0, targetScale: 1 };
  });

  let activeConfig = 0;

  const update = (dt, elapsed) => {
    const selection = clamp(Math.round(context.selection?.current ?? 0), 0, 2);
    activeConfig = selection;
    const config = CONFIGS[activeConfig];
    const progress = clamp(context.progress?.current ?? 0);

    /* camera: slight per-config framing shifts + pointer parallax */
    const camY = mix(0.7, 0.45, selection / 2) + state.pointer.y * 0.4;
    const camX = state.pointer.x * 0.55 + (selection === 1 ? 0.4 : 0);
    camera.position.set(damp(camera.position.x, camX, 3, dt), damp(camera.position.y, camY, 3, dt), 10.6);
    camera.lookAt(0, 0, 0);
    set.fit(camera);
    group.rotation.y = reduced ? 0 : state.pointer.x * 0.04;

    /* damping every part toward its configured pose */
    const configure = (key, target, baseOpacity) => {
      const part = parts[key];
      if (!part) return;
      const destination = target ?? null;
      part.weight = damp(part.weight, destination ? 1 : 0, 4.5, dt);
      part.object.visible = part.weight > 0.02;
      if (destination) {
        part.position.x = damp(part.position.x, destination[0], 4.5, dt);
        part.position.y = damp(part.position.y, destination[1], 4.5, dt);
        part.position.z = damp(part.position.z, destination[2], 4.5, dt);
        part.object.position.copy(part.position);
        const scale = mix(0.6, 1, part.weight);
        part.object.scale.setScalar(scale);
      }
      const material = part.object.material;
      if (material?.emissiveIntensity !== undefined && baseOpacity !== undefined) {
        material.emissiveIntensity = mix(baseOpacity * 0.4, baseOpacity, part.weight);
      }
    };

    configure('profile', config.profile, 0.5);
    roadmap.forEach(({ step, index }) => configure(`roadmap${index}`, config.roadmap?.(index), 0.42));
    configure('opportunity', config.opportunity, 0.55);
    demandWall.forEach(({ pillar, index }) => configure(`demand${index}`, config.demandWall?.(index), 0.42));
    configure('shortlistBench', config.shortlistBench, 0.45);
    cohort.forEach(({ mesh, column }) => {
      configure(`cohort${column}`, config.cohort?.(column), mesh.userData.gap ? 0.62 : 0.32);
      if (config.cohort) {
        const grown = smoothstep(0.15, 0.55, progress + column * 0.04);
        mesh.scale.y = mix(0.25, 1, grown);
        mesh.position.y = parts[`cohort${column}`].position.y + (mesh.userData.height * mesh.scale.y) / 2;
      }
    });
    configure('alignmentBoard', config.alignmentBoard, 0.45);

    /* the signal orbits the composition's current centre */
    const orbit = config.signalRadius;
    const speed = reduced ? 0 : elapsed * 0.85;
    signal.position.set(
      config.signalCenter[0] + Math.cos(speed) * orbit * 0.55,
      config.signalCenter[1] + Math.sin(speed * 1.4) * 0.5,
      config.signalCenter[2] + Math.sin(speed) * orbit * 0.4
    );
    signal.rotation.y += dt * 1.2;

    /* small idle motions */
    profile.rotation.y = reduced ? 0.3 : elapsed * config.profileSpin;
    opportunity.rotation.z = reduced ? 0 : elapsed * 0.3;
    shortlistBench.position.y = parts.shortlistBench.position.y + (reduced ? 0 : Math.sin(elapsed * 0.8) * 0.03);

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
