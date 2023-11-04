import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water2.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js' 

const sceneConfig = {
  backgroundColor: 0xcce0ff,
};

const cameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
};

const gridConfig = {
  rows: 6,
  columns: 6,
  spacingX: 0.86,
  spacingY: 0.86,
};

const whiteColor = 0xffffff;
const lightIntensity = {
  full: 1,
  half: 0.5,
  dimmed: 0.25,
};

const nameOffset = {
  initialX: 2.5,
  initialY: 0.01,
  initialZ: 2.5,
};

const materialHexColors = [
  "#000000",
  "#744B1F",
  "#46C098",
  "#000000",
  "#256B32",
  "#256B32",
  "#9E9E9E",
  "#9E9E9E",
  "#9E9E9E"
];

const duckPath = '../resources/duck.glb';
const bowlPath = '../resources/bowl.glb';
const pondPath = '../resources/pond.glb';

let tooLazyToHandleLoadingProperly = 0;

// Setup THREE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  cameraConfig.fov, 
  innerWidth / innerHeight, 
  cameraConfig.near, 
  cameraConfig.far
);
const renderer = new THREE.WebGLRenderer();

// Setup Renderer
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(sceneConfig.backgroundColor, 0.5);
renderer.gammaInput = true;
renderer.gammaOutput = true;

// Add Renderer to the body
document.body.appendChild(renderer.domElement);

// Material
const greenMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});
const greyMaterial = new THREE.MeshPhongMaterial({color: 0x5A5A5A});

// Light
const light = new THREE.DirectionalLight(whiteColor, lightIntensity.full);
const light2 = new THREE.DirectionalLight(whiteColor, lightIntensity.half);
const light3 = new THREE.DirectionalLight(whiteColor, lightIntensity.dimmed);

/* const grid = generateGridWithoutCorners(gridConfig.rows, gridConfig.columns);
const lightOffset = 2.145;
addGridObjectsToScene(grid, scene, gridConfig.spacingX, gridConfig.spacingY, lightOffset); */

// Position the Camera
camera.position.z = 5;
camera.position.y = 3;
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Position the Light
light.position.set(0, 1, 0);
light2.position.set(1, 1, 1);
light3.position.set(-1, 1, -1);

// skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath( 'textures/skybox-black/' );
const cubeTexture = cubeTextureLoader.load( [
  'black.jpg', 'black.jpg',
  'black.jpg', 'black.jpg',
  'black.jpg', 'black.jpg'
] );
scene.background = cubeTexture;

// Scene Additions
scene.add(light);
scene.add(light2);
scene.add(light3);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 10;
controls.minDistance = 3.4;
controls.maxPolarAngle = Math.PI / 2.1;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Models
let model;
const LoadGLTF = (scene, path, x, y, z, xRot, yRot, zRot, scale) => {
  return new Promise<void>((resolve, reject) => {
    // Create a loader
    const loader = new GLTFLoader();

    // Load the GLTF file
    
    loader.load(path, (gltf) => {
      model = gltf.scene;
      const colors = new Uint8Array(5);

					for ( let c = 0; c <= colors.length; c ++ ) {

						colors[ c ] = ( c / colors.length ) * 256;

					}
      const gradientMap = new THREE.DataTexture( colors, colors.length, 1, ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat);
			gradientMap.needsUpdate = true;
      let nodeCount = 0;

      gltf.scene.traverse((node: any) => {
          let material = new THREE.MeshToonMaterial({
            gradientMap: gradientMap,
            color: materialHexColors[nodeCount],
          });
          if(nodeCount === 2) {
            const loadingLol = () => tooLazyToHandleLoadingProperly++;
            const ENV_URL = 'textures/skybox-black/black.jpg'
            const reflectionCube = new THREE.TextureLoader().load(ENV_URL, loadingLol)
            const refractionCube = new THREE.TextureLoader().load(ENV_URL, loadingLol)
            reflectionCube.mapping = THREE.EquirectangularReflectionMapping;
            refractionCube.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = reflectionCube;
            scene.environment = reflectionCube;

            const refractionMaterial = new THREE.MeshPhysicalMaterial({
              color: 0xc3e4f9,
              envMap: refractionCube,
              metalness: 1,
              reflectivity: 0,
              refractionRatio: .1,
              roughness: 0,
              side: THREE.DoubleSide
            });

            const reflectionMaterial = new THREE.MeshPhysicalMaterial({
              color: 0xc3e4f9,
              envMap: reflectionCube,
              envMapIntensity: 1,
              metalness: .35,
              reflectivity: .9,
              roughness: 0,
              side: THREE.DoubleSide,
              transmission: 1,
              transparent: true
            });

            const refractionMesh = new THREE.Mesh(node.geometry, refractionMaterial)
            const reflectionMesh = new THREE.Mesh(node.geometry, reflectionMaterial)
            const water = new THREE.Object3D();
            water.add(refractionMesh);
            water.add(reflectionMesh);
            
          } else {
            node.material = material;
          }
          nodeCount++;
      });

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
/* LoadGLTF(scene, duckPath, 1, 0.9, 1, 0, Math.PI / 3, 0, 0.3)
LoadGLTF(scene, duckPath, 1, 0.9, -1.5, 0, Math.PI * 1.8, 0, 0.3)
LoadGLTF(scene, duckPath, -1.5, 0.9, -1.5, 0, Math.PI / 4, 0, 0.3)
LoadGLTF(scene, bowlPath, 0, 0, 0, 0, 0, 0, 1) */
LoadGLTF(scene, pondPath, 0, 0, 0, 0, 0, 0, 1)

// Water
/* const params = {
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
scene.add( water ); */

// Text
const loader = new FontLoader();
const robotoLightPath = '../fonts/Roboto-Light-Regular.json';
const robotoMediumPath = '../fonts/Roboto-Medium-Regular.json';

loader.load(robotoMediumPath, function (font) {
  try {
    const nameParameters = {
      font: font,
      size: 0.2,
      height: 0.001,
      curveSegments: 10,
      bevelEnabled: false,
      bevelOffset: 0,
      bevelSegments: 1,
      bevelSize: 0.3,
      bevelThickness: 1
    }

    const nameGeometry = new TextGeometry('Mike Lund Andersen', nameParameters);

    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
      new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    ];

    const nameMesh = new THREE.Mesh(nameGeometry, textMaterials);
    nameMesh.castShadow = true;
    nameMesh.position.set(nameOffset.initialX, nameOffset.initialY, nameOffset.initialZ); // Use .set() for setting position
    nameMesh.rotation.set(-Math.PI / 2, 0, 0); // Use .set() for setting rotation

    scene.add(nameMesh);
  } catch (error) {
    console.error("An error occurred while creating 3D text:", error);
  }
});

loader.load(robotoLightPath, function (font) {
  try {
    const titleParameters = {
      font: font,
      size: 0.16,
      height: 0.001,
      curveSegments: 10,
      bevelEnabled: false,
      bevelOffset: 0,
      bevelSegments: 1,
      bevelSize: 0.3,
      bevelThickness: 1
    }

    // Instantiate Text Geometries
    const titleGeometries = [
      new TextGeometry('Software Consultant', titleParameters),
      new TextGeometry('Data Scientist', titleParameters),
      new TextGeometry('Game Developer', titleParameters),
      new TextGeometry('3D Artist', titleParameters),
    ];

    // All Text Materials
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
      new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    ];

    // Instantiate Title Meshes
    const titleMeshes: any[] = [];
    titleGeometries.forEach(function (geometry) {
      titleMeshes.push(new THREE.Mesh(geometry, textMaterials));
    });

    // Setup Titles Text
    titleMeshes.forEach(function (mesh, index) {
      mesh.castShadow = true;
      mesh.position.set(nameOffset.initialX, nameOffset.initialY, nameOffset.initialZ + 0.3 * (index + 1));
      mesh.rotation.set(-Math.PI / 2, 0, 0);
      scene.add(mesh);
    });
  } catch (error) {
    console.error("An error occurred while creating 3D text:", error);
  }
});

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  if (tooLazyToHandleLoadingProperly !== 2) return;
}
animate();

// Function to generate a grid of objects without corner elements
function generateGridWithoutCorners(rows, columns) {
  const grid = []; // Create an empty grid to store objects

  for (let i = 0; i < rows; i++) { // Loop through rows
    const row = []; // Create a row to hold objects in this row
    for (let j = 0; j < columns; j++) { // Loop through columns
      // Check if the current position is a corner (top-left, top-right, bottom-left, or bottom-right)
      const isCorner = (i === 0 || i === rows - 1) && (j === 0 || j === columns - 1);

      if (isCorner) {
        row.push(null); // If it's a corner, add null to the row (no object)
      } else {
        // If it's not a corner, add a PointLight object to the row with specified color and intensity
        row.push(new THREE.PointLight(0x69FFFF, 0.3));
      }
    }
    grid.push(row); // Add the row to the grid
  }

  return grid; // Return the generated grid
}

// Function to add grid objects to the scene
function addGridObjectsToScene(grid, scene, spacingX, spacingY, offset) {
  grid.forEach((row, i) => { // Loop through rows in the grid
    row.forEach((obj, j) => { // Loop through objects in each row
      if (obj !== null && obj.position) { // Check if the object exists and has a position property
        // Calculate the position of the object based on its row and column index
        const x = (j * spacingX) - offset;
        const y = 0.1;
        const z = (i * spacingY) - offset;

        // Set the position of the object and add it to the scene
        obj.position.set(x, y, z);
        scene.add(obj);
      }
   });
  })
}
