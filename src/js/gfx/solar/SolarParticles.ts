/**
 * Solar Particles
 *
 * This class creates a fixed buffer of instanced quads.
 * This buffer will be feed by orbit elements data and
 * visualize accordingly
 */

// import { RTUtils } from "@fils/gfx";
import { BufferAttribute, BufferGeometry, Color, InstancedBufferAttribute, InstancedMesh, PerspectiveCamera, Points, ShaderMaterial, SphereGeometry, WebGLRenderer } from "three";
import { GLOBALS, GPU_SIM_SIZES, VISUAL_SETTINGS } from "../../core/Globals";
import { OrbitElements } from "../../core/solar/SolarSystem";
import { GPUSim, SimQuality } from "./GPUSim";

import { Random } from "@fils/math";

import { gsap } from 'gsap';
// import { CategoryColorMap } from "../../core/data/Categories";

import fragmentShader from '../../../glsl/sim/particles_instanced.frag';
import vertexShader from '../../../glsl/sim/particles_instanced.vert';
import { LoadManager } from "../../core/data/LoadManager";
import { getCraftCategory } from "../../core/data/Categories";
import { FAR, NEAR } from "../OrbitViewer";

const MAT = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    // vertexColors: true,
    uniforms: {
        computedPosition: {
            value: null
        },
        opacity: {
            value: 1
        },
        near: {
            value: 0
        },
        far: {
            value: 0
        }
    }
});

const I_GEO = new SphereGeometry(1, 4, 4);

export class SolarParticles {
    private _data:Array<OrbitElements> = [];
    mesh:InstancedMesh;
    // maps:WebGLMultipleRenderTargets;
    sim:GPUSim;
    quality:SimQuality;

    filtered:boolean[];

    constructor(){}

    init(renderer:WebGLRenderer){
        this.sim = new GPUSim(renderer);
        this.quality = this.sim.qualitySettings;
        MAT.uniforms.computedPosition.value = this.sim.texture;

        this.createInstancedMesh();
    }

    private createInstancedMesh() {
        const count = VISUAL_SETTINGS[VISUAL_SETTINGS.current];

        this.mesh = new InstancedMesh(I_GEO, MAT, count);
		this.mesh.frustumCulled = false;

        const col = new Color(0x999999).convertSRGBToLinear();

        for(let i=0; i<count; i++) {
            this.mesh.setColorAt(i, col);
        }

        const siz = GPU_SIM_SIZES[VISUAL_SETTINGS.current];
        const w = siz.width;
        const h = siz.height;

        const simUV = [];
        const intensity = [];

        for(let i=0; i<w; i++){
            for(let j=0; j<h; j++){
                simUV.push(i/(w-1), j/(h-1));
                intensity.push(1); // used to fade out filtered particles
            }
        }

        this.mesh.geometry.setAttribute(
            'simUV',
            new InstancedBufferAttribute(
                new Float32Array(simUV),
                2
            )
        );

        // create instanced attribute
        this.mesh.geometry.setAttribute(
            'filterValue',
            new InstancedBufferAttribute(
                new Float32Array(intensity),
                1
            )
        );

        this.filtered = [];
        for(let i=0; i<count; i++) this.filtered.push(false);
    }

    /**
     * Updates filter states of particles & dims out filtered ones
     */
    updateFilterState() {

    }

    /**
     * Updates the associated data
     */
    set data(value:Array<OrbitElements>) {
        const MAX = VISUAL_SETTINGS[VISUAL_SETTINGS.current];
        if(this.quality != VISUAL_SETTINGS.current){
            this.quality = VISUAL_SETTINGS.current as SimQuality;
            this.mesh.geometry.dispose();
            this.mesh.dispose();
            this.createInstancedMesh();
        }
        this._data = value;
        const count = Math.min(MAX, this._data.length);

        MAT.uniforms.near.value = NEAR;
        MAT.uniforms.far.value = FAR;

        this.sim.data = value;

        for(let i=0; i<count; i++) {
            const el = this._data[i];
            // console.log(el.category);
            const categoryData = getCraftCategory(el.category);
            const color:Color = categoryData.threeColor;
            this.mesh.setColorAt(i, color);
            // console.log(el.category);
            // const col = CategoryColorMap[el.category];
            // const col = new Color(0xcccc00);
            // arr[i*3] = col.r;
            // arr[i*3 + 1] = col.g;
            // arr[i*3 + 2] = col.b;
        }

        this.mesh.instanceColor.needsUpdate = true;
        // color.needsUpdate = true;
    }

    /**
     * Sets state of particles (opacity)
     */
    set highlighted(value:boolean) {
        const u = MAT.uniforms;
        gsap.to(u.opacity, {value: value ? 1 : .1, duration: 2, overwrite: true});
    }

    /**
     *
     * @param d - MJD of the simulation
     * @param camera - Camera rendering the simulation
     */
    update(d:number, camera:PerspectiveCamera) {
        this.sim.render(d);
        MAT.uniforms.near.value = GLOBALS.fog.near;
        MAT.uniforms.far.value = GLOBALS.fog.far;
    }
}
