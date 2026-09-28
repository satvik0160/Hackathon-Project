/* --------------------------------------------------------------------------
 * SpiralDirector — computes helix positions, reads scroll progress, resolves
 * the active card index, and interpolates camera + card transforms.
 *
 * This is a pure-logic module with no React dependency. The animation loop
 * calls director.update(deltaSeconds) each frame.
 * -------------------------------------------------------------------------- */

import * as THREE from 'three';

const CARD_COUNT = 13;
const ANGLE_STEP = (34 * Math.PI) / 180; // ~34 degrees per card
const VERTICAL_PITCH = 2.1; // world units between cards vertically
const AXIS_RADIUS = 2.5; // distance from the central axis
const CAMERA_DISTANCE = 7.5; // camera distance from active card
const CAMERA_HEIGHT_OFFSET = 0.3; // camera slightly above card center
const DAMPING = 5.0; // damping factor for exponential easing

export class SpiralDirector {
  constructor() {
    this.cardCount = CARD_COUNT;
    this.activeIndex = 0;
    this.targetIndex = 0;
    this.smoothIndex = 0;
    this.scrollProgress = 0;

    // Precompute helix positions for all cards
    this.helixPositions = [];
    this.helixAngles = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const theta = i * ANGLE_STEP;
      const y = -i * VERTICAL_PITCH;
      const x = AXIS_RADIUS * Math.cos(theta);
      const z = AXIS_RADIUS * Math.sin(theta);
      this.helixPositions.push(new THREE.Vector3(x, y, z));
      this.helixAngles.push(theta);
    }

    // Camera state
    this.cameraPos = new THREE.Vector3(0, 0, CAMERA_DISTANCE);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);
    this.targetCameraPos = new THREE.Vector3();
    this.targetCameraLookAt = new THREE.Vector3();

    // Pointer parallax
    this.pointerX = 0;
    this.pointerY = 0;
  }

  /* Get the resting helix position for card i. */
  getCardPosition(i) {
    return this.helixPositions[i];
  }

  /* Get the angle for card i on the helix. */
  getCardAngle(i) {
    return this.helixAngles[i];
  }

  /* Update the scroll-derived target index. Called from scroll listener. */
  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
    this.targetIndex = this.scrollProgress * (CARD_COUNT - 1);
  }

  /* Set the active card index explicitly (e.g. from IntersectionObserver). */
  setActiveIndex(index) {
    this.activeIndex = Math.max(0, Math.min(CARD_COUNT - 1, index));
    this.targetIndex = this.activeIndex;
  }

  /* Update pointer for subtle parallax. */
  setPointer(nx, ny) {
    this.pointerX = nx;
    this.pointerY = ny;
  }

  /* Per-frame update. Returns computed state for the renderer to apply.
   * deltaSeconds is the time since last frame in seconds. */
  update(deltaSeconds) {
    const alpha = 1 - Math.exp(-DAMPING * deltaSeconds);

    // Smooth the continuous index
    this.smoothIndex += (this.targetIndex - this.smoothIndex) * alpha;
    this.activeIndex = Math.round(this.smoothIndex);

    // Compute camera target based on the smooth index
    const floorIdx = Math.max(0, Math.min(CARD_COUNT - 2, Math.floor(this.smoothIndex)));
    const frac = this.smoothIndex - floorIdx;
    const posA = this.helixPositions[floorIdx];
    const posB = this.helixPositions[Math.min(floorIdx + 1, CARD_COUNT - 1)];

    // Camera orbits opposite to the active card, looking at it
    const activePos = new THREE.Vector3().lerpVectors(posA, posB, frac);
    const activeAngle = this.helixAngles[floorIdx] + frac * ANGLE_STEP;

    // Camera is placed opposite the active card on the helix
    this.targetCameraPos.set(
      -Math.cos(activeAngle) * CAMERA_DISTANCE * 0.6,
      activePos.y + CAMERA_HEIGHT_OFFSET,
      -Math.sin(activeAngle) * CAMERA_DISTANCE * 0.2 + CAMERA_DISTANCE
    );
    this.targetCameraLookAt.copy(activePos);

    // Smooth camera
    this.cameraPos.lerp(this.targetCameraPos, alpha);
    this.cameraLookAt.lerp(this.targetCameraLookAt, alpha);

    // Build card transforms
    const cardTransforms = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const dist = Math.abs(this.smoothIndex - i);
      const isActive = i === this.activeIndex;
      const isNeighbor = dist > 0 && dist <= 2;

      // Position: helix position
      const pos = this.helixPositions[i].clone();

      // Rotation: when active, rotate to face camera; when inactive, face outward
      const theta = this.helixAngles[i];
      let rotationY;
      if (isActive) {
        // Face the camera
        const toCam = new THREE.Vector3().subVectors(this.cameraPos, pos);
        rotationY = Math.atan2(toCam.x, toCam.z);
      } else {
        // Face outward from axis (tangential)
        rotationY = theta + Math.PI / 2;
        // Blend toward camera-facing as card approaches active
        if (dist < 2) {
          const toCam = new THREE.Vector3().subVectors(this.cameraPos, pos);
          const cameraFacing = Math.atan2(toCam.x, toCam.z);
          const blend = 1 - dist / 2;
          rotationY = rotationY + (cameraFacing - rotationY) * blend * 0.7;
        }
      }

      // Scale: active card is 1.0, neighbors scale down
      const scale = isActive ? 1.0 : Math.max(0.55, 1 - dist * 0.18);

      // Opacity: active is 1.0, fade with distance
      const opacity = isActive ? 1.0 : Math.max(0.15, 1 - dist * 0.3);

      // Brightness: active gets highlight
      const brightness = isActive ? 1.0 : Math.max(0.3, 1 - dist * 0.25);

      cardTransforms.push({
        index: i,
        position: pos,
        rotationY,
        scale,
        opacity,
        brightness,
        isActive,
        isNeighbor,
        distance: dist,
      });
    }

    return {
      cameraPosition: this.cameraPos.clone(),
      cameraLookAt: this.cameraLookAt.clone(),
      activeIndex: this.activeIndex,
      smoothIndex: this.smoothIndex,
      cardTransforms,
      pointerX: this.pointerX * 0.4, // subdued parallax
      pointerY: this.pointerY * 0.3,
    };
  }
}

export default SpiralDirector;
