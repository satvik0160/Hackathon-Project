import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { mix, smoothstep } from '../motion.js';

export function createStations({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 20,
    floorY: -0.25,
  });
  scene.add(set.rig);
  scene.add(set.shadowGroup);

  const disposables = [];
  const track = (obj) => { disposables.push(obj); return obj; };

  const mainGroup = new THREE.Group();
  set.rig.add(mainGroup);

  // Materials strictly reusing palette tokens to perfectly match DevAstra's style
  const panelMat = track(new THREE.MeshStandardMaterial({
    color: palette.panel,
    metalness: 0.1,
    roughness: 0.8,
  }));
  
  const panelDeepMat = track(new THREE.MeshStandardMaterial({
    color: palette.panelDeep,
    metalness: 0.2,
    roughness: 0.7,
  }));

  const lineMat = track(new THREE.MeshStandardMaterial({
    color: palette.line,
    metalness: 0.5,
    roughness: 0.5,
  }));

  const goldMat = track(new THREE.MeshStandardMaterial({
    color: palette.gold,
    emissive: palette.gold,
    emissiveIntensity: 0,
    metalness: 0.4,
    roughness: 0.2,
  }));

  const indigoMat = track(new THREE.MeshStandardMaterial({
    color: palette.indigo,
    emissive: palette.indigo,
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.9,
  }));

  const tealMat = track(new THREE.MeshStandardMaterial({
    color: palette.teal,
    emissive: palette.teal,
    emissiveIntensity: 0,
    metalness: 0.3,
    roughness: 0.3,
  }));

  // --- 0. Continuous Environment Base ---
  // Extends through the entire composition
  const floorGeo = track(new THREE.BoxGeometry(34, 0.5, 14));
  const floor = new THREE.Mesh(floorGeo, panelDeepMat);
  floor.position.set(0, -0.25, -2);
  floor.receiveShadow = true;
  mainGroup.add(floor);

  // Architectural backdrop wall
  const wallGeo = track(new THREE.BoxGeometry(34, 8, 1));
  const wall = new THREE.Mesh(wallGeo, panelDeepMat);
  wall.position.set(0, 3.5, -8.5);
  wall.receiveShadow = true;
  mainGroup.add(wall);

  // --- 1. Assess & Baseline Chamber (x: -9) ---
  const assessGroup = new THREE.Group();
  assessGroup.position.set(-9, 0, 0);
  mainGroup.add(assessGroup);

  const coreGeo = track(new THREE.IcosahedronGeometry(1.2, 0));
  const coreMesh = new THREE.Mesh(coreGeo, goldMat);
  coreMesh.position.set(0, 2, 0);
  coreMesh.castShadow = true;
  assessGroup.add(coreMesh);

  // Solid frame/track around the core
  const trackGeo = track(new THREE.TorusGeometry(2.2, 0.1, 16, 64));
  const trackMesh = new THREE.Mesh(trackGeo, lineMat);
  trackMesh.rotation.x = Math.PI / 2;
  trackMesh.position.set(0, 2, 0);
  assessGroup.add(trackMesh);

  // The active scanner physically riding the track
  const scannerGeo = track(new THREE.BoxGeometry(0.8, 0.4, 0.8));
  const scannerMesh = new THREE.Mesh(scannerGeo, indigoMat);
  scannerMesh.castShadow = true;
  assessGroup.add(scannerMesh);

  // Structural supports grounding the chamber
  const supportGeo = track(new THREE.CylinderGeometry(0.2, 0.2, 4, 16));
  for(let i=0; i<4; i++) {
    const support = new THREE.Mesh(supportGeo, panelMat);
    const ang = (i / 4) * Math.PI * 2 + (Math.PI / 4);
    support.position.set(Math.cos(ang)*2.2, 2, Math.sin(ang)*2.2);
    support.castShadow = true;
    assessGroup.add(support);
  }

  // --- 2. AI-Guided Growth Pathway (x: -5 to 5) ---
  const growGroup = new THREE.Group();
  mainGroup.add(growGroup);

  const stepsCount = 7;
  const milestones = [];
  const pathGeo = track(new THREE.BoxGeometry(1.4, 0.3, 2.4));
  
  for(let i=0; i<stepsCount; i++) {
    const stepMesh = new THREE.Mesh(pathGeo, panelMat);
    const x = mix(-5, 5, i / (stepsCount - 1));
    const y = mix(0.15, 1.8, i / (stepsCount - 1));
    stepMesh.position.set(x, y - 2, 0); // Start sunken out of sight
    stepMesh.receiveShadow = true;
    stepMesh.castShadow = true;
    growGroup.add(stepMesh);
    milestones.push({ mesh: stepMesh, startY: y - 2, targetY: y, active: false });
  }

  // The Signal - Solid block navigating the path
  const signalGeo = track(new RoundedBoxGeometry(0.8, 0.8, 0.8, 2, 0.1));
  const signalMesh = new THREE.Mesh(signalGeo, indigoMat);
  signalMesh.castShadow = true;
  signalMesh.position.set(-9, 2, 0);
  mainGroup.add(signalMesh);

  // --- 3. Deterministic Matching Destinations (x: 9) ---
  const matchGroup = new THREE.Group();
  matchGroup.position.set(9, 0, 0);
  mainGroup.add(matchGroup);

  const gates = [];
  const gateZ = [-3.5, 0, 3.5];
  const gateGeo = track(new THREE.BoxGeometry(2, 4, 2));
  for(let i=0; i<3; i++) {
    const gate = new THREE.Mesh(gateGeo, i === 1 ? tealMat : panelMat);
    // Gates rotate into place on scroll
    gate.position.set(0, 2, gateZ[i]);
    gate.rotation.y = Math.PI / 2; 
    gate.castShadow = true;
    gate.receiveShadow = true;
    matchGroup.add(gate);
    gates.push({ mesh: gate, z: gateZ[i] });
  }

  function update(dt, time) {
    
    const p = context.progress.current;
    
    // Crucial: Update the shared background stars/dust synced with this scene
    set.update(dt, time, p, state.pointer);

    // Smooth scroll stages
    const stage0 = 1 - smoothstep(0.1, 0.33, p); 
    const stage1 = smoothstep(0.25, 0.5, p) * (1 - smoothstep(0.6, 0.75, p)); 
    const stage2 = smoothstep(0.66, 0.9, p); 

    // ASSESS (0 - 33%)
    coreMesh.rotation.y = time * 0.4;
    coreMesh.rotation.x = time * 0.2;
    
    const scanAngle = time * 2;
    scannerMesh.position.set(
      Math.cos(scanAngle) * 2.2,
      2,
      Math.sin(scanAngle) * 2.2
    );
    scannerMesh.rotation.y = -scanAngle;
    
    goldMat.emissiveIntensity = mix(0.1, 1.5 + Math.sin(time * 10) * 0.5, stage0);

    // GROW (33 - 67%)
    milestones.forEach((m, i) => {
      const startP = 0.2 + (i * 0.05);
      const endP = startP + 0.1;
      const stepP = smoothstep(startP, endP, p);
      // Pathway blocks physically construct/unfold by rising up
      m.mesh.position.y = mix(m.startY, m.targetY, stepP);
    });

    let sigX = -9;
    let sigY = 2;
    
    if (p < 0.3) {
      sigX = -9;
      sigY = 2;
    } else if (p < 0.7) {
      const travelP = smoothstep(0.3, 0.7, p);
      sigX = mix(-5, 5, travelP);
      sigY = mix(0.15, 1.8, travelP) + 0.4; // Ride on top of rising steps
    } else {
      const travelP2 = smoothstep(0.7, 0.85, p);
      sigX = mix(5, 9, travelP2);
      sigY = mix(1.8, 1.75, travelP2);
    }
    
    signalMesh.position.set(sigX, sigY, 0);
    signalMesh.rotation.x = sigX * Math.PI;
    signalMesh.rotation.z = sigX * Math.PI;
    
    indigoMat.emissiveIntensity = mix(0.2, 2.5, stage1);

    // MATCH (67 - 100%)
    gates.forEach(gate => {
      // Rotate solid structures into view
      gate.mesh.rotation.y = mix(Math.PI / 2, 0, smoothstep(0.6, 0.8, p));
    });
    
    tealMat.emissiveIntensity = mix(0, 3.0, stage2);

    // CAMERA TRAVEL
    // Instead of panning the model, physically track the camera through the environment
    const camX = mix(-11, 11, smoothstep(0.05, 0.95, p));
    const camZ = mix(14, 18, Math.sin(smoothstep(0, 1, p) * Math.PI)); 
    camera.position.set(camX, 7, camZ);
    camera.lookAt(camX + 3, 2, 0); // Lead the view slightly forward
    
    // Guarantee backdrop scales exactly to new camera coordinates
    set.fit(camera);
  }

  function dispose() {
    scene.remove(set.rig);
    scene.remove(set.shadowGroup);
    set.dispose();
    disposables.forEach((object) => object.dispose?.());
  }

  return { update, dispose };
}
