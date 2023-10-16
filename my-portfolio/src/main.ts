import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Setup THREE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Setup Renderer
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

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

// Scene Additions
scene.add(boxMesh)
scene.add(planeMesh);
scene.add(light);
scene.add(light2);
scene.add(light3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2.1;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();