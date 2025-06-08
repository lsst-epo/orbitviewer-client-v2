import { MathUtils } from "@fils/math";
import { Box3, CatmullRomCurve3, Color, Group, Mesh, Object3D, ShaderMaterial, TubeGeometry, Vector3 } from "three";
// import { TrajectoryMaterial } from "../gfx/TrajectoryMaterial";

import { calculateOrbitByType, OrbitElements, OrbitType } from "../../core/solar/SolarSystem";
import { SolarTimeManager } from "../../core/solar/SolarTime";

import fragmentShader from "../../../glsl/lib/path.frag";
import vertexShader from "../../../glsl/lib/path.vert";

function getMaterial():ShaderMaterial {
    return new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            color: {
                value: new Color(0x999999)
            }
        }
    })
}

const MIN_DISTANCE = {
    min: .1,
    max: 5
};
const MIN_POINTS = 10;

/**
 * Elliptical Path
 * This class stores an array of points for
 * drawing an elliptical orbit path of a
 * given solar system object.
 * It will be calculated from today's date into
 * the future and it will use adaptive steps
 * depending on its semi-major axis (a)
 */
export class EllipticalPath {
    pts:Array<Vector3> = [];
    ellipse:Object3D;
    orbitElements:OrbitElements;
    // material:TrajectoryMaterial;
    selected:boolean = false;
    hidden:boolean = false;
    boundingBox:Box3;
    type:OrbitType;

    constructor(el:OrbitElements, r:number) {
        // build path
        const date = new Date();
        const first = new Vector3();

        if(el.type != OrbitType.Elliptical) {
            console.warn("Object does not have an elliptical orbit", el);
        }

        this.type = el.type;

        this.orbitElements = el;

        if(el.type === OrbitType.Elliptical) {

            let d = SolarTimeManager.getMJDonDate(date);
            calculateOrbitByType(el, d, OrbitType.Elliptical, first);
            this.pts.push(first);

            const dt = [];
            dt.push(0);
            let pD = d;

            let curr = new Vector3();
            calculateOrbitByType(el, ++d, OrbitType.Elliptical, curr);

            const ed = MathUtils.smoothstep(.9, .95, el.e);
            const dist = MathUtils.lerp(
                MIN_DISTANCE.min,
                MIN_DISTANCE.max,
                1-ed
            );
            const step = MathUtils.lerp(
                .05,
                1,
                1-ed
            );

            const minD = dist * el.a;
            while(this.pts.length < MIN_POINTS || curr.distanceTo(this.pts[0]) > minD) {
                while(curr.distanceTo(this.pts[this.pts.length-1]) < minD) {
                    d += step;
                    calculateOrbitByType(el, d, OrbitType.Elliptical, curr);
                }

                dt.push(d-pD);
                // pD = d;
                this.pts.push(curr.clone());
            }

            const pos = [];
            const weight = [];
            let k = 0;

            for(const p of this.pts) {
                pos.push(p.x, p.y, p.z);
                weight.push(k++/this.pts.length);
            }

			// console.log(this.pts);

            // close
            const p = this.pts[0];
            // pos.push(p.x, p.y, p.z);
            // weight.push(0);
            // dt.push(0);

            /* if(el.e > .94) {
                // console.log(this.pts.length, el.a, dist);
            } */

            // const geo = new BufferGeometry();
            // geo.setAttribute(
            //     'position',
            //     new BufferAttribute(
            //         new Float32Array(pos),
            //         3
            //     )
            // );

            // geo.setAttribute(
            //     'weight',
            //     new BufferAttribute(
            //         new Float32Array(weight),
            //         1
            //     )
            // );

            // geo.setAttribute(
            //     'dt',
            //     new BufferAttribute(
            //         new Float32Array(dt),
            //         1
            //     )
            // );

            this.ellipse = new Group();
            const mat = getMaterial();
            // this.material = mat;

            // const l = new Line(geo, mat);
            // this.ellipse.add(l);
            //
			const geo = new TubeGeometry(new CatmullRomCurve3(this.pts, true), 500, 5, 8, true);
			const l = new Mesh(geo, mat);
			this.ellipse.add(l);

            geo.computeBoundingBox();
            this.boundingBox = geo.boundingBox;



        } else {
            this.boundingBox = new Box3(
                new Vector3(),
                new Vector3()
            );

            this.ellipse = new Object3D();
        }
    }

    update(d:number, target:Vector3, radius:number) {
        if(this.type !== OrbitType.Elliptical) return;

        // const mat = this.material;
        // if(mat.shader) {
        //     mat.shader.uniforms.d.value = d;
        //     mat.shader.uniforms.bodyPos.value.copy(target);
        //     mat.shader.uniforms.dRadius.value = radius;

        //     const sel = mat.shader.uniforms.selected;
        //     sel.value = MathUtils.lerp(sel.value, this.selected ? 1 : 0, .16);

        //     const op = mat.shader.uniforms.globalOpacity;
        //     op.value = MathUtils.lerp(op.value, this.hidden ? 0 : 1, .16);
        // }
    }
}
