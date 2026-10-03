const fs = require('fs');
const file = 'frontend/src/landing/three/engineScenes.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('GLTFLoader')) {
    content = "import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';\n" + content;
    
    const loadLogic = `
  const gltfLoader = new GLTFLoader();
  let ionDrive = null;
  gltfLoader.load('/PrimaryIonDrive-transformed.glb', (gltf) => {
    ionDrive = gltf.scene;
    // Scale and position the drive appropriately
    ionDrive.scale.setScalar(0.4);
    ionDrive.position.set(0, -1, 0); // Base position
    group.add(ionDrive);
  });
`;
    content = content.replace(
        'const group = new THREE.Group();\n  set.scene.add(group);',
        'const group = new THREE.Group();\n  set.scene.add(group);\n' + loadLogic
    );
    
    // Animate the ion drive in the update loop
    const updateLogic = `
    if (ionDrive) {
      ionDrive.rotation.y = elapsed * 0.2;
      ionDrive.position.y = -1 + Math.sin(elapsed * 1.5) * 0.1;
    }
`;
    content = content.replace(
      '/* camera: glide between stations',
      updateLogic + '\n    /* camera: glide between stations'
    );
    
    fs.writeFileSync(file, content);
    console.log("Patched engineScenes.js successfully.");
} else {
    console.log("Already patched.");
}
