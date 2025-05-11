import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {
  computeBoundsTree,
  MeshBVH,
  StaticGeometryGenerator,
} from 'three-mesh-bvh';

import { createMaze, createGround } from './terrain';
import { maze1, maze2, ground1 } from './data';

let camera;
let scene;
let renderer;
let clock;
let controls;
let object;
let sphere;
let collider;
let mazeMesh;
const position = new THREE.Vector3();

// THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;

const matrix = new THREE.Matrix4();

let count = 0;

init();
animate();

function init() {
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    2000,
  );
  camera.position.set(-1, 1, 1).normalize().multiplyScalar(10);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x999999);

  // lights
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 3);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight.position.set(1, 4, 3).multiplyScalar(3);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.shadow.bias = -1e-4;
  directionalLight.shadow.normalBias = 1e-4;
  scene.add(directionalLight);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // controls
  /* controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 5;
	controls.maxDistance = 75; */
  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 30;
  controls.lookSpeed = 0.2;

  let sphereGeom = new THREE.SphereGeometry(2, 8, 4);
  sphereGeom = new THREE.WireframeGeometry(sphereGeom);
  sphere = new THREE.LineSegments(sphereGeom);
  collider = new THREE.Sphere(new THREE.Vector3(), 2);
  scene.add(sphere);

  // objects
  const terrain1 = createMaze(maze1);
  const terrain2 = createMaze(maze2);
  const terrain3 = createGround(ground1[0]);

  const group = new THREE.Group();
  // group.add(terrain1, terrain2);
  group.add(terrain3.object);

  group.position.z = 100;

  const mazeMesh1 = terrain1.getObjectByName('surface');
  const mazeMesh2 = terrain2.getObjectByName('surface');

  terrain2.position.x = 50;

  const geom1 = mazeMesh1.geometry.clone();
  const geom2 = mazeMesh2.geometry.clone();
  geom1.rotateZ((15 / 360) * Math.PI * 2);
  geom1.rotateZ((30 / 360) * Math.PI * 2);
  geom2.translate(50, 0, 0);

  /* const mazeGeom = mergeGeometries([geom1, geom2]);
  mazeMesh = new THREE.Mesh(
    mazeGeom,
    new THREE.MeshBasicMaterial({
      wireframe: true,
    })
  );
  mazeMesh.boundsTree = new MeshBVH(mazeGeom);

  mazeMesh.position.z = 100; */
  /// ////
  mazeMesh = new THREE.Mesh(
    terrain3.bvh,
    new THREE.MeshBasicMaterial({
      // color: 0xffffff,
      wireframe: true,
    }),
  );
  mazeMesh.boundsTree = new MeshBVH(terrain3.bvh);
  /// /////

  scene.add(group);
  scene.add(mazeMesh);

  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x4caf50),
  });

  geometry.boundsTree = new MeshBVH(geometry);
  object = new THREE.Mesh(geometry, material);
  object.position.x = 5;
  // geometry.computeBoundsTree();
  // scene.add(object);

  // helpers
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
  // const mesh = terrain.getObjectByName('surface');
  // const vertexNormalHelper = new VertexNormalsHelper( mesh, 3, 0xff0000 );
  // scene.add(vertexNormalHelper);

  window.addEventListener('resize', onWindowResize);
  onWindowResize();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  count += 1;

  requestAnimationFrame(animate);

  if (count % 2 !== 0) {
    return;
  }

  const delta = clock.getDelta();
  controls.update(delta);

  // object.updateMatrixWorld();

  sphere.position.copy(camera.position);
  sphere.position.z -= 10;

  // sphere.updateMatrixWorld();

  matrix.copy(mazeMesh.matrixWorld).invert().multiply(sphere.matrixWorld);
  // matrix.copy(object.matrixWorld).invert().multiply(sphere.matrixWorld);

  // collider.center.copy(sphere.position);
  collider.makeEmpty().applyMatrix4(matrix);
  collider.radius = 2;

  // const hit = object.geometry.boundsTree.intersectsSphere(collider);
  const hit = mazeMesh.boundsTree.intersectsSphere(collider);
  console.log(hit);

  renderer.render(scene, camera);
}
