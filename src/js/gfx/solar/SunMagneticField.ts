import { pt } from "@fils/gen";
import { Random } from "@fils/math";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, InstancedBufferAttribute, InstancedMesh, Line, Object3D, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import fragmentShader from "../../../glsl/lib/smf.frag";
import vertexShader from "../../../glsl/lib/smf.vert";
import { GLOBALS } from "../../core/Globals";

const N_LINES = 128;
const N_SEGMENTS = 4;

const I_GEO = new SphereGeometry(.001, 8, 8);

function ptToV3(point:pt):Vector3 {
  return new Vector3(point.x, point.y, point.z);
}

function getPerpendicularVector(normal) {
    const perpendicular = new Vector3();
    
    // Choose an arbitrary vector that's not parallel to the normal
    // Use (1,0,0) unless the normal is too close to it
    const arbitrary = Math.abs(normal.x) < 0.9 
        ? new Vector3(1, 0, 0) 
        : new Vector3(0, 1, 0);
    
    // Cross product gives us a perpendicular vector
    perpendicular.crossVectors(normal, arbitrary);
    perpendicular.normalize();
    
    return perpendicular;
}

const MAT = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: {
      value: 0
    },
    color1: {
      value: new Color(0xF4C6A1)
    },
    color2: {
      value: new Color(0xC76537)
    },
    fresnelWidth: {
        value: 1
    },
    brightness: {
        value: 4.3
    }
  },
  transparent: true
  // side: DoubleSide
});

export class SunMagneticField extends Object3D {
  flows:Line;
  mesh:InstancedMesh;
  paths:CatmullRomCurve3[] = [];

  constructor(geo:BufferGeometry) {
    super();

    const triL = geo.attributes.position.count;// / 3;
    const ia = geo.index.array;
    const pa = geo.attributes.position.array;
    const na = geo.attributes.normal.array;

    // 1. create curves
    for(let i=0; i < N_LINES; i++) {
      const i1 = Random.randi(0, triL-1);
      const i2 = Random.randi(0, triL-1);
      // const pt1 = ptToV3(randomPointOnTriangle(geo, ia[i1*3], ia[i1*3+1], ia[i1*3+2]));
      // const pt2 = ptToV3(randomPointOnTriangle(geo, ia[i2*3], ia[i2*3+1], ia[i2*3+2]));
      const pt1 = new Vector3(pa[i1*3], pa[i1*3+1], pa[i1*3+2]);
      const pt2 = new Vector3(pa[i2*3], pa[i2*3+1], pa[i2*3+2]);

      const L = Random.randf(.05, .1);
      
      //get control point 1
      /* const n1 = getPerpendicularVector(new Vector3(
        na[i1*3],
        na[i1*3+1],
        na[i1*3+2]
      ))
      const mp1 = pt1.clone().add(n1.multiplyScalar(L));
      
      const n2 = getPerpendicularVector(new Vector3(
        na[i2*3],
        na[i2*3+1],
        na[i2*3+2]
      ))
      const mp2 = pt2.clone().add(n2.multiplyScalar(L)); */

      const n1 = new Vector3(
        na[i1*3],
        na[i1*3+1],
        na[i1*3+2]
      )
      const mp1 = pt1.clone().add(n1.multiplyScalar(L));

      const n2 = new Vector3(
        na[i2*3],
        na[i2*3+1],
        na[i2*3+2]
      )
      const mp2 = pt2.clone().add(n2.multiplyScalar(L));

      const mpW = .5;
      const mp = mp1.clone().add(mp2.clone().sub(mp1).multiplyScalar(mpW)).add(n1).add(n2);

      // if(mp.y >= 0) mp.y -= L;
      // else mp.y += L;
      // if(mp.x >= 0) mp.x += L;
      // else mp.x -= L;

      // if(i == 0) {
      //   const p = new Points(new BufferGeometry().setFromPoints([pt1, mp1, mp, mp2, pt2]), MAT);
      //   this.add(p);
      // }

      const path = new CatmullRomCurve3([pt1, mp1, mp, mp2, pt2]);
      this.paths.push(path);
    }

    // 2. create flow
    const geos = [];
    const iPos = [];
    const w = [];
    for(let i=0; i < N_LINES; i++) {
      const pts = this.paths[i].getPoints(N_SEGMENTS-1);
      const g = new BufferGeometry().setFromPoints(pts);
      // console.log(g.attributes.position);

      // add weight attribute
      // const w = new Float32Array(N_SEGMENTS);
      for(let j=0; j<N_SEGMENTS; j++) {
        // w[j] = j / (N_SEGMENTS-1);
        // w.push(j / (N_SEGMENTS-1));
        iPos.push(pts[j].x, pts[j].y, pts[j].z);
      }

      g.setAttribute('iPos', new BufferAttribute(new Float32Array(N_SEGMENTS*3), 3));
      geos.push(g);
    }

    this.mesh = new InstancedMesh(I_GEO, MAT, iPos.length/3);
    this.mesh.geometry.setAttribute(
      'iPos',
      new InstancedBufferAttribute(
        new Float32Array(iPos),
        3
      )
    );

    /* this.mesh.geometry.setAttribute(
      'weight',
      new InstancedBufferAttribute(
        new Float32Array(w),
        1
      )
    ); */

    // console.log(w.length);
    this.add(this.mesh);

    // const lg = mergeGeometries(geos);
    // console.log(lg.attributes.position.count);

    /* this.flows = new Line(lg, MAT);
    this.flows.userData.firePass = true;
    this.flows.visible = false;
    this.add(this.flows); */

    this.mesh.userData.firePass = true;
    this.mesh.visible = false;
    // GLOBALS.firePass.push(this);
  }

  update() {
    // MAT.uniforms.time.value = GLOBALS.solarClock.time;
    MAT.uniforms.time.value = GLOBALS.clock.currentTime;
  }
}