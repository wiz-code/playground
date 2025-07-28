import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

import { createMaze } from './terrain';
import { maze } from './data';

let camera;
let scene;
let renderer;
let clock;
let controls;

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

  /* const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
	directionalLight.position.set( 1, 4, 3 ).multiplyScalar( 3 );
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.setScalar( 2048 );
	directionalLight.shadow.bias = - 1e-4;
	directionalLight.shadow.normalBias = 1e-4;
	scene.add( directionalLight ); */

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

  // objects
  const terrain = createMaze(maze);
  scene.add(terrain);

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
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}
