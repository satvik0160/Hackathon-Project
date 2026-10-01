import * as THREE from 'three';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

const COUNT = 5;

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

  // Materials
  const ringMaterial = track(
    new THREE.MeshPhysicalMaterial({
      color: palette.panel,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      envMapIntensity: 1.5,
      emissive: palette.indigo,
      emissiveIntensity: 0.1,
    })
  );

  const nodeMaterialTop = track(
    new THREE.MeshStandardMaterial({
      color: palette.gold,
      emissive: palette.gold,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    })
  );

  const nodeMaterialBottom = track(
    new THREE.MeshStandardMaterial({
      color: palette.teal,
      emissive: palette.teal,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    })
  );

  // Top structure: Curriculum Ring
  const curriculumGroup = new THREE.Group();
  group.add(curriculumGroup);

  const ringGeo = track(new THREE.TorusGeometry(2, 0.15, 16, 64));
  const topRing = new THREE.Mesh(ringGeo, ringMaterial);
  topRing.rotation.x = Math.PI / 2;
  curriculumGroup.add(topRing);

  // Bottom structure: Demand Ring
  const demandGroup = new THREE.Group();
  group.add(demandGroup);

  const bottomRing = new THREE.Mesh(ringGeo, ringMaterial);
  bottomRing.rotation.x = Math.PI / 2;
  demandGroup.add(bottomRing);

  // Nodes on the rings
  const nodeGeoTop = track(new THREE.IcosahedronGeometry(0.25, 1));
  const nodeGeoBottom = track(new THREE.OctahedronGeometry(0.25, 0));

  const topNodes = [];
  const bottomNodes = [];

  for(let i=0; i<COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2;
    const x = Math.cos(angle) * 2;
    const z = Math.sin(angle) * 2;

    const tNode = new THREE.Mesh(nodeGeoTop, nodeMaterialTop);
    tNode.position.set(x, 0, z);
    curriculumGroup.add(tNode);
    topNodes.push(tNode);

    const bNode = new THREE.Mesh(nodeGeoBottom, nodeMaterialBottom);
    bNode.position.set(x, 0, z);
    demandGroup.add(bNode);
    bottomNodes.push(bNode);
  }

  // Energy field (Gap)
  const gapGeo = track(new THREE.CylinderGeometry(1.8, 1.8, 1, 32, 1, true));
  const gapMat = track(new THREE.MeshBasicMaterial({
    color: palette.indigo,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  const gapField = new THREE.Mesh(gapGeo, gapMat);
  group.add(gapField);

  // Evidence Bridges (Connections)
  const bridges = [];
  for(let i=0; i<COUNT; i++) {
    const bridgeGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 1, 8));
    const bridgeMat = track(new THREE.MeshBasicMaterial({
      color: palette.gold,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    // Align cylinder origin to bottom for easy scaling
    bridgeGeo.translate(0, 0.5, 0); 
    group.add(bridge);
    bridges.push({ mesh: bridge, mat: bridgeMat });
  }

  // Labels
  const curriculumAnchor = new THREE.Object3D();
  curriculumGroup.add(curriculumAnchor);
  curriculumAnchor.position.set(-2.5, 0.5, 0);

  const demandAnchor = new THREE.Object3D();
  demandGroup.add(demandAnchor);
  demandAnchor.position.set(-2.5, -0.5, 0);

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

    const camY = mix(3.5, 1.5, smoothstep(0.05, 0.5, progress));
    const camZ = mix(14, 10, smoothstep(0.1, 0.9, progress));
    camera.position.set(state.pointer.x * 1.5, camY + state.pointer.y * 1.5, camZ);
    camera.lookAt(0, 0, 0);
    set.fit(camera);

    drift = damp(drift, smoothstep(0.05, 0.5, progress), 4, dt);
    settle = damp(settle, smoothstep(0.58, 0.95, progress), 4, dt);

    // Breathing motion
    group.rotation.y = reduced ? 0 : state.pointer.x * 0.1 + elapsed * 0.1;
    group.rotation.x = reduced ? 0 : 0.2 + state.pointer.y * 0.1;

    const baseTopY = 0.2;
    const baseBottomY = -0.2;
    const driftOffset = drift * 2.5;

    curriculumGroup.position.y = baseTopY + driftOffset;
    demandGroup.position.y = baseBottomY - driftOffset;
    
    // Twist effect
    curriculumGroup.rotation.y = drift * Math.PI * 0.25;
    demandGroup.rotation.y = -drift * Math.PI * 0.25;

    // Pulse nodes
    const pulse = Math.sin(elapsed * 2) * 0.2 + 1;
    topNodes.forEach(node => node.scale.setScalar(pulse));
    bottomNodes.forEach(node => node.scale.setScalar(2 - pulse));

    // Gap field
    const gapHeight = (curriculumGroup.position.y - demandGroup.position.y);
    if (gapHeight > 0) {
      gapField.scale.set(1, gapHeight, 1);
    }
    gapField.position.y = (curriculumGroup.position.y + demandGroup.position.y) / 2;
    gapMat.opacity = 0.3 * drift * (1 - settle * 0.5);
    gapAnchor.position.copy(gapField.position);
    gapAnchor.position.x = -2.2;

    // Bridges
    bridges.forEach((bridgeObj, i) => {
      const topNode = topNodes[i];
      const bottomNode = bottomNodes[i];
      
      const topPos = new THREE.Vector3();
      topNode.getWorldPosition(topPos);
      const bottomPos = new THREE.Vector3();
      bottomNode.getWorldPosition(bottomPos);

      // Convert world pos to group local pos
      group.worldToLocal(topPos);
      group.worldToLocal(bottomPos);

      bridgeObj.mesh.position.copy(bottomPos);
      bridgeObj.mesh.lookAt(topPos);
      bridgeObj.mesh.rotateX(Math.PI / 2);
      
      const distance = topPos.distanceTo(bottomPos);
      
      const reveal = clamp(settle * 2 - (i / COUNT));
      if (distance > 0) {
        bridgeObj.mesh.scale.set(1, distance * reveal, 1);
      }
      bridgeObj.mat.opacity = reveal * 0.8;
      bridgeObj.mesh.visible = reveal > 0.01;
    });

    placeLabel(labels.curriculum, curriculumAnchor, 0.95);
    placeLabel(labels.demand, demandAnchor, 0.95);
    placeLabel(labels.gap, gapAnchor, drift * 0.95);

    set.update(dt, elapsed, progress, state.pointer);
  };

  return {
    update,
    dispose() {
      disposables.forEach((object) => object.dispose?.());
      set.dispose();
    }
  };
}
