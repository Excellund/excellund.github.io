import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water2.js';

// Setup THREE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Setup Renderer
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xcce0ff, 0.5);
renderer.gammaInput = true;
renderer.gammaOutput = true;

// Add Renderer to the body
document.body.appendChild(renderer.domElement);

// Geometry
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);

// Material
const greenMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});
const greyMaterial = new THREE.MeshPhongMaterial({color: 0x5A5A5A});

// Mesh
const boxMesh = new THREE.Mesh(boxGeometry, greenMaterial);
const planeMesh = new THREE.Mesh(planeGeometry, greyMaterial);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
const light3 = new THREE.DirectionalLight(0xffffff, 0.25);

// Define the dimensions of the grid
const rows = 6;
const columns = 6;

// Create an empty 6x6 grid
const grid = [];

// Populate the grid, excluding the corners
for (let i = 0; i < rows; i++) {
  const row = [];
  for (let j = 0; j < columns; j++) {
    
    if((i === 0 && j === 0) || (i === 0 && j === columns-1) || (i === rows-1 && j === 0) || (i === rows-1 && j === columns-1)) {
      row.push(null);
    } else {
      row.push(new THREE.PointLight(0x69FFFF, 0.3));
    }
  }
  grid.push(row);
}

console.log(grid)

// Define the spacing between grid elements
const spacingX = 0.86; // Adjust this value as needed
const spacingY = 0.86; // Adjust this value as needed

// Loop through the grid and add non-corner elements to the scene
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < columns; j++) {
    if (grid[i][j] !== null) {
      const x = (j * spacingX) - 2.145;
      const y = 0.1;
      const z = (i * spacingY) - 2.145;

      // Check if the object has a 'position' property before setting it
      if (grid[i][j].position) {
        grid[i][j].position.set(x, y, z);

        // Add the object to the scene
        scene.add(grid[i][j]);
      }
    }
  }
}

// Position the Camera
camera.position.z = 5;
camera.position.y = 3;
camera.lookAt(new THREE.Vector3(0,0,0));

// Position the Plane
planeMesh.rotation.x = -Math.PI / 2;

// Position the Light
light.position.set(0, 1, 0);
light2.position.set(1, 1, 1);
light3.position.set(-1, 1, -1);

// skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath( 'textures/skybox/' );

const cubeTexture = cubeTextureLoader.load( [
  'posx.jpg', 'negx.jpg',
  'posy.jpg', 'negy.jpg',
  'posz.jpg', 'negz.jpg'
] );

scene.background = cubeTexture;

// Scene Additions
scene.add(light);
scene.add(light2);
scene.add(light3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 10;
controls.minDistance = 3.4;
controls.maxPolarAngle = Math.PI / 2.1;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const duckPath = "../resources/duck.glb";
const bowlPath = "../resources/bowl.glb";
const LoadGLTF = (scene, path, x, y, z, xRot, yRot, zRot, scale) => {
  return new Promise<void>((resolve, reject) => {
    // Create a loader
    const loader = new GLTFLoader();

    // Load the GLTF file
    loader.load(path, (gltf) => {

      gltf.scene.position.x += x;
      gltf.scene.position.y += y;
      gltf.scene.position.z += z;
      gltf.scene.rotation.x += xRot;
      gltf.scene.rotation.y += yRot;
      gltf.scene.rotation.z += zRot;
      gltf.scene.scale.set(scale, scale, scale);
      scene.add(gltf.scene);

      resolve();
    }, undefined, (error) => {
      reject(error);
    });
  });
}
LoadGLTF(scene, duckPath, 1, 0.9, 1, 0, Math.PI / 3, 0, 0.3)
LoadGLTF(scene, duckPath, 1, 0.9, -1.5, 0, Math.PI * 1.8, 0, 0.3)
LoadGLTF(scene, duckPath, -1.5, 0.9, -1.5, 0, Math.PI / 4, 0, 0.3)
LoadGLTF(scene, bowlPath, 0, 0, 0, 0, 0, 0, 1)

// Water
const params = {
  color: '#ffffff',
  scale: 4,
  flowX: 1,
  flowY: 1
};

const waterGeometry = new THREE.CircleGeometry( 2.8, 20 );

let water = new Water( waterGeometry, {
  color: params.color,
  scale: params.scale,
  flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
  textureWidth: 1024,
  textureHeight: 1024
} );

water.position.y = 1;
water.rotation.x = Math.PI * - 0.5;
scene.add( water );

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();