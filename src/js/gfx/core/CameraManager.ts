import { MathUtils } from "@fils/math";
import gsap from "gsap";
import { Euler, Object3D, PerspectiveCamera, Raycaster, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InteractiveObject, SolarElement } from "../solar/SolarElement";

export interface FollowTarget {
  target: InteractiveObject;
  alpha: number;
  isAnimating:boolean;
  orbit:boolean;
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
    isAnimating: false,
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

  /* private updateCamWithSC(sc:ShpericalCoords) {
    const x = sc.radius * Math.cos(sc.angle);
    const y = sc.elevation;
    const z = sc.radius * Math.sin(sc.angle);

    this.lockedCam.position.set(x,y,z);
    this.lockedCam.lookAt(origin);
  } */

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

  /* private updateSC() {
    const p = this.lockedCam.position;

    let x = p.x;
    let y = p.y;
    let z = p.z;

    const R = Math.sqrt(x*x+z*z);
    const angle = Math.atan2(z, x);

    sphericalCoords.angle = angle;
    sphericalCoords.radius = R;
    sphericalCoords.elevation = y;
  } */

  centerView(duration:number=1, ease:string="cubic.out") {
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
        // this.isInteracting = false;
        this.cameraTarget.isAnimating = false;
        // this.controls.enabled = true;
        // console.log('holi9ii')
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
      onUpdate: () => {
        this.controls.enabled = camPos.distanceTo(this.lockedCam.position) < 5;
      }
    })
  }

  followTarget(target:InteractiveObject, followOrbit:boolean=false) {
    this.controls.enabled = false;//followOrbit;
    this.cameraTarget.orbit = followOrbit;
    if(this.cameraTarget.target === target) return;
    gsap.killTweensOf(this.cameraTarget);
    // this.cameraTarget.alpha = .036;
    this.cameraTarget.isAnimating = true;
    // this.controls.enabled = followOrbit;
    const duration = 3;
    const ease = "cubic.out";
    /* dummy.position.copy(target.position).add(target.offsetDesktop);
    gsap.to(this.controls.target, {
      x: dummy.position.x,
      y: dummy.position.y,
      z: dummy.position.z,
      overwrite: true,
      duration,
      ease,
    })
    gsap.to(this.controls, {
      overwrite: true,
      minDistance: target.lockedDistance.min,
      maxDistance: target.lockedDistance.max,
      minPolarAngle: Math.PI/2.5,
      maxPolarAngle: Math.PI/1.5,
      duration,
      ease,
      onComplete: () => {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = .05;
        this.controls.enabled = autoEnable;
      }
    }) */
    this.cameraTarget.target = target;
    // this.controls.enablePan = false;
    // this.controls.autoRotate = true;
    // this.controls.autoRotateSpeed = .05;
    // this.controls.minDistance = target.lockedDistance.min;
    // this.controls.maxDistance = target.lockedDistance.max;
  }

  releaseCameraTarget() {
    if (!this.cameraTarget.target) {
      this.controls.enabled = true;
      return;
    }

    gsap.killTweensOf(this.controls);
    gsap.killTweensOf(this.controls.target);

    this.cameraTarget.target = null;
    this.controls.autoRotate = false;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    // this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    // this.controls.maxDistance = DEFAULT_CAM_LIMITS.maxDistance;
    this.cameraTarget.isAnimating = true;
    // this.controls.enabled = false;
    
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

    const easing = this.cameraTarget.alpha;

    let d = 0;

    //2. orbit controls
    if(this.cameraTarget.target) {
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
      
      this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, minD, easing);
      this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, maxD, easing);

      tmp.copy(dummy.position);
      this.controls.enabled = tmp.distanceTo(this.controls.target) < 1;

      // d += Math.abs(maxD - this.controls.maxDistance)/3;
      // d += Math.abs(minD - this.controls.minDistance)/3;
    } else {
      this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, DEFAULT_CAM_LIMITS.minDistance, easing);
      this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, DEFAULT_CAM_LIMITS.maxDistance, easing);

      // dummy.position.copy(origin);

      // d += Math.abs(DEFAULT_CAM_LIMITS.maxDistance - this.controls.maxDistance)/3;
      // d += Math.abs(DEFAULT_CAM_LIMITS.minDistance - this.controls.minDistance)/3;
    }

    // this.controls.target.lerp(dummy.position, easing);

    tmp.copy(this.cameraTarget.target ? dummy.position : origin);
    // d += tmp.distanceTo(this.controls.target)/3;
    this.controls.enabled = tmp.distanceTo(this.controls.target) < 1;

    //zoom?
    if(Math.abs(this.zoom) > 0) {
      this.zoomBy(this.zoom);
    }

    this.controls.update();

    //3. add offset
    offset.lerp(this.cameraTarget.target ? this.cameraTarget.target.offsetDesktop : origin, easing);
    this.lockedCam.translateX(offset.x);
    this.lockedCam.translateY(offset.y);

    //4. copy transforms to camera
    this.camera.position.copy(this.lockedCam.position);
    this.camera.quaternion.copy(this.lockedCam.quaternion);
    // this.camera.zoom = MathUtils.lerp(this.camera.zoom, this.lockedCam.zoom, ZOOM_EASING);

    // this.updateSC();
  }
}