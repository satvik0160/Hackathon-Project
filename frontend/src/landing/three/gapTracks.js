/**
 * Chapter 2 — "Graduates are not underqualified. They are unverified."
 *
 * The scene is the argument, in depth rather than in two flat parallel lines:
 *
 *   CURRICULUM        a raised board of five slab "units", tilted toward the
 *                     camera, drifting slowly — a syllabus revised in years
 *   INDUSTRY DEMAND   a lower lattice of five standing requirement pillars,
 *                     further from the camera, moving fast — hiring in months
 *
 * Scroll progress tilts the two structures out of plane, opens a labelled
 * verification gap between them, then draws assessed-evidence bridges across
 * until each requirement sits under the unit it belongs to:
 *
 *   drift  = smoothstep(0.05, 0.5, p)     structures shear apart in 3D
 *   settle = smoothstep(0.58, 0.95, p)    evidence bridges reconnect them
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

const COUNT = 5;
const SPACING = 1.75;
const BOARD_Y = 1.25;
const LATTICE_Y = -1.3;

export function createGapTracks({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 9,
    floorY: -3.7,
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

  /* ---------------- materials ---------------- */
  const slabMaterial = () =>
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.panel,
        metalness: 0.7,
        roughness: 0.35,
        clearcoat: 0.5,
        envMapIntensity: 1.2,
        emissive: palette.indigo,
        emissiveIntensity: 0.22,
        flatShading: true,
      })
    );
  const pillarMaterial = () =>
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.panelDeep,
        metalness: 0.72,
        roughness: 0.3,
        clearcoat: 0.4,
        envMapIntensity: 1.25,
        emissive: palette.teal,
        emissiveIntensity: 0.2,
        flatShading: true,
      })
    );

  const slabGeometry = track(new RoundedBoxGeometry(1.32, 0.44, 0.5, 3, 0.1));
  const pillarGeometry = track(new RoundedBoxGeometry(0.42, 1.5, 0.42, 3, 0.1));
  const plaqueGeometry = track(new RoundedBoxGeometry(1.0, 0.3, 0.06, 2, 0.08));

  /* ---------------- curriculum: a raised board of slabs ---------------- */
  const curriculumGroup = new THREE.Group();
  curriculumGroup.position.set(0, BOARD_Y, 0.9);
  curriculumGroup.rotation.x = -0.16; // tilted toward the camera
  group.add(curriculumGroup);

  const curriculumSpine = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.05, 0.05, 10.2, 8)),
    track(new THREE.MeshStandardMaterial({ color: palette.indigo, metalness: 0.8, roughness: 0.3 }))
  );
  curriculumSpine.rotation.z = Math.PI / 2;
  curriculumGroup.add(curriculumSpine);

  const curriculum = Array.from({ length: COUNT }, (_, index) => {
    const baseX = (index - (COUNT - 1) / 2) * SPACING;
    const slab = new THREE.Mesh(slabGeometry, slabMaterial());
    slab.position.set(baseX, 0.16, 0);
    slab.castShadow = true;
    curriculumGroup.add(slab);

    const plaque = new THREE.Mesh(plaqueGeometry, track(new THREE.MeshBasicMaterial({ color: palette.indigo })));
    plaque.position.set(baseX, 0.16, 0.28);
    plaque.scale.set(0.9 - Math.abs(index - 2) * 0.12, 0.85, 1);
    curriculumGroup.add(plaque);

    const edges = new THREE.LineSegments(
      track(new THREE.EdgesGeometry(slabGeometry, 30)),
      track(new THREE.LineBasicMaterial({ color: palette.indigo, transparent: true, opacity: 0.4 }))
    );
    slab.add(edges);

    return { slab, plaque, baseX };
  });

  /* ---------------- demand: a lower lattice of pillars ---------------- */
  const demandGroup = new THREE.Group();
  demandGroup.position.set(0, LATTICE_Y, -1.1);
  demandGroup.rotation.x = 0.1;
  group.add(demandGroup);

  const demandSpine = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.05, 0.05, 10.2, 8)),
    track(new THREE.MeshStandardMaterial({ color: palette.teal, metalness: 0.8, roughness: 0.3 }))
  );
  demandSpine.rotation.z = Math.PI / 2;
  demandGroup.add(demandSpine);

  const demand = Array.from({ length: COUNT }, (_, index) => {
    const baseX = (index - (COUNT - 1) / 2) * SPACING;
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial());
    pillar.position.set(baseX, -0.55, 0);
    pillar.castShadow = true;
    demandGroup.add(pillar);

    const cap = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.62, 0.18, 0.62, 2, 0.06)),
      track(new THREE.MeshStandardMaterial({ color: palette.teal, metalness: 0.85, roughness: 0.25, emissive: palette.teal, emissiveIntensity: 0.5 }))
    );
    cap.position.set(baseX, 0.32, 0);
    demandGroup.add(cap);

    return { pillar, cap, baseX };
  });

  /* ---------------- the labelled gap frame ---------------- */
  const gapFrame = new THREE.Group();
  group.add(gapFrame);
  const gapMaterial = track(
    new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0, depthWrite: false })
  );
  const gapFace = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), gapMaterial);
  gapFrame.add(gapFace);
  const gapEdgeMaterial = track(new THREE.LineBasicMaterial({ color: palette.gold, transparent: true, opacity: 0 }));
  const gapEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), gapEdgeMaterial);
  track(gapEdges.geometry);
  gapFrame.add(gapEdges);

  /* ---------------- evidence bridges (tubes that grow) ---------------- */
  const evidence = Array.from({ length: COUNT }, (_, index) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.7, 1.2),
      new THREE.Vector3(0, 0, 0.35),
      new THREE.Vector3(0, -0.7, -0.9),
    ]);
    const geometry = track(new THREE.TubeGeometry(curve, 20, 0.035, 6, false));
    const material = track(
      new THREE.MeshStandardMaterial({
        color: palette.gold,
        emissive: palette.gold,
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0,
      })
    );
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const connectorGeometry = track(new THREE.BufferGeometry());
    connectorGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const connectorMaterial = track(
      new THREE.LineBasicMaterial({ color: palette.gold, transparent: true, opacity: 0 })
    );
    const connector = new THREE.Line(connectorGeometry, connectorMaterial);
    connector.frustumCulled = false;
    group.add(connector);

    return { mesh, material, connector, connectorMaterial, index };
  });

  /* ---------------- DOM label anchors ---------------- */
  const curriculumAnchor = new THREE.Object3D();
  curriculumAnchor.position.set(-4.6, BOARD_Y + 0.85, 0.9);
  group.add(curriculumAnchor);
  const demandAnchor = new THREE.Object3D();
  demandAnchor.position.set(-4.6, LATTICE_Y - 0.9, -1.1);
  group.add(demandAnchor);
  const gapAnchor = new THREE.Object3D();
  group.add(gapAnchor);

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

  let drift = 0;
  let settle = 0;

  const update = (dt, elapsed) => {
    const progress = clamp(context.progress?.current ?? 0);

    /* camera: higher framing at rest, drops in and pushes as the gap opens */
    const camY = mix(1.4, 0.4, smoothstep(0.05, 0.5, progress));
    const camZ = mix(12.2, 11.0, smoothstep(0.1, 0.9, progress));
    camera.position.set(state.pointer.x * 0.5, camY + state.pointer.y * 0.3, camZ);
    camera.lookAt(0, 0, 0);
    set.fit(camera);

    drift = damp(drift, smoothstep(0.05, 0.5, progress), 4, dt);
    settle = damp(settle, smoothstep(0.58, 0.95, progress), 4, dt);

    /* slow group breathing; reduced motion keeps everything still */
    group.rotation.y = reduced ? 0 : state.pointer.x * 0.05;
    group.rotation.x = reduced ? 0 : -state.pointer.y * 0.04;

    const curriculumShift = (reduced ? 0 : Math.sin(elapsed * 0.14) * 0.16) - drift * 0.7;
    const demandShift = (reduced ? 0 : Math.sin(elapsed * 0.62) * 0.5) + drift * 2.3;
    const demandTwist = drift * -0.1;

    curriculumGroup.position.x = curriculumShift;
    demandGroup.position.x = demandShift;
    demandGroup.rotation.y = demandTwist;

    curriculum.forEach(({ slab, plaque, baseX }) => {
      slab.position.x = baseX;
      plaque.position.x = baseX;
      slab.material.emissiveIntensity = 0.2 + drift * 0.14;
    });

    demand.forEach(({ pillar, cap, baseX }, index) => {
      const alignedX = baseX + curriculumShift;
      const driftedX = baseX + demandShift;
      const x = driftedX + (alignedX - driftedX) * settle;
      pillar.position.x = x;
      cap.position.x = x;
      pillar.rotation.y = demandTwist;
      const unresolved = Math.abs(x - alignedX);
      cap.material.emissiveIntensity = 0.45 + unresolved * 0.22;
      void index;
    });

    /* gap frame: spans the widest mismatch */
    const pairIndex = 2;
    const topX = curriculumShift;
    const bottomX = demand[pairIndex].pillar.position.x;
    const left = Math.min(topX, bottomX);
    const right = Math.max(topX, bottomX);
    const gapWidth = Math.max(right - left, 0.02);
    gapFrame.position.set((left + right) / 2, (BOARD_Y + LATTICE_Y) / 2, 0.1);
    gapFace.scale.set(gapWidth + 0.9, BOARD_Y - LATTICE_Y - 0.55, 1);
    gapEdges.scale.copy(gapFace.scale);
    gapMaterial.opacity = 0.14 * drift * (1 - settle);
    gapEdgeMaterial.opacity = 0.75 * drift * (1 - settle);
    gapAnchor.position.set((left + right) / 2, (BOARD_Y + LATTICE_Y) / 2, 0.4);

    /* evidence bridges: pre-built tubes repositioned between each pair */
    evidence.forEach(({ mesh, material, connector, connectorMaterial, index }) => {
      const from = curriculum[index].slab.position;
      const to = demand[index].pillar.position;
      mesh.position.set((from.x + to.x) / 2, (BOARD_Y + LATTICE_Y) / 2 - 0.05, 0.25);
      mesh.rotation.z = Math.atan2(to.x - from.x, BOARD_Y - LATTICE_Y) * -1;
      const reveal = clamp(settle * 1.9 - index * 0.14);
      material.opacity = reveal * 0.9;
      material.emissiveIntensity = 0.7 + reveal * 0.7;
      mesh.visible = reveal > 0.02;

      connectorMaterial.opacity = reveal * 0.6;
      const positions = connector.geometry.attributes.position;
      positions.setXYZ(0, from.x, BOARD_Y - 0.28, 0.6);
      positions.setXYZ(1, to.x, LATTICE_Y + 0.62, -0.6);
      positions.needsUpdate = true;
    });

    placeLabel(labels.curriculum, curriculumAnchor, 0.95);
    placeLabel(labels.demand, demandAnchor, 0.95);
    placeLabel(labels.gap, gapAnchor, drift * (1 - settle) * 0.95);

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
