import { MathUtils } from "@fils/math";
import gsap from "gsap";
import { Euler, Object3D, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InteractiveObject } from "../solar/SolarElement";

export interface FollowTarget {
  target: InteractiveObject;
  alpha: number;
  isAnimating:boolean;
}

const EASING = {
  animating: .036,
  static: .16
};
const ZOOM_EASING = .06;

const ZOOM_SPEED = {
  min: 1,
  max: 500
};

const DEFAULT_CAM_LIMITS = {
	minDistance: 24,
  maxDistance: 300000
}

const tmp = new Vector3();
const tmp2 = new Vector3();
const origin = new Vector3();
const cameraDirection = new Vector3();

export type ShpericalCoords = {
    radius:number;
    angle:number;
    elevation:number;
}

const sphericalCoords:ShpericalCoords = {
    radius: 0,
    angle: 0,
    elevation: 0
}

export class CameraManager {
  controls:OrbitControls;
  protected lockedCam:PerspectiveCamera;

  isInteracting:boolean = false;

  zoom:number = 0;

  cameraTarget: FollowTarget = {
    target: null,
    alpha: .036,
    isAnimating: false
  };

  constructor(public camera:PerspectiveCamera, public dom:HTMLElement) {
    this.lockedCam = camera.clone();

    this.controls = new OrbitControls(this.lockedCam, dom);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = .096;
    this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    this.controls.maxDistance = DEFAULT_CAM_LIMITS.maxDistance;
    this.controls.enabled = false;
    this.controls.enablePan = false;
    this.controls.dampingFactor = .096;

    this.controls.addEventListener('start', () => {
      // console.log('started interaction');
      this.isInteracting = true;
      this.controls.enableDamping = true;
    });
    this.controls.addEventListener('end', () => {
      // console.log('stopped interaction');
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

  private updateCamWithSC(sc:ShpericalCoords) {
    const x = sc.radius * Math.cos(sc.angle);
    const y = sc.elevation;
    const z = sc.radius * Math.sin(sc.angle);

    this.lockedCam.position.set(x,y,z);
    this.lockedCam.lookAt(origin);
  }

  zoomBy(d:number) {
    const dist = this.controls.getDistance();
    const speed = MathUtils.lerp(
      ZOOM_SPEED.min,
      ZOOM_SPEED.max,
      MathUtils.smoothstep(0, 10000, dist)
    );
    let d2 = speed * d;
    if(dist + d2 > DEFAULT_CAM_LIMITS.maxDistance) {
      d2 = DEFAULT_CAM_LIMITS.maxDistance - dist;
    } else if (dist + d2 < DEFAULT_CAM_LIMITS.minDistance) {
      d2 = DEFAULT_CAM_LIMITS.minDistance - dist;
    }
    this.lockedCam.translateZ(d2);
    // console.log(dist);
    // if(dist > DEFAULT_CAM_LIMITS.maxDistance) {
    //   sphericalCoords.radius = DEFAULT_CAM_LIMITS.maxDistance;
    //   this.updateCamWithSC(sphericalCoords);
    // } else if(d < DEFAULT_CAM_LIMITS.maxDistance) {
    //   sphericalCoords.radius = DEFAULT_CAM_LIMITS.maxDistance;
    //   this.updateCamWithSC(sphericalCoords);
    // }
  }

  private updateSC() {
    const p = this.lockedCam.position;

    let x = p.x;
    let y = p.y;
    let z = p.z;

    const R = Math.sqrt(x*x+z*z);
    const angle = Math.atan2(z, x);

    sphericalCoords.angle = angle;
    sphericalCoords.radius = R;
    sphericalCoords.elevation = y;
  }

  centerView(duration:number=1, ease:string="cubic.out") {
    this.controls.enabled = false;
    this.isInteracting = true;
    gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      overwrite: true,
      duration,
      ease,
      onComplete: () => {
        this.isInteracting = false;
        this.cameraTarget.isAnimating = false;
        this.controls.enabled = true;
        // console.log('holi9ii')
      }
    });

    gsap.to(this.lockedCam.position, {
      overwrite: true,
      z: 10000,
      y: 5000,
      x: 0,
      duration,
      ease
    })
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
      overwrite: true,
      onComplete: () => {
        this.cameraTarget.isAnimating = false;
        this.controls.enabled = autoEnable;
        // console.log(autoEnable);
      }
    })
    this.cameraTarget.target = target;
    // this.controls.enablePan = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = .05;
    this.controls.minDistance = target.lockedDistance.min;
    this.controls.maxDistance = target.lockedDistance.max;
  }

  releaseCameraTarget() {
    if (!this.cameraTarget.target) {
      this.controls.enabled = true;
      return;
    }
    this.cameraTarget.target = null;
    this.controls.autoRotate = false;
    this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    this.controls.maxDistance = DEFAULT_CAM_LIMITS.maxDistance;
    this.cameraTarget.isAnimating = true;
    this.controls.enabled = false;
    
    this.centerView(3, "expo.inOut");
  }

  getNormalizedScreenCoords(obj:Object3D, target:Vector3) {
    // Get world position and project
    obj.getWorldPosition(tmp);
    const distance = tmp.distanceTo(this.camera.position);

    this.camera.getWorldDirection(cameraDirection);
    tmp2.copy(tmp).sub(this.camera.position);
    const isBehindCamera = tmp2.dot(cameraDirection) < 0;

    tmp.project(this.camera);

    // Convert from NDC [-1, 1] to [0, 1] range
    const screenX = (tmp.x * 0.5 + 0.5);
    const screenY = (-tmp.y * 0.5 + 0.5); // Note the negation for Y

    target.set(screenX, screenY, isBehindCamera ? -1000 : distance);
  }

  update() {
    if(this.cameraTarget.target) {
			this.controls.target.lerp(this.cameraTarget.target.position, this.cameraTarget.alpha);
    }

    if(Math.abs(this.zoom) > 0) {
      this.zoomBy(this.zoom);
    }

    this.controls.update();

    let easing = this.cameraTarget.isAnimating ? EASING.animating : EASING.static;
    if(this.isInteracting) easing = 1;

    this.camera.position.lerp(this.lockedCam.position, easing);
    this.camera.quaternion.slerp(this.lockedCam.quaternion, easing);
    this.camera.zoom = MathUtils.lerp(this.camera.zoom, this.lockedCam.zoom, ZOOM_EASING);

    this.updateSC();
  }
}