import { Euler, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InteractiveObject } from "../solar/SolarElement";
import { MathUtils } from "@fils/math";
import gsap from "gsap";

export interface FollowTarget {
  target: InteractiveObject;
  alpha: number;
  isAnimating:boolean;
}

const EASING = {
  animating: .036,
  static: .06
};
const ZOOM_EASING = .06;

const DEFAULT_CAM_LIMITS = {
	minDistance: 24
}

export class CameraManager {
  controls:OrbitControls;
  protected lockedCam:PerspectiveCamera;

  isInteracting:boolean = false;

  cameraTarget: FollowTarget = {
    target: null,
    alpha: .036,
    isAnimating: false
  };

  constructor(public camera:PerspectiveCamera, public dom:HTMLElement) {
    this.lockedCam = camera.clone();

    this.lockedCam.rotation.set(-0.032853461279161805, 0.16572897571806966, 0.005421777962389163);

    this.controls = new OrbitControls(this.lockedCam, dom);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = .096;
    this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    this.controls.enabled = false;
    this.controls.dampingFactor = .096;

    this.controls.addEventListener('start', () => {
      console.log('started interaction');
      this.isInteracting = true;
      this.controls.enableDamping = true;
    });
    this.controls.addEventListener('end', () => {
      console.log('stopped interaction');
      this.isInteracting = false;
      this.controls.enableDamping = false;
    });
  }

  set enableInteraction(value:boolean) {
    this.controls.enabled = value;
  }

  setRotation(euler:Euler) {
    this.lockedCam.rotation.copy(euler);
  }

  followTarget(target:InteractiveObject, autoEnable:boolean=true) {
    gsap.killTweensOf(this.cameraTarget);
    this.cameraTarget.alpha = .036;
    this.cameraTarget.isAnimating = true;
    this.controls.enabled = false;
    gsap.to(this.cameraTarget, {
      alpha: 1,
      delay: 2,
      duration: 2,
      ease: 'expo.inOut',
      onComplete: () => {
        this.cameraTarget.isAnimating = false;
        this.controls.enabled = autoEnable;
        // console.log(autoEnable);
      }
    })
    this.cameraTarget.target = target;
    this.controls.enablePan = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = .05;
    this.controls.minDistance = target.lockedDistance.min;
    this.controls.maxDistance = target.lockedDistance.max;
  }

  releaseCameraTarget() {
    if (!this.cameraTarget.target) return;
    this.cameraTarget.target = null;
    this.controls.autoRotate = false;
    this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    this.controls.maxDistance = Infinity;
    this.cameraTarget.isAnimating = true;
    this.controls.enabled = false;
    gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      overwrite: true,
      duration: 3,
      ease: 'expo.inOut',
      onComplete: () => {
        this.cameraTarget.isAnimating = false;
        this.controls.enabled = true;
      }
    });

    gsap.to(this.lockedCam.position, {
      overwrite: true,
      z: 10000,
      y: 5000,
      x: 0,
      duration: 3,
      ease: 'expo.inOut'
    })
  }

  update() {
    if(this.cameraTarget.target) {
			this.controls.target.lerp(this.cameraTarget.target.position, this.cameraTarget.alpha);
    }

    this.controls.update();

    let easing = this.cameraTarget.isAnimating ? EASING.animating : EASING.static;
    if(this.isInteracting) easing = 1;

    this.camera.position.lerp(this.lockedCam.position, easing);
    this.camera.quaternion.slerp(this.lockedCam.quaternion, easing);
    this.camera.zoom = MathUtils.lerp(this.camera.zoom, this.lockedCam.zoom, ZOOM_EASING);
  }
}