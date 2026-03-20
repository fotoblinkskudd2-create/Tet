import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class VRViveExperience {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controllers: THREE.XRTargetRaySpace[] = [];
  private controllerGrips: THREE.XRGripSpace[] = [];
  private raycaster: THREE.Raycaster;
  private tmpMatrix: THREE.Matrix4;
  private interactiveObjects: THREE.Object3D[] = [];
  private selectedObject: THREE.Object3D | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.6, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    document.body.appendChild(this.renderer.domElement);

    const vrButton = VRButton.createButton(this.renderer);
    vrButton.style.display = 'none';
    document.body.appendChild(vrButton);
    
    const enterVrButton = document.getElementById('enter-vr') as HTMLButtonElement;
    if ('xr' in navigator && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          enterVrButton.style.display = 'block';
          enterVrButton.addEventListener('click', () => vrButton.click());
        }
      });
    }

    this.raycaster = new THREE.Raycaster();
    this.tmpMatrix = new THREE.Matrix4();

    this.setupLighting();
    this.createEnvironment();
    this.createInteractiveObjects();
    this.setupControllers();
    this.setupDesktopControls();
    this.setupEventListeners();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4dc8ff, 1, 20);
    pointLight1.position.set(-3, 3, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 1, 20);
    pointLight2.position.set(3, 3, 0);
    this.scene.add(pointLight2);
  }

  private createEnvironment(): void {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d2d44,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gridHelper = new THREE.GridHelper(50, 50, 0x4dc8ff, 0x333355);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    for (let i = 0; i < 20; i++) {
      const height = Math.random() * 3 + 1;
      const geometry = new THREE.BoxGeometry(0.5, height, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x4dc8ff : 0xff6b9d,
        emissive: Math.random() > 0.5 ? 0x4dc8ff : 0xff6b9d,
        emissiveIntensity: 0.2
      });
      const pillar = new THREE.Mesh(geometry, material);
      pillar.position.set(
        (Math.random() - 0.5) * 20,
        height / 2,
        (Math.random() - 0.5) * 20
      );
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
    }
  }

  private createInteractiveObjects(): void {
    const geometries = [
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.TorusGeometry(0.12, 0.04, 16, 32),
      new THREE.OctahedronGeometry(0.12)
    ];

    const colors = [0x4dc8ff, 0xff6b9d, 0xffd93d, 0x6bcb77];

    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        1 + Math.random() * 0.5,
        (Math.random() - 0.5) * 8
      );
      mesh.userData['originalColor'] = colors[i % colors.length];
      mesh.userData['isInteractive'] = true;
      mesh.castShadow = true;
      this.interactiveObjects.push(mesh);
      this.scene.add(mesh);
    }
  }

  private setupControllers(): void {
    const controllerModelFactory = new XRControllerModelFactory();

    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.addEventListener('selectstart', () => this.onSelectStart(controller));
      controller.addEventListener('selectend', () => this.onSelectEnd(controller));
      controller.addEventListener('squeezestart', () => this.onSqueezeStart(controller));
      controller.addEventListener('squeezeend', () => this.onSqueezeEnd(controller));
      this.scene.add(controller);
      this.controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      this.scene.add(grip);
      this.controllerGrips.push(grip);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4dc8ff,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.scale.z = 5;
      controller.add(line);
    }
  }

  private setupDesktopControls(): void {
    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.target.set(0, 1.5, 0);
    orbitControls.enablePan = false;
    orbitControls.enableDamping = true;
    orbitControls.update();
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onSelectStart(controller: THREE.XRTargetRaySpace): void {
    this.tmpMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tmpMatrix);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
    if (intersects.length > 0) {
      this.selectedObject = intersects[0].object;
      const material = (this.selectedObject as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8;
    }
  }

  private onSelectEnd(_controller: THREE.XRTargetRaySpace): void {
    if (this.selectedObject) {
      const material = (this.selectedObject as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3;
      this.selectedObject = null;
    }
  }

  private onSqueezeStart(controller: THREE.XRTargetRaySpace): void {
    this.tmpMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tmpMatrix);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.scene.remove(object);
      const index = this.interactiveObjects.indexOf(object);
      if (index > -1) this.interactiveObjects.splice(index, 1);
    }
  }

  private onSqueezeEnd(_controller: THREE.XRTargetRaySpace): void {}

  private handleController(controller: THREE.XRTargetRaySpace): void {
    this.tmpMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tmpMatrix);

    const desktopIntersects = this.raycaster.intersectObjects(this.interactiveObjects);
    if (desktopIntersects.length > 0) {
      const object = desktopIntersects[0].object as THREE.Mesh;
      const material = object.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  }

  public animate(): void {
    this.renderer.setAnimationLoop((_time, _frame) => this.render());
  }

  private render(): void {
    const time = Date.now() * 0.001;

    this.interactiveObjects.forEach((obj, i) => {
      obj.position.y += Math.sin(time * 2 + i) * 0.001;
      obj.rotation.y += 0.01;
    });

    this.controllers.forEach((controller) => this.handleController(controller));

    if (!this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

const app = new VRViveExperience();
app.animate();