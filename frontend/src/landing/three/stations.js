/**
 * Chapter 3 — "Assess → Grow → Match".
 *
 * Three substantial, well-lit stations along one non-spiral path, and a signal
 * that physically travels the route while the camera pans to keep the active
 * station framed:
 *
 *   1  ASSESS & BASELINE     an assessment ring that measures the four skills
 *   2  AI-GUIDED GROWTH      a Dhruv monolith branching routes to the gaps
 *   3  DETERMINISTIC MATCH   a profile ring feeding role pylons on evidence
 *
 * Everything is driven by the chapter's single progress value:
 *   assess = smoothstep(0.02, 0.3, p), grow = smoothstep(0.3, 0.62, p),
 *   match = smoothstep(0.62, 0.95, p)
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

const SIGNAL_SPEED = 0.6;
const STATION_X = [-5.6, 0, 5.6];
const STATION_Y = [0.15, -0.35, 0.15];
const STATION_Z = [0.4, 0.8, 0];

const SKILLS = [
  { id: 'React', accent: 'indigo', angle: 45, gap: false },
  { id: 'TypeScript', accent: 'teal', angle: 135, gap: false },
  { id: 'Node.js', accent: 'indigoSoft', angle: 225, gap: true },
  { id: 'SQL', accent: 'gold', angle: 315, gap: true },
];
const SKILL_ACCENTS = { React: 'indigo', TypeScript: 'teal', 'Node.js': 'indigoSoft', SQL: 'gold' };

const ROLES = [
  { id: 'role1', label: 'Frontend Engineer' },
  { id: 'role2', label: 'Full Stack Developer' },
  { id: 'role3', label: 'Data Analyst' },
];

export function createStations({ stage, palette, reduced, context }) {
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

  const emissiveMaterial = (accent, intensity = 0.4) =>
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.panel,
        metalness: 0.7,
        roughness: 0.32,
        clearcoat: 0.5,
        envMapIntensity: 1.2,
        emissive: palette[accent],
        emissiveIntensity: intensity,
        flatShading: true,
      })
    );

  /* ---------------- station 1 — assessment ring ---------------- */
  const assessment = new THREE.Group();
  assessment.position.set(STATION_X[0], STATION_Y[0], STATION_Z[0]);
  group.add(assessment);

  const ring = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.35, 0.09, 12, 72)),
    emissiveMaterial('indigo', 0.4)
  );
  ring.castShadow = true;
  assessment.add(ring);

  const base = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.5, 0.66, 0.16, 24)),
    emissiveMaterial('indigo', 0.2)
  );
  base.position.y = -1.75;
  assessment.add(base);
  const stem = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8)),
    track(new THREE.MeshStandardMaterial({ color: palette.line, metalness: 0.8, roughness: 0.3 }))
  );
  stem.position.y = -0.88;
  assessment.add(stem);

  const skillNodes = SKILLS.map((skill) => {
    const radians = (skill.angle * Math.PI) / 180;
    const mesh = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.42, 0.42, 0.42, 3, 0.1)),
      emissiveMaterial(SKILL_ACCENTS[skill.id], 0.45)
    );
    mesh.position.set(Math.cos(radians) * 1.35, Math.sin(radians) * 1.35, 0);
    mesh.castShadow = true;
    assessment.add(mesh);
    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.set(0, 0.52, 0);
    mesh.add(labelAnchor);
    return { ...skill, mesh, labelAnchor, focus: 0 };
  });

  const pulse = new THREE.Mesh(
    track(new THREE.TorusGeometry(1, 0.014, 6, 72)),
    track(new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0, depthWrite: false }))
  );
  assessment.add(pulse);

  /* ---------------- station 2 — Dhruv monolith ---------------- */
  const growth = new THREE.Group();
  growth.position.set(STATION_X[1], STATION_Y[1], STATION_Z[1]);
  group.add(growth);

  const guide = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.9, 1.9, 0.5, 3, 0.12)),
    emissiveMaterial('indigo', 0.3)
  );
  guide.castShadow = true;
  growth.add(guide);

  const guideFacet = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.5, 0.7, 0.12, 2, 0.08)),
    track(new THREE.MeshBasicMaterial({ color: palette.indigo }))
  );
  guideFacet.position.set(0, 0.35, 0.3);
  growth.add(guideFacet);

  const gapNodes = SKILLS.filter((skill) => skill.gap).map((skill, index) => {
    const mesh = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.4, 0.4, 0.4, 3, 0.1)),
      emissiveMaterial(SKILL_ACCENTS[skill.id], 0.4)
    );
    mesh.position.set(index === 0 ? -1.15 : 1.15, 0.75, 0);
    growth.add(mesh);
    return mesh;
  });

  const routeAnchor = new THREE.Object3D();
  routeAnchor.position.set(0, 1.5, 0);
  growth.add(routeAnchor);

  const waypoints = [];
  gapNodes.forEach((node, branchIndex) => {
    const start = new THREE.Vector3(0, -0.2, 0.25);
    for (let step = 1; step <= 3; step += 1) {
      const t = step / 3;
      const point = start.clone().lerp(node.position, t);
      point.y += Math.sin(t * Math.PI) * 0.4;
      const mesh = new THREE.Mesh(
        track(new THREE.IcosahedronGeometry(0.11, 0)),
        track(new THREE.MeshStandardMaterial({ color: palette.indigo, emissive: palette.indigo, emissiveIntensity: 0.9 }))
      );
      mesh.position.copy(point);
      growth.add(mesh);

      const lineGeometry = track(new THREE.BufferGeometry());
      lineGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const lineMaterial = track(
        new THREE.LineBasicMaterial({ color: palette.indigo, transparent: true, opacity: 0 })
      );
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.frustumCulled = false;
      growth.add(line);
      mesh.userData.line = line;
      mesh.userData.lineMaterial = lineMaterial;
      mesh.userData.from = point.clone().setY(point.y - 0.4);
      mesh.userData.to = node.position;
      waypoints.push({ mesh, branchIndex, step });
    }
    void branchIndex;
  });

  /* ---------------- station 3 — role gate ---------------- */
  const matchGroup = new THREE.Group();
  matchGroup.position.set(STATION_X[2], STATION_Y[2], STATION_Z[2]);
  group.add(matchGroup);

  const profileRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.8, 0.08, 12, 64)),
    emissiveMaterial('gold', 0.45)
  );
  profileRing.castShadow = true;
  matchGroup.add(profileRing);

  const roles = ROLES.map((role, index) => {
    const pylon = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.46, 1.15, 0.46, 3, 0.1)),
      emissiveMaterial('teal', 0.35)
    );
    pylon.position.set(1.8, (1 - index) * 1.05 - 0.3, 0);
    pylon.castShadow = true;
    matchGroup.add(pylon);

    const connectorGeometry = track(new THREE.BufferGeometry());
    connectorGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const connectorMaterial = track(
      new THREE.LineBasicMaterial({ color: palette.gold, transparent: true, opacity: 0 })
    );
    const connector = new THREE.Line(connectorGeometry, connectorMaterial);
    connector.frustumCulled = false;
    matchGroup.add(connector);

    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.set(0, 0.85, 0);
    pylon.add(labelAnchor);

    return { ...role, pylon, connector, connectorMaterial, labelAnchor, index };
  });

  /* ---------------- the path and the travelling signal ---------------- */
  const curve = new THREE.CatmullRomCurve3(
    STATION_X.map((x, index) => new THREE.Vector3(x, STATION_Y[index], STATION_Z[index])),
    false,
    'catmullrom',
    0.5
  );
  const pathLine = new THREE.Line(
    track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64))),
    track(new THREE.LineBasicMaterial({ color: palette.line, transparent: true, opacity: 0.55 }))
  );
  pathLine.frustumCulled = false;
  group.add(pathLine);

  const signal = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(0.17, 0)),
    track(new THREE.MeshStandardMaterial({ color: palette.gold, emissive: palette.gold, emissiveIntensity: 1.6 }))
  );
  group.add(signal);
  const halo = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(0.36, 1)),
    track(new THREE.MeshBasicMaterial({ color: palette.goldSoft, transparent: true, opacity: 0.2, depthWrite: false }))
  );
  group.add(halo);

  /* ---------------- DOM labels ---------------- */
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

  let panX = STATION_X[0];
  let signalT = 0;

  const update = (dt, elapsed) => {
    const progress = clamp(context.progress?.current ?? 0);
    const assess = smoothstep(0.02, 0.3, progress);
    const grow = smoothstep(0.3, 0.62, progress);
    const match = smoothstep(0.62, 0.95, progress);

    /* camera pans along the path to keep the active station framed */
    const wantedPan = mix(mix(STATION_X[0], STATION_X[1], assess), STATION_X[2], grow);
    panX = damp(panX, wantedPan, 3.4, dt);
    const stationIndex = signalT < 0.28 ? 0 : signalT < 0.78 ? 1 : 2;
    const wantedY = mix(0.6, 0.1, assess) + mix(0, 0.3, grow);
    camera.position.set(
      panX + state.pointer.x * 0.5,
      wantedY + state.pointer.y * 0.35,
      11.2 - grow * 0.9
    );
    camera.lookAt(panX, stationIndex === 2 ? 0.1 : 0, 0);
    set.fit(camera);

    /* the signal: station 1 → 2 → 3, with a beat at each */
    const wantedT = mix(mix(0, 0.5, assess), 1, grow);
    signalT = damp(signalT, wantedT, SIGNAL_SPEED, dt);
    const point = curve.getPointAt(clamp(signalT));
    signal.position.copy(point);
    halo.position.copy(point);
    halo.scale.setScalar(reduced ? 1 : 1 + Math.sin(elapsed * 2.4) * 0.12);
    halo.material.opacity = 0.16 + grow * 0.08;

    /* station activity comes from where the signal actually is */
    const activity = [0, 0.5, 1].map((value) => clamp(1 - Math.abs(signalT - value) * 2.3));

    /* station 1 — pulse measures the skills */
    const cycle = reduced ? 1 : (elapsed % 2.6) / 2.6;
    pulse.scale.setScalar(mix(0.9, 2.2, cycle));
    pulse.material.opacity = (1 - cycle) * 0.45 * activity[0];
    ring.rotation.z = reduced ? 0.3 : elapsed * 0.14;

    skillNodes.forEach((skill, index) => {
      const focus = skill.gap ? grow * activity[1] : activity[0];
      skill.focus = damp(skill.focus, focus, 6, dt);
      skill.mesh.scale.setScalar(1 + skill.focus * 0.22);
      skill.mesh.material.emissiveIntensity = 0.35 + activity[0] * 0.5 + skill.focus * 0.6;
      const bob = reduced ? 0 : Math.sin(elapsed * 0.9 + index) * 0.05;
      const radians = (skill.angle * Math.PI) / 180;
      skill.mesh.position.y = Math.sin(radians) * 1.35 + bob;
      placeLabel(labels[skill.id], skill.labelAnchor, activity[0] * 0.9);
    });

    /* station 2 — routes branch toward the gaps */
    waypoints.forEach(({ mesh, branchIndex, step }) => {
      const reveal = clamp(grow * 2.4 - step * 0.35 - branchIndex * 0.1);
      mesh.scale.setScalar(0.6 + reveal * 0.6);
      mesh.material.emissiveIntensity = 0.4 + reveal * 1.1;
      mesh.visible = grow > 0.02;
      const lineMaterial = mesh.userData.lineMaterial;
      lineMaterial.opacity = reveal * 0.5;
      const positions = mesh.userData.line.geometry.attributes.position;
      const from = mesh.userData.from;
      const to = mesh.userData.to;
      positions.setXYZ(0, from.x, from.y, from.z);
      positions.setXYZ(1, to.x, to.y, to.z);
      positions.needsUpdate = true;
    });
    gapNodes.forEach((node, index) => {
      node.material.emissiveIntensity = 0.3 + grow * (0.5 + activity[1] * 0.5);
      node.visible = grow > 0.02;
      node.scale.setScalar(1 + (reduced ? index * 0.01 : Math.sin(elapsed * 1.6 + index) * 0.05));
    });
    guide.rotation.y = reduced ? 0 : Math.sin(elapsed * 0.3) * 0.06;
    placeLabel(labels.dhruv, routeAnchor, grow * 0.9);

    /* station 3 — evidence lines from the profile to the roles */
    profileRing.rotation.z = reduced ? 0 : elapsed * 0.2;
    roles.forEach((role) => {
      const reveal = clamp(match * 1.9 - role.index * 0.22);
      role.pylon.material.emissiveIntensity = 0.3 + reveal * 0.7;
      role.pylon.scale.setScalar(1 + reveal * 0.06);
      role.connectorMaterial.opacity = reveal * 0.8;
      const positions = role.connector.geometry.attributes.position;
      positions.setXYZ(0, profileRing.position.x, profileRing.position.y, profileRing.position.z);
      positions.setXYZ(1, role.pylon.position.x, role.pylon.position.y, role.pylon.position.z);
      positions.needsUpdate = true;
      placeLabel(labels[role.id], role.labelAnchor, reveal * 0.95);
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
