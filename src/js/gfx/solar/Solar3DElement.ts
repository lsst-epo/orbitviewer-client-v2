import { Box3, Camera, Mesh, Object3D, Vector3 } from "three";
import { GLOBALS } from "../../core/Globals";

export function rectsIntersect(rect1:DOMRect, rect2:DOMRect) {
    return !(rect1.right < rect2.left || 
             rect2.right < rect1.left || 
             rect1.bottom < rect2.top || 
             rect2.bottom < rect1.top);
}

export interface CameraLock {
	min: number;
	max: number;
}

const tempBox = new Box3();

const D_THRESHOLD = 2000;

const min = new Vector3(Infinity, Infinity, Infinity);
const max = new Vector3(-Infinity, -Infinity, -Infinity);

const vertex = new Vector3();
const tmp = new Vector3();

export class Solar3DElement extends Object3D {
  needsSSBoxUpdate:boolean = true;
  boundingBox:Box3 = new Box3();

  distanceToCamara:number;

  // selected:boolean;
  target:Object3D;
  lockedObjectDistance:CameraLock;
  lockedOrbitDistance:CameraLock;
  offsetObject:Vector3;
  offsetOrbit:Vector3;

  rect:DOMRect = new DOMRect();
  orbitRect:DOMRect = new DOMRect();

  constructor() {
    super();
  }

  protected setBox(parent:Object3D) {
    tempBox.setFromObject(this);
  }

  computeSSBoundingBox(camera:Camera) {
    let minX = 1, minY = 1, maxX = -1, maxY = -1;
    let hasVisibleVertices = false;

    this.traverse(obj => {
      if(obj.type === 'Mesh') {
        const mesh = obj as Mesh;
        const vertices = mesh.geometry.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
          vertex.set(vertices.array[i*3], vertices.array[i*3+1], vertices.array[i*3+2]).applyMatrix4(mesh.matrix).applyMatrix4(this.matrix);
          vertex.project(camera);
          // Skip vertices behind camera
          if (vertex.z < 1) {
              hasVisibleVertices = true;
              minX = Math.min(minX, vertex.x);
              minY = Math.min(minY, vertex.y);
              maxX = Math.max(maxX, vertex.x);
              maxY = Math.max(maxY, vertex.y);
          }
        }
      }
    });

    if (hasVisibleVertices) {
        this.boundingBox.min.set(minX * 0.5 + 0.5, -maxY * 0.5 + 0.5, 0);
        this.boundingBox.max.set(maxX * 0.5 + 0.5, -minY * 0.5 + 0.5, 0);
        const b = this.boundingBox;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const x1 = b.min.x * w;
        const x2 = b.max.x * w;
        const y1 = b.min.y * h;
        const y2 = b.max.y * h;
        const bw = (x2 - x1);
        const bh = (y2 - y1);
        this.rect.x = x1;
        this.rect.y = y1;
        this.rect.width = bw;
        this.rect.height = bh;
        
    } else {
        // Object completely behind camera
        this.boundingBox.set(min, max);
    }
  }

  updateSSBbox(camera:Camera) {
    if(camera.position.distanceTo(this.position) > D_THRESHOLD) {
      this.boundingBox.set(min, max);
      return;
    }
    this.computeSSBoundingBox(camera);
  }

  isBehindCamera() {
    this.getWorldPosition(tmp);
    tmp.project(GLOBALS.viewer.camera);

    return tmp.z < 0;
  }

  isCollider():boolean {
    if(this.isBehindCamera()) return false;
    const b = this.boundingBox;
    if(b.min.z === Infinity) return false;
    return true;
  }

  updateDistanceToCamera() {
    if(this.isBehindCamera()) return;
    this.distanceToCamara = GLOBALS.viewer.camera.position.distanceTo(this.position);
  }
}