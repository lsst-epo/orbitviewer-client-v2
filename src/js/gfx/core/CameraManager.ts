import { MathUtils } from "@fils/math";
import gsap from "gsap";
import { Euler, Object3D, PerspectiveCamera, Raycaster, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InteractiveObject, SolarElement } from "../solar/SolarElement";

export interface FollowTarget {
  target: InteractiveObject;
  alpha: number;
  zoomLevel:number;
  orbit:boolean;
}

const ZOOM_SPEED = {
  min: 1,
  max: 500
};

const DEFAULT_TARGET_ZOOM = .5;

export const DEFAULT_CAM_LIMITS = {
	minDistance: 24,
  maxDistance: 1500000
}

const tmp = new Vector3();
const tmp2 = new Vector3();
const origin = new Vector3();
const cameraDirection = new Vector3();

const offset = new Vector3();
const camPos = new Vector3();

const dummy = new Object3D();

const raycaster = new Raycaster();
export const camOcluders = [];

/* export type ShpericalCoords = {
    radius:number;
    angle:number;
    elevation:number;
}

const sphericalCoords:ShpericalCoords = {
    radius: 0,
    angle: 0,
    elevation: 0
} */

export class CameraManager {
  controls:OrbitControls;
  protected lockedCam:PerspectiveCamera;

  isInteracting:boolean = false;
  lastInteracted:number = 0;

  zoom:number = 0;

  cameraTarget: FollowTarget = {
    target: null,
    alpha: .036,
    zoomLevel: 0,
    orbit: false,
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
      // this.controls.enableDamping = false;
      this.lastInteracted = Date.now();
    });
  }

  set enableInteraction(value:boolean) {
    this.controls.enabled = value;
  }

  setRotation(euler:Euler) {
    this.lockedCam.rotation.copy(euler);
  }

  get isTarget():boolean {
    return this.cameraTarget.target !== null;
  }

  zoomBy(d:number) {
    if(!this.isTarget) {
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
    } else {
      this.cameraTarget.zoomLevel = MathUtils.clamp(this.cameraTarget.zoomLevel - d *.02, 0, 1);
    }
  }

  centerView(duration:number=1, ease:string="cubic.out") {
    if(this.isTarget) {
      return this.cameraTarget.zoomLevel = DEFAULT_TARGET_ZOOM;
    }
    this.controls.enabled = false;
    // this.isInteracting = true;
    gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      overwrite: true,
      duration,
      ease,
      onComplete: () => {
        
      }
    });

    camPos.set(0, 5000, 10000);

    gsap.to(this.lockedCam.position, {
      overwrite: true,
      z: camPos.x,
      y: camPos.y,
      x: camPos.z,
      duration,
      ease,
    })
  }

  followTarget(target:InteractiveObject, followOrbit:boolean=false) {
    gsap.killTweensOf(this.lockedCam.position);
    gsap.killTweensOf(this.controls.target);

    this.controls.enabled = false;//followOrbit;
    this.cameraTarget.orbit = followOrbit;
    this.cameraTarget.zoomLevel = DEFAULT_TARGET_ZOOM;
    this.cameraTarget.target = target;
  }

  releaseCameraTarget() {
    if (!this.cameraTarget.target) {
      this.controls.enabled = true;
      return;
    }

    gsap.killTweensOf(this.controls);
    gsap.killTweensOf(this.controls.target);

    offset.copy(origin);

    this.cameraTarget.target = null;
    this.controls.autoRotate = false;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    
    this.centerView(3, "expo.inOut");
  }

  /**
   * Gets x,y normalized screen coordinates of object in range [0..1]
   * Plus distance to camera and returns if whether is behind the sun (true or not)
   * @param obj 
   * @param target 
   */
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
    // 1. remove offset
    this.lockedCam.translateX(-offset.x);
    this.lockedCam.translateY(-offset.y);
    if(this.isTarget) this.lockedCam.translateZ(-offset.z);

    const easing = this.cameraTarget.alpha;

    //2. orbit controls
    if(this.isTarget) {
      let target, minD, maxD;
      if(this.cameraTarget.orbit) {
        const t = this.cameraTarget.target as SolarElement;
        if(t.orbitPath) {
          target = t.orbitPath.ellipse;
          tmp.copy(t.orbitPath.boundingBox.max).sub(t.orbitPath.boundingBox.min);
        } else {
          target = this.cameraTarget.target;
        }
      } else {
        target = this.cameraTarget.target;
      }

      if(target === this.cameraTarget.target) {
        minD = target.lockedDistance.min;
        maxD = target.lockedDistance.max
        // console.log(minD, maxD);
      } else {
        minD = tmp.length() * .75;
        maxD = tmp.length() * 2;
      }
      // const target = this.cameraTarget.target;
      dummy.position.copy(target.position);
			this.controls.target.lerp(dummy.position, easing);

      const D = MathUtils.lerp(minD, maxD, 1-this.cameraTarget.zoomLevel);
      
      this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, D, easing);
      this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, D, easing);
    } else {
      this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, DEFAULT_CAM_LIMITS.minDistance, easing);
      this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, DEFAULT_CAM_LIMITS.maxDistance, easing);
    }

    tmp.copy(this.isTarget ? dummy.position : origin);
    // d += tmp.distanceTo(this.controls.target)/3;
    this.controls.enabled = tmp.distanceTo(this.controls.target) < 1;

    this.controls.update();

    //zoom
    if(Math.abs(this.zoom) > 0) {
      this.zoomBy(this.zoom);
    }

    //3. add offset
    offset.lerp(this.cameraTarget.target ? this.cameraTarget.target.offsetDesktop : origin, easing);
    this.lockedCam.translateX(offset.x);
    this.lockedCam.translateY(offset.y);

    //4. copy transforms to camera
    this.camera.position.copy(this.lockedCam.position);
    this.camera.quaternion.copy(this.lockedCam.quaternion);

    // this.updateSC();
  }
}