import { MathUtils } from "@fils/math";
import { Box3, CatmullRomCurve3, Color, Group, Object3D, Vector3 } from "three";

import {
    getCartesianCoordinates,
    OrbitElements,
    OrbitType
} from "../../core/solar/SolarSystem";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { PathMaterial, PathMaterialParameters } from "./PathMaterial";
import { Planet } from "./Planet";
import { LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";
import { getCraftCategory } from "../../core/data/Categories";
import { UNCOLOR } from "./SolarParticles";

export const DEFAULT_PATH_ALPHA = .05;
export const OBJECT_PATH_ALPHA = .01;

const origin = new Vector3();

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
    material:PathMaterial;
    selected:boolean = false;
    hidden:boolean = false;
    boundingBox:Box3;
    type:OrbitType;

    constructor(el:OrbitElements, planet:Planet=null) {
        if(el.type != OrbitType.Elliptical) {
            console.warn("Object does not have an elliptical orbit", el);
        }

        this.type = el.type;
        this.orbitElements = el;

        if(el.type === OrbitType.Elliptical) {

            /**
             * This code determines the nodes required to draw the orbit, think of
             * "nodes" as dots on a piece of paper and you draw a pencil through them
             * to complete the orbit. For objects with a long orbit the `pts` array
             * can get extremely large - 10s of thousands in length - if left unchecked.
             * 
             * Later on though, the `pts` array is resampled and the number is reduced
             * to a maximum of 1001, as such it doesn't make a whole lot of sense to 
             * let the `pts` array grow to a large size. As such, a "point count" is
             * derived based on the value for `e` eccentricity. This keeps the `pts`
             * length low at this stage and aligns it with the 1001 max length at the
             * resampling level.
             */
            const eccentricity = Math.max(0, Math.min(1, el.e));
            const pointCount = Math.round(250 + (1500 - 250) * eccentricity);
      
            /**
             * Previously this code started determining node points at where the object
             * is in orbit on today's date - that is irrelevant for determining the
             * nodes, so a date check is skipped. Later on in the SolarElements:update()
             * method the date is passed in and the position of the object is set to
             * today's date on page load.
             */
            for(let index = 0; index < pointCount; index++) {
                // Determine radians
                const E = (index / pointCount) * Math.PI * 2;
            
                // Determine coordinates in the orbital plane
                const xv = el.a * (Math.cos(E) - el.e);
                const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
            
                // Convert orbital plane coordinates to an angle relative to the sun
                const trueAnomaly = Math.atan2(yv, xv);

                // Calculate distance from the sun
                const radius = Math.sqrt(xv * xv + yv * yv);
            
                // Use helper method to orient position in 3D space and add it to array
                this.pts.push(
                    getCartesianCoordinates(
                        trueAnomaly,
                        radius,
                        el,
                        new Vector3()
                    )
                );
            }

            const pos = [];
            for(const p of this.pts) {
                pos.push(p.x, p.y, p.z);
            }

			this.ellipse = new Group();

            const cat = getCraftCategory(el.category);

            const matOptions:LineMaterialParameters = {
                color: cat ? new Color(cat.mainColor) : UNCOLOR,
                linewidth: 1,
                // dashed: true,
                gapSize: 200,
                dashSize: 60,
                transparent: true,
                opacity: DEFAULT_PATH_ALPHA,
                alphaTest: .001,
            }

            const pathOpts:PathMaterialParameters = {
                isPlanet: planet !== null
            }

            if(planet !== null) {
                pathOpts.planetPosition = planet.position;
                pathOpts.fadeDistance = planet.scale.x;
            }

            const mat = new PathMaterial(matOptions, pathOpts);
            this.material = mat;
            const curve = new CatmullRomCurve3(this.pts, true);

            /**
             * The following code resamples the `pts` to its final shape
             * and size
             */
            const D = curve.getPointAt(0).distanceTo(origin);
            const Dr = MathUtils.smoothstep(330, 1500, D);
            const nPts = MathUtils.lerp(200, 500, Dr);
            const pts = curve.getPoints(Math.round(nPts)*2);
            const positions = [];

            for(let i=0;i<pts.length; i++) {
                const pt = pts[i];
                positions.push(pt.x, pt.y, pt.z);
            }

            const geo = new LineGeometry();
            geo.setPositions(positions);
            const l = new Line2(geo, mat);
            l.computeLineDistances();
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

    setPathOptions(pathOpts:PathMaterialParameters={}) {
        this.material.setPathOptions(pathOpts);
    }

    update(d:number, target:Vector3, radius:number) {
        if(this.type !== OrbitType.Elliptical) return;

        // const ramp = MathUtils.smoothstep(0, 1, Math.sin(GLOBALS.solarClock.time * .5));
        // console.log(ramp);

        // this.material.gapSize = MathUtils.lerp(0, 200, ramp);
        // this.material.dashOffset = GLOBALS.solarClock.time;

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
