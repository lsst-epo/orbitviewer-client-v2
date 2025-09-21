import { MathUtils } from "@fils/math";
import gsap from "gsap";
import { Euler, Object3D, PerspectiveCamera, Raycaster, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Solar3DElement } from "../solar/Solar3DElement";
import { SolarElement } from "../solar/SolarElement";
import { OBJECT_PATH_ALPHA } from "../solar/EllipticalPath";
import { GLOBALS } from "../../core/Globals";

export interface FollowTarget {
  target: Solar3DElement;
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
  maxDistance: 3000000
}

const tmp = new Vector3();
const tmp2 = new Vector3();
const origin = new Vector3();
const cameraDirection = new Vector3();

const offset = new Vector3();
const offsetBackup = new Vector3();
const camPos = new Vector3();

const dummy = new Object3D();

const raycaster = new Raycaster();
export const camOcluders = [];

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

const defaultPos = new Vector3(0, 5000, 10000);

export interface DOMFrame {
  element: HTMLElement,
  rect: DOMRect
}

export const OBJECT_FRAME:DOMFrame = {
  element: null,
  rect: null
}

export class CameraManager {
  controls:OrbitControls;
  protected lockedCam:PerspectiveCamera;
  isAnimating:boolean=false;
  _isCapturing:boolean=false;

  zoom:number = 0;

  cameraTarget: FollowTarget = {
    target: null,
    alpha: .036,
    zoomLevel: 0,
    orbit: false
  };
  
  isZooming:boolean = false;
  _onTargetWheel;
  _onTouchStart;
  _onTouchMove;
  _onTouchEnd;
  anchorPinchDistance:number;
  isPinching:boolean = false;

  constructor(public camera:PerspectiveCamera, public dom:HTMLElement) {
    this.lockedCam = camera.clone();

    this.controls = new OrbitControls(this.lockedCam, dom);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .096;
    this.controls.minDistance = DEFAULT_CAM_LIMITS.minDistance;
    this.controls.maxDistance = DEFAULT_CAM_LIMITS.maxDistance;
    this.controls.enabled = false;
    this.controls.enablePan = false;
    this.controls.dampingFactor = .096;

    this._onTargetWheel = this.onTargetWheel.bind(this);
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);

    dom.addEventListener('wheel', this._onTargetWheel);
    dom.addEventListener('touchstart', this._onTouchStart);
    dom.addEventListener('touchmove', this._onTouchMove);
    dom.addEventListener('touchend', this._onTouchEnd);
    dom.addEventListener('touchcancel', this._onTouchEnd);
  }

  onTargetWheel(event:WheelEvent) {
    if(!this.isTarget) return;
    event.preventDefault();
    this.zoom = event.deltaY * .1;
    this.isZooming = true;
  }

  onTouchStart(e:TouchEvent) {
    if(!this.isTarget) return;
    if (e.touches.length === 2) {
      this.anchorPinchDistance = getDistance(e.touches[0], e.touches[1]);
      this.isPinching = true;
    } else {
      this.isPinching = false;
      this.zoom = 0;
      this.isZooming = false;
    }
  }

  onTouchMove(e:TouchEvent) {
    if(!this.isTarget) return;
    if(!this.isPinching) return;
    e.preventDefault();
    if (e.touches.length === 2) {
      this.controls.enabled = false;
      const d = getDistance(e.touches[0], e.touches[1]) - this.anchorPinchDistance;
      this.zoom = -d;
      this.isZooming = true;
    }
  }

  onTouchEnd(e:TouchEvent) {
    if(!this.isTarget) return;
    this.isPinching = false;
    this.controls.enabled = true;
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

  set isCapturing(value:boolean) {
    if(value) {
      offsetBackup.copy(offset);
      offset.copy(origin);
    } else {
      offset.copy(offsetBackup);
    }
    this._isCapturing = value;
  }

  get isCapturing():boolean {
    return this._isCapturing;
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
      if(this.isZooming) {
        this.zoom = 0;
        this.isZooming = false;
      }
    }
  }

  landingMode() {
    this.lockedCam.position.set(0, 1500, 4000);
  }

  centerView(duration:number=1, ease:string="cubic.out") {
    if(this.isTarget) {
      this.cameraTarget.zoomLevel = DEFAULT_TARGET_ZOOM;
      return;
    }
    this.controls.enabled = false;
    this.isPinching = false;
    this.isZooming = false;
    gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      overwrite: true,
      duration,
      ease,
      onComplete: () => {
        // this.controls.enabled = true;
      }
    });

    camPos.set(0, 5000, 10000);

    gsap.to(this.lockedCam.position, {
      overwrite: true,
      z: defaultPos.x,
      y: defaultPos.y,
      x: defaultPos.z,
      duration,
      ease,
    })
  }

  isCustomCamera():boolean {
    const d = tmp.copy(this.lockedCam.position).sub(defaultPos).length();

    return d > 100;
  }

  followTarget(target:Solar3DElement, followOrbit:boolean=false) {
    gsap.killTweensOf(this.lockedCam.position);
    gsap.killTweensOf(this.controls.target);

    const t = target as SolarElement;
    if(t.orbitPath) {
      if(followOrbit) t.selected = true;
      else t.blur(OBJECT_PATH_ALPHA);
    }

    this.controls.enableZoom = false;

    this.controls.enabled = false;//followOrbit;
    this.cameraTarget.orbit = followOrbit;
    this.cameraTarget.zoomLevel = DEFAULT_TARGET_ZOOM;
    this.cameraTarget.target = target;
  }

  releaseCameraTarget() {
    this.controls.autoRotate = false;
    
    if (!this.isTarget) {
      this.centerView(2, "cubic.inOut");
      this.controls.enableZoom = true;
      return;
    }

    gsap.killTweensOf(this.controls);
    gsap.killTweensOf(this.controls.target);
    
    this.controls.enableZoom = true;

    // offset.copy(origin);

    this.cameraTarget.target = null;
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

  animateCameraFromURLParams(p:string, q:string) {
    if(this.cameraTarget.target) return;
    // console.log('HAHSDHAHDASH')
    this.controls.enabled = false;
    this.isAnimating = true;
    const ease = 'expo.inOut';
    const duration = 2;
    const pp = p.split("_");
    const qp = q.split("_");
    gsap.to(this.lockedCam.position, {
      overwrite: true,
      x: parseFloat(pp[0]),
      y: parseFloat(pp[1]),
      z: parseFloat(pp[2]),
      ease,
      duration,
      onComplete: () => {
        this.controls.enabled = true;
        this.isAnimating = false;
      }
    })
    gsap.to(this.lockedCam.quaternion, {
      overwrite: true,
      x: parseFloat(qp[0]),
      y: parseFloat(qp[1]),
      z: parseFloat(qp[2]),
      w: parseFloat(qp[3]),
      ease,
      duration
    })
  }

  update() {
    if(!this.isAnimating) {
      // 1. remove offset
      if(!this.isCapturing) {
        this.lockedCam.translateX(-offset.x);
        this.lockedCam.translateY(-offset.y);
      }
      // if(this.isTarget) this.lockedCam.translateZ(-offset.z);

      const easing = this.cameraTarget.alpha;

      const t = this.cameraTarget;

      //2. orbit controls
      if(this.isTarget) {
        let minD, maxD;
        const t2 = t.target as SolarElement;

        const dist = !t.orbit ? t2.lockedObjectDistance : t2.lockedOrbitDistance;
        minD = dist.min;
        maxD = dist.max;

        // const target = t.target;
        dummy.position.copy(t.orbit ? t2.orbitPath.ellipse.position : t2.position);
        this.controls.target.lerp(dummy.position, easing);

        const D = MathUtils.lerp(minD, maxD, 1-t.zoomLevel);

        this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, D, easing);
        this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, D, easing);
      } else {
        this.controls.minDistance = MathUtils.lerp(this.controls.minDistance, DEFAULT_CAM_LIMITS.minDistance, easing);
        this.controls.maxDistance = MathUtils.lerp(this.controls.maxDistance, DEFAULT_CAM_LIMITS.maxDistance, easing);
      }

      tmp.copy(this.isTarget ? dummy.position : origin);
      // d += tmp.distanceTo(this.controls.target)/3;
      this.controls.enabled = tmp.distanceTo(this.controls.target) < .5 && !this.isPinching;

      this.controls.update();

      //zoom
      if(Math.abs(this.zoom) > 0) {
        this.zoomBy(this.zoom);
      }

      //3. add offset
      let off = origin;
      if(this.isTarget && !GLOBALS.forceCenterPlanet) {
        off = t.orbit ? t.target.offsetOrbit : t.target.offsetObject;

        // adaptive screen-space offset
        /* const R = OBJECT_FRAME.rect;
        if(R) {
          tmp.copy(origin);
          if(t.orbit) {
            //to do
          } else {
            if(t.target.rect) {
              const r = t.target.rect;
              const tx = R.x + R.width/2;
              const ty = R.y + R.height/2;
              const dx = (tx - r.x) / window.innerWidth;
              const dy = (ty - r.y) / window.innerHeight;
              tmp.copy(dummy.position);
              tmp.project(this.lockedCam);
              tmp.x = (tmp.x * 0.5 + 0.5) + dx;
              tmp.y = (-tmp.y * 0.5 + 0.5) + dy;
              tmp.z = dummy.position.z;
              tmp.unproject(this.lockedCam);
              tmp2.copy(dummy.position).sub(tmp);
            }
          }
          // off = t.orbit ? t.target.offsetOrbit : t.target.offsetObject;
          // off = tmp;
        } */
      }

      if(this._isCapturing) offset.copy(origin);

      offset.lerp(off, easing);
      this.lockedCam.translateX(offset.x);
      this.lockedCam.translateY(offset.y);
      
    }

    //4. copy transforms to camera
    this.camera.position.copy(this.lockedCam.position);
    this.camera.quaternion.copy(this.lockedCam.quaternion);

    // this.updateSC();
  }
}