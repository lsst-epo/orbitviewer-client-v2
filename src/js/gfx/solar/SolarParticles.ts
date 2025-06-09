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
import p_frag from '../../../glsl/sim/particles.frag';
import p_vert from '../../../glsl/sim/particles.vert';

import { gsap } from 'gsap';
// import { CategoryColorMap } from "../../core/data/Categories";


const MAT = new ShaderMaterial({
    vertexShader: p_vert,
    fragmentShader: p_frag,
    transparent: true,
    vertexColors: true,
    uniforms: {
        computedPosition: {
            value: null
        },
        opacity: {
            value: 1
        }
    },
    // blending: NormalBlending
});

import fragmentShader from '../../../glsl/sim/particles_instanced.frag';
import vertexShader from '../../../glsl/sim/particles_instanced.vert';
import { LoadManager } from "../../core/data/LoadManager";
import { getCraftCategory } from "../../core/data/Categories";
import { FAR, NEAR } from "../OrbitViewer";

const MAT2 = new ShaderMaterial({
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

export type RenderMode = "instanced" | "points";

export class SolarParticles {
    private _data:Array<OrbitElements> = [];
    mesh:InstancedMesh;
    points:Points;
    // maps:WebGLMultipleRenderTargets;
    sim:GPUSim;
    quality:SimQuality;

    private mode:RenderMode = "instanced";

    constructor(){}

    init(renderer:WebGLRenderer){
        this.sim = new GPUSim(renderer);
        this.quality = this.sim.qualitySettings;
        MAT.uniforms.computedPosition.value = this.sim.texture;
        MAT2.uniforms.computedPosition.value = this.sim.texture;

        // this.points = new Points(this.createPointsGeo(), MAT);
        this.createInstancedMesh();

        /* this.maps = new WebGLMultipleRenderTargets(512, 512, 3);
        this.maps.texture[0].name = 'normal';
        this.maps.texture[1].name = 'alpha';
        this.maps.texture[2].name = 'diffuse';
        RTUtils.renderToRT(this.maps, renderer, COMP_SP_NORMAL);
        renderer.setRenderTarget(null); */

        this.updateVisibility();
    }

    private createPointsGeo():BufferGeometry {
        const count = VISUAL_SETTINGS[VISUAL_SETTINGS.current];

        const geo = new BufferGeometry();
        const pos = [];
        const color = [];
        const col = new Color();

        for(let i=0; i<count; i++) {
            color.push(col.r, col.g, col.b);
            pos.push(
                Random.randf(-500, 500),
                Random.randf(-500, 500),
                Random.randf(-500, 500)
            )
        }

        const siz = GPU_SIM_SIZES[VISUAL_SETTINGS.current];
        const w = siz.width;
        const h = siz.height;

        const simUV = [];

        for(let i=0; i<w; i++){
            for(let j=0; j<h; j++){
                simUV.push(i/(w-1), j/(h-1));
            }
        }

        geo.setAttribute(
            'position',
            new BufferAttribute(
                new Float32Array(pos),
                3
            )
        );

        geo.setAttribute(
            'color',
            new BufferAttribute(
                new Float32Array(color),
                3
            )
        );

        geo.setAttribute(
            'simUV',
            new BufferAttribute(
                new Float32Array(simUV),
                2
            )
        );

        return geo;
    }

    private createInstancedMesh() {
        const count = VISUAL_SETTINGS[VISUAL_SETTINGS.current];

        this.mesh = new InstancedMesh(I_GEO, MAT2, count);
		this.mesh.frustumCulled = false;

        const col = new Color(0x999999).convertSRGBToLinear();

        for(let i=0; i<count; i++) {
            this.mesh.setColorAt(i, col);
        }

        const siz = GPU_SIM_SIZES[VISUAL_SETTINGS.current];
        const w = siz.width;
        const h = siz.height;

        const simUV = [];

        for(let i=0; i<w; i++){
            for(let j=0; j<h; j++){
                simUV.push(i/(w-1), j/(h-1));
            }
        }

        this.mesh.geometry.setAttribute(
            'simUV',
            new InstancedBufferAttribute(
                new Float32Array(simUV),
                2
            )
        );
    }

    updateVisibility() {
        // this.points.visible = this.mode === "points";
        this.mesh.visible = this.mode === "instanced";
    }

    set renderMode(value:RenderMode) {
        this.mode = value;
        this.updateVisibility();
    }

    get renderMode():RenderMode {
        return this.mode;
    }

    /**
     * Updates the associated data
     */
    set data(value:Array<OrbitElements>) {
        const MAX = VISUAL_SETTINGS[VISUAL_SETTINGS.current];
        if(this.quality != VISUAL_SETTINGS.current){
            this.quality = VISUAL_SETTINGS.current as SimQuality;
            // this.points.geometry.dispose();
            // this.points.geometry = this.createPointsGeo();
            this.mesh.geometry.dispose();
            this.mesh.dispose();
            this.createInstancedMesh();
        }
        this._data = value;
        const count = Math.min(MAX, this._data.length);

        MAT2.uniforms.near.value = NEAR;
        MAT2.uniforms.far.value = FAR;

        this.sim.data = value;

        this.updateVisibility();

        // To-Do: Bring Category Color
        // const color = this.points.geometry.attributes.color;
        // const arr = color.array as Float32Array;

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
        const u = this.mode === "instanced" ? MAT2.uniforms : MAT.uniforms;
        gsap.to(u.opacity, {value: value ? 1 : .2, duration: 2, overwrite: true});
    }

    /**
     *
     * @param d - MJD of the simulation
     * @param camera - Camera rendering the simulation
     */
    update(d:number, camera:PerspectiveCamera) {
        this.sim.render(d);
        MAT2.uniforms.near.value = GLOBALS.fog.near;
        MAT2.uniforms.far.value = GLOBALS.fog.far;
    }
}
