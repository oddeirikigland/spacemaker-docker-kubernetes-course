import { service } from "./service";

let scene,
  tiles = [];

let tileSizeX = 100;
let tileSizeY = 50;
let borderX = 10;
let borderY = 10;

let maxSizeX = 200;

function run() {
  let renderer, camera, controls;

  init();
  animate();

  function init() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 400;
    camera.position.x = 600;
    camera.position.y = 600;
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera);
  }

  function clearScene() {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }

  function updateScene(tiles) {
    let tileX = 0,
      tileY = 0;

    clearScene();

    const gridHelper = new THREE.GridHelper(tileSizeX, 40, 0x0000ff, 0x808080);
    gridHelper.geometry.rotateX(Math.PI / 2);
    gridHelper.position.x = tileSizeX / 2;
    gridHelper.position.y = tileSizeX / 2;
    scene.add(gridHelper);

    for (let tile of tiles) {
      for (let building of tile) {
        let { x, y, width, depth, height, rotation } = building;

        if (width < 0) width = 1;
        if (depth < 0) depth = 1;
        if (height < 0) height = 1;
        if (width + x > tileSizeX) {
          width = tileSizeX - x;
        }
        if (depth + y > tileSizeY) {
          depth = tileSizeY - y;
        }

        const geometry = new THREE.BoxBufferGeometry(width, depth, height);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xcccccc)
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = tileX + (x % tileSizeX) + width / 2;
        mesh.position.y = tileY + (y % tileSizeY) + depth / 2;
        mesh.position.z = height / 2;

        mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotation);

        scene.add(mesh);
      }

      tileX += tileSizeX + borderX;
      if (tileX + tileSizeX > maxSizeX) {
        tileX = 0;
        tileY += tileSizeY + borderY;
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    updateScene(tiles);
    controls.update();

    renderer.render(scene, camera);
  }
}

run();

function callService() {
  service()
    .then(data => (tiles = data))
    .then(() => console.log("update"));
}
callService();
setTimeout(callService, 5000);