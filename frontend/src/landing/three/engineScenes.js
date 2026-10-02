import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
/**
 * Chapter 4 — the four engine scenes, all in one Three.js world.
 *
 * One canvas sits behind the chapter's DOM. The four engines are four camera
 * framings onto four distinct scene parts, cross-faded by the chapter's single
 * progress value — so each engine gets a real, different 3D scene while only
 * one framing animates at a time:
 *
 *   copilot       an interview console — a curved dial with three arms
 *                 (Structure / Depth / Clarity) facing a glass panel
 *   matching      an evidence board — five skill plinths wired by tube paths
 *                 into a role gate with three score-lit rings
 *   gamification  an XP engine — a rotating gold ring stack feeding a level
 *                 plinth, with an orbiting streak ring
 *   analytics     a cohort field — four metric columns whose heights encode
 *                 the illustrative values, one flagged below the demand bar
 *
 * All numbers come from content.js via `context.mock`; DOM panels beside the
 * canvas carry the readable copy and the illustrative-data labels.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

/* The four stations sit far apart on X; each camera framing isolates one. */
const STATION_X = { copilot: -15, matching: 0, gamification: 15, analytics: 30 };

export function createEngineScenes({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 7,
    floorY: -3.2,
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

  const metal = (accent, intensity = 0.3) =>
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
  const goldMetal = () =>
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.gold,
        metalness: 0.9,
        roughness: 0.24,
        envMapIntensity: 1.5,
        emissive: palette.gold,
        emissiveIntensity: 0.4,
        flatShading: true,
      })
    );

  const plinthGeometry = track(new RoundedBoxGeometry(1.5, 0.5, 1.1, 3, 0.12));
  const plinth = (accent, x, y = -1.1, z = 0) => {
    const mesh = new THREE.Mesh(plinthGeometry, metal(accent, 0.24));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  
  // The Continuous Data Center Floor
  const floorGeo = track(new THREE.BoxGeometry(70, 0.5, 12));
  const floorMat = track(new THREE.MeshStandardMaterial({
    color: palette.panelDeep,
    metalness: 0.2,
    roughness: 0.8
  }));
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(7.5, -2, -1);
  floor.receiveShadow = true;
  group.add(floor);
  
  // The Data Conduit connecting all engines
  const conduitGeo = track(new THREE.CylinderGeometry(0.15, 0.15, 60, 16));
  const conduitMat = track(new THREE.MeshStandardMaterial({
    color: palette.indigo,
    emissive: palette.indigo,
    emissiveIntensity: 1.5,
    metalness: 0.8
  }));
  const conduit = new THREE.Mesh(conduitGeo, conduitMat);
  conduit.rotation.z = Math.PI / 2;
  conduit.position.set(7.5, -1.6, -2.5);
  conduit.castShadow = true;
  group.add(conduit);
  
  /* ================= engine 1 — the interview console ================= */
  const copilot = new THREE.Group();
  copilot.userData.engine = 'copilot';
  copilot.position.set(STATION_X.copilot, 0, 0);
  group.add(copilot);
  copilot.add(plinth('indigo', 0, -1.5));

  const dial = new THREE.Mesh(track(new THREE.TorusGeometry(1.45, 0.1, 12, 64)), metal('indigo', 0.35));
  dial.position.set(-0.9, 0.55, 0);
  dial.castShadow = true;
  copilot.add(dial);

  const DIAL_ARMS = [
    { accent: 'gold', from: 1.05, to: 2.15 },
    { accent: 'indigoSoft', from: 2.45, to: 3.4 },
    { accent: 'teal', from: 3.75, to: 4.65 },
  ];
  const dialArms = DIAL_ARMS.map((arm) => {
    const pivot = new THREE.Group();
    pivot.position.copy(dial.position);
    dial.add(pivot);
    const sweep = new THREE.Mesh(
      track(new THREE.TorusGeometry(1.45, 0.045, 8, 32, arm.to - arm.from)),
      track(new THREE.MeshBasicMaterial({ color: palette[arm.accent] }))
    );
    sweep.rotation.z = arm.from;
    pivot.add(sweep);
    return { ...arm, pivot, sweep, value: 0 };
  });

  const consolePanel = new THREE.Mesh(
    track(new RoundedBoxGeometry(1.5, 2.2, 0.16, 3, 0.1)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.panelDeep,
        metalness: 0.3,
        roughness: 0.2,
        transmission: 0.4,
        thickness: 0.6,
        envMapIntensity: 1.3,
        emissive: palette.indigo,
        emissiveIntensity: 0.18,
      })
    )
  );
  consolePanel.position.set(1.1, 0.45, -0.15);
  consolePanel.rotation.y = -0.18;
  consolePanel.castShadow = true;
  copilot.add(consolePanel);

  const consoleText = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.9, 0.1, 0.05, 2, 0.04)),
    track(new THREE.MeshBasicMaterial({ color: palette.indigo }))
  );
  consoleText.position.set(1.1, 0.95, 0.0);
  copilot.add(consoleText);
  const consoleBars = [0, 1, 2].map((index) => {
    const bar = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.1, 0.55, 0.05, 2, 0.03)),
      track(new THREE.MeshBasicMaterial({ color: [palette.gold, palette.indigoSoft, palette.teal][index] }))
    );
    bar.position.set(0.82 + index * 0.28, 0.35 - index * 0.06, 0.0);
    copilot.add(bar);
    return bar;
  });

  /* ================= engine 2 — the evidence board ================= */
  const matching = new THREE.Group();
  matching.userData.engine = 'matching';
  matching.position.set(STATION_X.matching, 0, 0);
  group.add(matching);

  const MATCH_SKILLS = ['React', 'TypeScript', 'Node.js', 'SQL', 'System Design'];
  const MATCH_ACCENTS = ['indigo', 'gold', 'teal', 'indigoSoft', 'gold'];
  const skillPlinths = MATCH_SKILLS.map((skill, index) => {
    const x = (index - 2) * 0.95;
    const mesh = new THREE.Mesh(track(new RoundedBoxGeometry(0.5, 0.72, 0.5, 3, 0.1)), metal(MATCH_ACCENTS[index], 0.4));
    mesh.position.set(x, -0.55, 0);
    mesh.castShadow = true;
    matching.add(mesh);
    return { mesh, x };
  });

  const roleGate = new THREE.Mesh(
    track(new RoundedBoxGeometry(2.6, 0.22, 0.8, 3, 0.1)),
    metal('teal', 0.45)
  );
  roleGate.position.set(0, 1.75, -0.4);
  roleGate.castShadow = true;
  matching.add(roleGate);

  const ROLE_SCORES = [92, 78, 61];
  const roleRings = ROLE_SCORES.map((score, index) => {
    const x = (index - 1) * 1.05;
    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.3, 0.035, 8, 40)),
      track(new THREE.MeshStandardMaterial({ color: palette.teal, emissive: palette.teal, emissiveIntensity: 0.5 }))
    );
    ring.position.set(x, 2.0, -0.4);
    matching.add(ring);
    return { ring, score, x };
  });

  const evidencePaths = [];
  MATCH_SKILLS.forEach((_, skillIndex) => {
    const roleIndex = skillIndex === 4 ? 1 : skillIndex === 3 ? 2 : Math.min(skillIndex, 1);
    const start = new THREE.Vector3(skillPlinths[skillIndex].x, -0.2, 0.1);
    const end = new THREE.Vector3(roleRings[roleIndex].x, 1.95, -0.4);
    const mid = start.clone().lerp(end, 0.5);
    mid.x += (skillIndex - 2) * 0.08;
    mid.y += 0.55;
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const geometry = track(new THREE.TubeGeometry(curve, 24, 0.022, 6, false));
    const material = track(
      new THREE.MeshStandardMaterial({ color: palette.gold, emissive: palette.gold, emissiveIntensity: 1.0, transparent: true, opacity: 0 })
    );
    const mesh = new THREE.Mesh(geometry, material);
    matching.add(mesh);
    evidencePaths.push({ mesh, material, skillIndex });
  });

  /* ================= engine 3 — the XP engine ================= */
  const gamification = new THREE.Group();
  gamification.userData.engine = 'gamification';
  gamification.position.set(STATION_X.gamification, 0, 0);
  group.add(gamification);
  gamification.add(plinth('gold', 0, -1.55));

  const xpRing = new THREE.Mesh(track(new THREE.TorusGeometry(1.15, 0.14, 14, 72)), goldMetal());
  xpRing.position.set(0, 0.6, 0);
  xpRing.rotation.x = Math.PI / 2 * 0.72;
  xpRing.castShadow = true;
  gamification.add(xpRing);

  const xpArc = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.15, 0.2, 14, 48, Math.PI * 2 * 0.68)),
    track(
      new THREE.MeshStandardMaterial({ color: palette.goldSoft, emissive: palette.goldSoft, emissiveIntensity: 1.2 })
    )
  );
  xpArc.position.copy(xpRing.position);
  xpArc.rotation.copy(xpRing.rotation);
  gamification.add(xpArc);

  const streakRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.7, 0.03, 8, 72)),
    track(new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0.55 }))
  );
  streakRing.position.copy(xpRing.position);
  streakRing.rotation.x = Math.PI / 2;
  gamification.add(streakRing);

  const levelBlock = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.85, 1.05, 0.85, 3, 0.12)),
    metal('gold', 0.5)
  );
  levelBlock.position.set(0, -0.55, 0);
  levelBlock.castShadow = true;
  gamification.add(levelBlock);
  const levelMarks = [0, 1, 2].map((index) => {
    const mark = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.7, 0.08, 0.02)),
      track(new THREE.MeshBasicMaterial({ color: palette.goldSoft, transparent: true }))
    );
    mark.position.set(0, -0.3 - index * 0.26, 0.44);
    levelBlock.add(mark);
    return mark;
  });

  /* ================= engine 4 — the cohort field ================= */
  const analytics = new THREE.Group();
  analytics.userData.engine = 'analytics';
  analytics.position.set(STATION_X.analytics, 0, 0);
  group.add(analytics);

  const COLUMN_VALUES = [
    { label: 'DSA', value: 78, accent: 'indigo' },
    { label: 'SQL', value: 64, accent: 'indigoSoft' },
    { label: 'Cloud', value: 31, accent: 'gold' },
    { label: 'Testing', value: 22, accent: 'teal' },
  ];
  const DEMAND_BAR = 60; // illustrative industry bar, matches the copy's claim

  const demandBar = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.4, 0.05, 1.3)),
    track(new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0.5 }))
  );
  demandBar.position.set(0, -0.62, 0);
  analytics.add(demandBar);

  const columns = COLUMN_VALUES.map((column, index) => {
    const x = (index - 1.5) * 1.05;
    const columnGroup = new THREE.Group();
    columnGroup.position.set(x, -1.35, 0);
    analytics.add(columnGroup);

    const height = mix(0.5, 3.1, column.value / 100);
    const mesh = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.56, 1, 0.56, 3, 0.1)),
      metal(column.accent, column.value < DEMAND_BAR ? 0.6 : 0.3)
    );
    mesh.castShadow = true;
    mesh.userData.height = height;
    mesh.userData.below = column.value < DEMAND_BAR;
    columnGroup.add(mesh);

    const cap = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.64, 0.1, 0.64, 2, 0.04)),
      track(new THREE.MeshBasicMaterial({ color: palette[column.accent] }))
    );
    cap.position.y = 0.5;
    columnGroup.add(cap);

    return { ...column, columnGroup, mesh, cap, x };
  });

  /* ---------------- crossfade state ---------------- */
  let current = 'matching';
  const blend = { copilot: 0, matching: 1, gamification: 0, analytics: 0 };
  const anchors = {
    copilot: new THREE.Vector3(STATION_X.copilot + 0.1, 0.2, 0),
    matching: new THREE.Vector3(0.2, 0.55, 0),
    gamification: new THREE.Vector3(STATION_X.gamification, 0.3, 0),
    analytics: new THREE.Vector3(STATION_X.analytics + 0.2, 0.2, 0),
  };
  const cameraTarget = new THREE.Vector3();

  const labels = context.labels?.current ?? {};
  const projected = new THREE.Vector3();
  const placeLabel = (element, anchor, opacity) => {
    if (!element) return;
    anchor.getWorldPosition(projected);
    projected.project(camera);
    if (projected.z > 1 || opacity <= 0.02) {
      element.style.opacity = '0';
      return;
    }
    const x = (projected.x * 0.5 + 0.5) * state.width;
    const y = (-projected.y * 0.5 + 0.5) * state.height;
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    element.style.opacity = opacity.toFixed(3);
  };

  const labelDefs = [
    { key: 'structure', object: dial, offset: new THREE.Vector3(0, 1.75, 0), station: 'copilot' },
    { key: 'depth', object: dial, offset: new THREE.Vector3(1.4, 1.45, 0), station: 'copilot' },
    { key: 'clarity', object: dial, offset: new THREE.Vector3(1.9, 0.6, 0), station: 'copilot' },
    { key: 'react', object: skillPlinths[0].mesh, offset: new THREE.Vector3(0, 0.75, 0), station: 'matching' },
    { key: 'typescript', object: skillPlinths[1].mesh, offset: new THREE.Vector3(0, 0.75, 0), station: 'matching' },
    { key: 'nodejs', object: skillPlinths[2].mesh, offset: new THREE.Vector3(0, 0.75, 0), station: 'matching' },
    { key: 'sql', object: skillPlinths[3].mesh, offset: new THREE.Vector3(0, 0.75, 0), station: 'matching' },
    { key: 'systemDesign', object: skillPlinths[4].mesh, offset: new THREE.Vector3(0, 0.75, 0), station: 'matching' },
    { key: 'streak', object: xpArc, offset: new THREE.Vector3(0, 1.85, 0), station: 'gamification' },
    { key: 'level', object: levelBlock, offset: new THREE.Vector3(0, -1.15, 0), station: 'gamification' },
    { key: 'dsw', object: columns[0].mesh, offset: new THREE.Vector3(0, 1.9, 0), station: 'analytics' },
    { key: 'sqlCol', object: columns[1].mesh, offset: new THREE.Vector3(0, 1.45, 0), station: 'analytics' },
    { key: 'cloud', object: columns[2].mesh, offset: new THREE.Vector3(0, 0.95, 0), station: 'analytics' },
    { key: 'testing', object: columns[3].mesh, offset: new THREE.Vector3(0, 0.7, 0), station: 'analytics' },
  ].map((def) => {
    const anchor = new THREE.Object3D();
    anchor.position.copy(def.offset);
    def.object.add(anchor);
    return { ...def, anchor };
  });  const update = (dt, elapsed) => {
    const progress = clamp(context.progress?.current ?? 0);
    const stageIndex = clamp(Math.floor(progress * 4), 0, 3);
    const names = ['copilot', 'matching', 'gamification', 'analytics'];
    current = names[stageIndex];

    /* crossfade weights: the active engine's weight ramps to 1, others to 0 */
    const nextBlend = { copilot: 0, matching: 0, gamification: 0, analytics: 0 };
    nextBlend[current] = 1;
    ['copilot', 'matching', 'gamification', 'analytics'].forEach((name) => {
      blend[name] = damp(blend[name], nextBlend[name], 5, dt);
      const weight = blend[name];
      group.children.forEach((child) => {
      });
    });

    
    if (ionDrive) {
      ionDrive.rotation.y = elapsed * 0.2;
      ionDrive.position.y = -1 + Math.sin(elapsed * 1.5) * 0.1;
    }

    /* camera: glide between stations, keep the active one composed */
    const anchor = anchors[current];
    cameraTarget.x = damp(cameraTarget.x, anchor.x, 3.4, dt);
    cameraTarget.y = damp(cameraTarget.y, anchor.y, 3.4, dt);
    camera.position.set(
      cameraTarget.x + state.pointer.x * 0.6,
      cameraTarget.y + state.pointer.y * 0.45,
      14.0
    );
    camera.lookAt(cameraTarget.x, cameraTarget.y, 0);
    set.fit(camera);

    /* per-engine motion */
    if (current === 'copilot') {
      dial.rotation.z = reduced ? 0.4 : elapsed * 0.18;
      dialArms.forEach((arm, index) => {
        const target = [82, 74, 88][index] / 100;
        arm.value = damp(arm.value, target, 4, dt);
        const sweepAngle = arm.from + (arm.to - arm.from) * arm.value;
        arm.sweep.rotation.z = -sweepAngle + arm.from;
        arm.sweep.material.opacity = 1;
      });
      consoleBars.forEach((bar, index) => {
        bar.scale.y = [0.82, 0.74, 0.88][index];
        bar.position.y = 0.35 - (1 - bar.scale.y) * 0.28;
      });
    }

    if (current === 'matching') {
      evidencePaths.forEach((path, index) => {
        const reveal = clamp(0.65 + Math.sin(elapsed * 1.2 - index * 0.6) * 0.35);
        path.material.opacity = reveal * 0.9;
      });
      roleRings.forEach((entry, index) => {
        entry.ring.rotation.z = reduced ? 0 : elapsed * (0.3 + index * 0.12);
        entry.ring.scale.setScalar(1 + Math.sin(elapsed * 1.4 + index) * 0.05);
      });
      skillPlinths.forEach((entry, index) => {
        entry.mesh.position.y = -0.55 + (reduced ? 0 : Math.sin(elapsed * 0.9 + index) * 0.05);
      });
    }

    if (current === 'gamification') {
      xpRing.rotation.z = reduced ? 0.5 : elapsed * 0.3;
      xpArc.rotation.z = reduced ? 0.3 : -elapsed * 0.42;
      streakRing.rotation.z = reduced ? 0 : elapsed * 0.16;
      streakRing.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.4) * 0.08;
      levelMarks.forEach((mark, index) => {
        mark.material.opacity = index < 2 ? 1 : 0.35;
      });
    }

    if (current === 'analytics') {
      columns.forEach((column, index) => {
        const grown = clamp(smoothstep(index * 0.08, index * 0.08 + 0.4, progress * 4 - stage_));
        column.mesh.scale.y = mix(0.12, 1, grown);
        column.mesh.position.y = (column.mesh.userData.height * column.mesh.scale.y) / 2;
        column.cap.position.y = column.mesh.userData.height * column.mesh.scale.y + 0.05;
        column.mesh.material.emissiveIntensity = column.mesh.userData.below ? 0.55 : 0.28;
        void index;
      });
      demandBar.material.opacity = 0.35 + Math.sin(elapsed * 0.8) * 0.1;
    }

    /* engine-specific DOM labels */
    labelDefs.forEach((def) => {
      const opacity = def.station === current ? 0.95 : 0;
      placeLabel(labels[def.key], def.anchor, opacity);
    });

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
