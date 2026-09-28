/**
 * Hero — the DevAstra "Skill Signal", the brand object.
 *
 * One composed instrument: three beveled, differently-shaped plates interlocked
 * around a gold core, orbited by the four assessed skills, wrapped in signal
 * rings and standing over a real contact shadow.
 *
 *   ASSESSED      gold hexagon — evidence gathered from assessments
 *   GROWTH PATH   indigo octagon — the route Dhruv builds from the gaps
 *   ROLE MATCH    teal rounded triangle — the roles that evidence qualifies you for
 *
 * Interaction states, all sharing one `explode` value so they can never fight
 * each other:
 *   idle drift  →  pointer tilt  →  hover brighten + label  →  hold 0.5 s to
 *   separate the plates  →  release eases them back together.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStageSet } from './stageSet.js';
import { clamp, damp, mix, smoothstep } from '../motion.js';

const HOLD_SECONDS = 0.5;
const SKILL_ACCENTS = ['indigo', 'gold', 'teal', 'indigoSoft'];

/* ---------------- shapes: real outlines, extruded with bevels ---------------- */

function shapeFromPoints(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

const ring = (count, offset = 0) =>
  Array.from({ length: count }, (_, i) => {
    const angle = ((Math.PI * 2) / count) * i + offset;
    return [Math.cos(angle), Math.sin(angle)];
  });

const HEX_POINTS = ring(6, Math.PI / 6);
const OCT_POINTS = ring(8, Math.PI / 8);

/* Rounded triangle built as a polygon loop: one apex per corner plus two
   chamfer points, so edges stay straight and corners soften. */
const TRI_POINTS = [];
{
  const R = 1.04;
  const CHAMFER = 0.3;
  for (let corner = 0; corner < 3; corner += 1) {
    const angle = (Math.PI / 2) + ((Math.PI * 2) / 3) * corner;
    const out = [Math.cos(angle), Math.sin(angle)];
    const tangent = [-out[1], out[0]];
    const apex = [out[0] * R, out[1] * R];
    const before = [out[0] * R + tangent[0] * CHAMFER * R, out[1] * R + tangent[1] * CHAMFER * R];
    const after = [out[0] * R - tangent[0] * CHAMFER * R, out[1] * R - tangent[1] * CHAMFER * R];
    TRI_POINTS.push(after, apex, before);
  }
}

function extruded(track, points, depth, bevel) {
  const geometry = track(
    new THREE.ExtrudeGeometry(shapeFromPoints(points), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 4,
    })
  );
  geometry.center();
  return geometry;
}

export function createHeroSignal({ stage, palette, reduced, context }) {
  const { scene, camera, state } = stage;

  /* ---------------- stage set: sky, dust, floor, rig ---------------- */
  const set = createStageSet({
    scene,
    renderer: stage.renderer,
    palette,
    theme: context.theme,
    depth: 8,
    floorY: -3.55,
  });
  scene.add(set.rig);
  scene.add(set.shadowGroup);
  set.fit(camera);

  const group = new THREE.Group();
  scene.add(group);

  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  /* Materials fade as the chapter scrolls away; they stay opaque otherwise so
     the depth sort stays honest. */
  const fadeMaterials = [];
  const registerFade = (material, baseOpacity) => {
    material.opacity = baseOpacity;
    fadeMaterials.push({ material, baseOpacity });
    return material;
  };

  const brushedMetal = (accent, emissiveIntensity) =>
    registerFade(
      track(
        new THREE.MeshPhysicalMaterial({
          color: palette.panel,
          metalness: 0.72,
          roughness: 0.34,
          clearcoat: 0.55,
          clearcoatRoughness: 0.3,
          envMapIntensity: 1.2,
          emissive: palette[accent],
          emissiveIntensity,
          flatShading: true,
        })
      ),
      1
    );

  const glassAccent = (accent) =>
    registerFade(
      track(
        new THREE.MeshPhysicalMaterial({
          color: palette[accent],
          metalness: 0.1,
          roughness: 0.18,
          transmission: 0.55,
          thickness: 0.9,
          ior: 1.4,
          envMapIntensity: 1.35,
          emissive: palette[accent],
          emissiveIntensity: 0.22,
        })
      ),
      0.96
    );

  /* ---------------- the three plates ---------------- */
  const hexGeometry = extruded(track, HEX_POINTS, 0.46, 0.085);
  const hexEdges = track(new THREE.EdgesGeometry(hexGeometry, 28));
  const octGeometry = extruded(track, OCT_POINTS, 0.36, 0.07);
  const octEdges = track(new THREE.EdgesGeometry(octGeometry, 28));
  const triGeometry = extruded(track, TRI_POINTS, 0.56, 0.1);
  const triEdges = track(new THREE.EdgesGeometry(triGeometry, 30));

  const PLATE_DEFS = [
    {
      id: 'assessed',
      label: 'ASSESSED',
      accent: 'gold',
      geometry: hexGeometry,
      edgeGeometry: hexEdges,
      rest: new THREE.Vector3(-1.62, 0.42, 0),
      dir: new THREE.Vector3(-1.2, 0.36, 0.3),
      phase: 0,
      spin: 0.42,
      tiltY: 0.44,
      labelOffset: new THREE.Vector3(0, 1.55, 0),
    },
    {
      id: 'growth',
      label: 'GROWTH PATH',
      accent: 'indigo',
      geometry: octGeometry,
      edgeGeometry: octEdges,
      rest: new THREE.Vector3(1.66, 0.26, -0.4),
      dir: new THREE.Vector3(1.26, 0.52, -0.3),
      phase: 1.9,
      spin: -0.48,
      tiltY: -0.48,
      labelOffset: new THREE.Vector3(0, 1.55, 0),
    },
    {
      id: 'match',
      label: 'ROLE MATCH',
      accent: 'teal',
      geometry: triGeometry,
      edgeGeometry: triEdges,
      rest: new THREE.Vector3(0.04, -1.42, 0.32),
      dir: new THREE.Vector3(0.1, -1.3, 0.42),
      phase: 3.4,
      spin: 0.52,
      tiltY: 0.1,
      labelOffset: new THREE.Vector3(0, -1.55, 0),
    },
  ];

  const plates = PLATE_DEFS.map((definition, plateIndex) => {
    const pivot = new THREE.Group();
    pivot.position.copy(definition.rest);
    group.add(pivot);

    const material = brushedMetal(definition.accent, 0.26);
    const mesh = new THREE.Mesh(definition.geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.rotation.x = Math.PI / 2;
    // Index from the map callback, never from `plates` — that binding is still
    // in its temporal dead zone while this callback runs.
    mesh.userData = { kind: 'panel', index: plateIndex };
    pivot.add(mesh);

    const edgeMaterial = registerFade(
      track(new THREE.LineBasicMaterial({ color: palette[definition.accent] })),
      0.65
    );
    const edges = new THREE.LineSegments(definition.edgeGeometry, edgeMaterial);
    edges.rotation.x = Math.PI / 2;
    pivot.add(edges);

    pivot.rotation.y = definition.tiltY;

    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.copy(definition.labelOffset);
    pivot.add(labelAnchor);

    return {
      ...definition,
      pivot,
      mesh,
      material,
      edgeMaterial,
      labelAnchor,
      hover: 0,
      labelOpacity: 0,
    };
  });

  /* ---------------- skill nodes + connecting lines ---------------- */

  const SKILL_DEFS = [
    { id: 'React', accent: 'indigo', position: new THREE.Vector3(3.15, 1.5, -0.8), phase: 0.4 },
    { id: 'TypeScript', accent: 'gold', position: new THREE.Vector3(-3.05, 1.45, 0.6), phase: 1.5 },
    { id: 'Node.js', accent: 'teal', position: new THREE.Vector3(2.8, -1.8, 0.4), phase: 2.7 },
    { id: 'SQL', accent: 'indigoSoft', position: new THREE.Vector3(-2.65, -1.7, -0.5), phase: 3.9 },
  ];

  const nodeGeometry = track(new RoundedBoxGeometry(0.34, 0.34, 0.34, 3, 0.09));
  const nodes = SKILL_DEFS.map((definition, index) => {
    const accent = palette[SKILL_ACCENTS[index % SKILL_ACCENTS.length]];
    const material = registerFade(
      track(
        new THREE.MeshPhysicalMaterial({
          color: accent,
          metalness: 0.55,
          roughness: 0.26,
          envMapIntensity: 1.3,
          emissive: accent,
          emissiveIntensity: 0.5,
        })
      ),
      0.97
    );
    const mesh = new THREE.Mesh(nodeGeometry, material);
    mesh.position.copy(definition.position);
    mesh.castShadow = true;
    mesh.userData = { kind: 'node', index };
    group.add(mesh);

    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.set(0, 0.6, 0);
    mesh.add(labelAnchor);

    return { ...definition, mesh, material, labelAnchor, hover: 0 };
  });

  /* ---------------- core, rings, connectors ---------------- */

  const coreMaterial = registerFade(
    track(
      new THREE.MeshPhysicalMaterial({
        color: palette.gold,
        metalness: 0.9,
        roughness: 0.22,
        envMapIntensity: 1.6,
        emissive: palette.gold,
        emissiveIntensity: 0.55,
        flatShading: true,
      })
    ),
    1
  );
  const core = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.4, 0)), coreMaterial);
  core.userData = { kind: 'panel', index: -1 };
  group.add(core);

  const ringMaterial = registerFade(
    track(new THREE.MeshStandardMaterial({ color: palette.line, metalness: 0.6, roughness: 0.4 })),
    0.55
  );
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.92, 0.02, 8, 72)), ringMaterial);
  ring.castShadow = false;
  group.add(ring);
  const outerRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.3, 0.012, 8, 80)),
    registerFade(track(new THREE.MeshBasicMaterial({ color: palette.line })), 0.3)
  );
  group.add(outerRing);

  /* Every connector is a two-point line whose endpoints are rewritten each
     frame, because the plates move when they separate. */
  const makeLine = (color, baseOpacity) => {
    const geometry = track(new THREE.BufferGeometry());
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const material = registerFade(track(new THREE.LineBasicMaterial({ color })), baseOpacity);
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;
    group.add(line);
    return line;
  };

  const skillLines = nodes.map((node, index) => ({
    node,
    line: makeLine(palette[SKILL_ACCENTS[index % SKILL_ACCENTS.length]], 0.45),
  }));
  const coreLines = plates.map((plate) => ({ plate, line: makeLine(palette[plate.accent], 0.38) }));
  const chainLines = [plates[0], plates[1]].map((plate, index) => ({
    from: plate,
    to: plates[index + 1],
    line: makeLine(palette[plates[index + 1].accent], 0.28),
  }));

  const setSegment = (line, from, to) => {
    const positions = line.geometry.attributes.position;
    positions.setXYZ(0, from.x, from.y, from.z);
    positions.setXYZ(1, to.x, to.y, to.z);
    positions.needsUpdate = true;
  };

  /* ---------------- pointer + hold state ---------------- */

  const raycaster = new THREE.Raycaster();
  const interactive = [...plates.map((plate) => plate.mesh), ...nodes.map((node) => node.mesh)];

  let hovered = null;
  let holding = false;
  let charge = 0;
  let explode = 0;
  let explodeTarget = 0;
  let explodeOverride = null; // keyboard toggle
  let tiltX = 0;
  let tiltY = 0;
  let framing = null;
  let fade = 1;

  const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="tab"], [data-signal-ignore]';

  const pick = (ndc) => {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(interactive, false);
    if (!hits.length) return null;
    const { kind, index } = hits[0].object.userData;
    // The core answers pointer presses with the whole instrument.
    return kind === 'panel' && index === -1 ? { kind: 'panel', index: 0 } : { kind, index };
  };

  const notifyHover = (next) => {
    if (!context.onHover) return;
    const previousKey = hovered ? `${hovered.kind}:${hovered.index}` : 'none';
    const nextKey = next ? `${next.kind}:${next.index}` : 'none';
    if (previousKey === nextKey) return;
    context.onHover(next);
  };

  const unsubscribe = [
    stage.onPointer('down', (event, ndc) => {
      if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;
      // Press what is visually highlighted: the raw ray first (most accurate),
      // then the damped hover target, so pressing the plate the legend says you
      // are hovering always works. Only a real object surface starts the
      // charge — never empty space, and never a click that belongs to a link.
      const target = pick(ndc) ?? (hovered?.kind === 'panel' ? hovered : null);
      if (!target || target.kind !== 'panel') return;
      holding = true;
    }),
    stage.onPointer('up', () => {
      holding = false;
    }),
    stage.onPointer('leave', () => {
      holding = false;
    }),
  ];

  const labelElements = context.labels?.current ?? {};
  const projected = new THREE.Vector3();

  const placeLabel = (element, anchor, opacity, scale = 1) => {
    if (!element) return;
    anchor.getWorldPosition(projected);
    projected.project(camera);
    if (projected.z > 1 || opacity <= 0.02) {
      element.style.opacity = '0';
      return;
    }
    const x = (projected.x * 0.5 + 0.5) * state.width;
    const y = (-projected.y * 0.5 + 0.5) * state.height;
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
    element.style.opacity = opacity.toFixed(3);
  };

  const update = (dt, elapsed) => {
    const progress = clamp(context.progress?.current ?? 0);

    /* camera framing: a gentle dolly as the chapter scrubs — depth cue, not
       a gimmick — then back out as the chapter hands over */
    const dolly = mix(11.4, 12.6, progress);
    camera.position.z = dolly;
    set.fit(camera);

    fade = reduced ? 1 : 1 - smoothstep(0.55, 1, progress);

    /* pointer tilt — eased, never snapping to the cursor */
    tiltX = damp(tiltX, -state.pointer.y * 0.15, 3, dt);
    tiltY = damp(tiltY, state.pointer.x * 0.24, 3, dt);
    group.rotation.x = tiltX + (reduced ? 0 : Math.sin(elapsed * 0.32) * 0.03);
    group.rotation.y = tiltY + (reduced ? 0 : elapsed * 0.04);
    group.position.y = progress * 1.1;
    group.position.z = -progress * 4.2;
    group.scale.setScalar(mix(1.04, 0.92, progress));

    /* Hover is re-tested every frame while the pointer is inside the chapter.
       The instrument rotates on its own, so hover is a property of where the
       geometry is right now. Nine objects per frame is free. */
    if (state.pointerInside) {
      const next = pick(state.pointer);
      notifyHover(next);
      hovered = next;
    } else if (hovered) {
      notifyHover(null);
      hovered = null;
    }

    /* hold-to-separate: 0.5 s of charge, then the plates travel apart */
    if (explodeOverride !== null) {
      explodeTarget = explodeOverride ? 1 : 0;
      charge = 0;
    } else if (holding) {
      charge += dt;
      if (charge >= HOLD_SECONDS) explodeTarget = 1;
    } else {
      charge = 0;
      explodeTarget = 0;
    }
    explode = damp(explode, explodeTarget, 5.5, dt);

    /* plates */
    plates.forEach((plate, index) => {
      const isHovered = hovered?.kind === 'panel' && hovered.index === index;
      plate.hover = damp(plate.hover, isHovered ? 1 : 0, 8, dt);

      const bob = reduced ? 0 : Math.sin(elapsed * 0.75 + plate.phase) * 0.07;
      plate.pivot.position.copy(plate.rest).addScaledVector(plate.dir, explode * 1.25);
      plate.pivot.position.y += bob;
      plate.pivot.rotation.z = plate.spin * explode * 0.5;
      plate.pivot.rotation.y = plate.tiltY + plate.hover * 0.09;
      plate.material.emissiveIntensity = 0.26 + plate.hover * 0.9 + explode * 0.3;
      plate.pivot.scale.setScalar(1 + plate.hover * 0.05 + explode * 0.04);
    });

    /* skill nodes */
    nodes.forEach((node) => {
      const isHovered = hovered?.kind === 'node' && hovered.index === SKILL_DEFS.findIndex((d) => d.id === node.id);
      node.hover = damp(node.hover, isHovered ? 1 : 0, 8, dt);
      const pulse = reduced ? 0 : Math.sin(elapsed * 1.1 + node.phase) * 0.045;
      node.mesh.scale.setScalar(1 + node.hover * 0.24 + pulse);
      node.material.emissiveIntensity = 0.5 + node.hover * 0.9;
    });

    /* core + rings */
    core.rotation.y = reduced ? 0.4 : elapsed * 0.35;
    core.rotation.x = 0.3;
    ring.rotation.z = reduced ? 0 : elapsed * 0.18;
    ring.rotation.x = Math.PI * 0.32 + explode * 0.22;
    outerRing.rotation.z = reduced ? 0 : -elapsed * 0.11;
    outerRing.rotation.x = Math.PI * 0.44;

    /* connectors follow the moving plates (the core sits at group origin) */
    const coreLocal = core.position;
    skillLines.forEach(({ node, line }) => setSegment(line, node.mesh.position, coreLocal));
    coreLines.forEach(({ plate, line }) => setSegment(line, coreLocal, plate.pivot.position));
    chainLines.forEach(({ from, to, line }) => setSegment(line, from.pivot.position, to.pivot.position));

    set.update(dt, elapsed, progress, state.pointer);

    /* fade with the chapter */
    fadeMaterials.forEach(({ material, baseOpacity }) => {
      const opacity = baseOpacity * fade;
      material.opacity = opacity;
      const shouldBeTransparent = opacity < 0.995;
      if (material.transparent !== shouldBeTransparent) {
        material.transparent = shouldBeTransparent;
        material.needsUpdate = true;
      }
    });

    /* DOM labels — real, selectable text pinned to the 3D anchors */
    plates.forEach((plate, index) => {
      const isHovered = hovered?.kind === 'panel' && hovered.index === index;
      const visible = isHovered || explode > 0.45;
      plate.labelOpacity = damp(plate.labelOpacity, visible ? 1 : 0, 9, dt);
      placeLabel(labelElements[plate.id], plate.labelAnchor, plate.labelOpacity * fade, 1);
    });
    nodes.forEach((node) => {
      const isHovered = hovered?.kind === 'node' && SKILL_DEFS.findIndex((d) => d.id === node.id) === hovered.index;
      placeLabel(labelElements[node.id], node.labelAnchor, (0.62 + (isHovered ? 0.38 : 0)) * fade, 1);
    });
  };

  return {
    update,
    setHold(next) {
      if (next) {
        holding = true;
      } else {
        holding = false;
        explodeOverride = null;
      }
    },
    setExploded(next) {
      explodeOverride = next ? 1 : 0;
      holding = false;
    },
    isExploded: () => explodeTarget === 1,
    dispose() {
      unsubscribe.forEach((off) => off && off());
      disposables.forEach((object) => {
        if (object.dispose) object.dispose();
      });
      set.dispose();
    },
  };
}
