import { RTUtils, Size } from "@fils/gfx";
import { BufferAttribute, BufferGeometry, FloatType, NearestFilter, OrthographicCamera, Points, Scene, ShaderMaterial, Texture, WebGLRenderer, WebGLRenderTarget } from "three";
import { IS_DEV_MODE, GPU_SIM_SIZES, VISUAL_SETTINGS } from "../../core/Globals";
import { EPOCH, OrbitElements } from "../../core/solar/SolarSystem";

export type SimQuality = 'low'|'medium'|'high'|'ultra';

import sim_f from '../../../glsl/sim/gpu_sim.frag';
import sim_v from '../../../glsl/sim/gpu_sim.vert';

const SIM_MAT = new ShaderMaterial({
    vertexShader: sim_v,
    fragmentShader: sim_f,
    uniforms: {
        d: {value: 0}
    }
})

export class GPUSim {
    private quality:SimQuality = VISUAL_SETTINGS.current as SimQuality;
    private fbo:WebGLRenderTarget;
    private totalItems:number;
    private points:Points;
    private scene:Scene = new Scene();
    private camera:OrthographicCamera;
    rnd:WebGLRenderer

    constructor(renderer:WebGLRenderer) {
        this.rnd = renderer;
        this.createBuffers(true);
    }

    get qualitySettings():SimQuality {
        return this.quality;
    }

    private createBuffers(firstTime:boolean=false) {
        const siz = GPU_SIM_SIZES[this.quality] as Size;
        this.totalItems = siz.width * siz.height;

        const w = siz.width;
        const h = siz.height;

        if(firstTime) {
            this.camera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 100);
            this.camera.position.z = 10;
            this.scene.add(this.camera);
            this.fbo = new WebGLRenderTarget(w, h);
            this.fbo.texture.minFilter = NearestFilter;
            this.fbo.texture.magFilter = NearestFilter;
            this.fbo.texture.type = FloatType;
            this.points = new Points(
                this.createPoints(),
                SIM_MAT
            );
            this.scene.add(this.points);
        } else {
            this.fbo.setSize(w, h);
            this.points.geometry.dispose();
            this.points.geometry = this.createPoints();
            this.camera.left = -w/2;
            this.camera.right = w/2;
            this.camera.top = h/2;
            this.camera.bottom = -h/2;
            this.camera.updateProjectionMatrix();
        }

        this.points.position.x = -w/2 + 1;
        this.points.position.y = -h/2 + 1;
    }

    private createPoints(): BufferGeometry {
        const siz = GPU_SIM_SIZES[this.quality] as Size;
        const count = this.totalItems;
        const geo = new BufferGeometry();

        // attrs
        const pos = [];
        const alive = new Float32Array(count); // 0 dead 1 alive
        const N = new Float32Array(count);
        const a = new Float32Array(count);
        const e = new Float32Array(count);
        const i = new Float32Array(count);
        const w = new Float32Array(count);
        const M = new Float32Array(count);
        const n = new Float32Array(count);
        const Tp = new Float32Array(count);
        const q = new Float32Array(count);
        const epoch = new Float32Array(count);
        const type = new Float32Array(count);

        for(let i=0; i<siz.width; i++) {
            for(let j=0; j<siz.height; j++) {
                pos.push(i,j,0);
            }
        }

        geo.setAttribute(
            'position',
            new BufferAttribute(
                new Float32Array(pos), 3
            )
        );

        geo.setAttribute(
            'alive', 
            new BufferAttribute(alive, 1)
        );

        geo.setAttribute(
            'N', 
            new BufferAttribute(N, 1)
        );

        geo.setAttribute(
            'a', 
            new BufferAttribute(a, 1)
        );

        geo.setAttribute(
            'e', 
            new BufferAttribute(e, 1)
        );

        geo.setAttribute(
            'i', 
            new BufferAttribute(i, 1)
        );

        geo.setAttribute(
            'w', 
            new BufferAttribute(w, 1)
        );

        geo.setAttribute(
            'M', 
            new BufferAttribute(M, 1)
        );

        geo.setAttribute(
            'n',
            new BufferAttribute(n, 1)
        );

        geo.setAttribute(
            'Tp',
            new BufferAttribute(Tp, 1)
        );

        geo.setAttribute(
            'q',
            new BufferAttribute(q, 1)
        );

        geo.setAttribute(
            'epoch',
            new BufferAttribute(epoch, 1)
        );

        geo.setAttribute(
            'type', 
            new BufferAttribute(type, 1)
        );

        return geo;
    }

    get texture():Texture {
        return this.fbo.texture;
    }

    private updateDataBuffer(id:string, data:Array<OrbitElements>, defaultValue:number=0) {
        const geo = this.points.geometry;
        const attr = geo.attributes[id];
        if(!attr) {
            return console.warn(`Couldn't find attribute ${id}!!`);
        }

        const arr = attr.array as Float32Array;

        for(let i=0; i<Math.min(this.totalItems, data.length); i++) {
            arr[i] = data[i][id] ? data[i][id] : defaultValue;
            // console.log(data[i][id]);
        }

        attr.needsUpdate = true;
    }

    set data(value:Array<OrbitElements>) {

        if(VISUAL_SETTINGS.current !== this.quality){
            this.quality = VISUAL_SETTINGS.current as SimQuality;
            this.createBuffers();
        }

        const geo = this.points.geometry;
        const alive = geo.attributes.alive;
        const arr = alive.array as Float32Array;

        if(IS_DEV_MODE) console.log('Total Items:',this.totalItems, 'Value Lenght:', value.length);
        
        for(let i=0; i<Math.min(this.totalItems, value.length); i++) {
            arr[i] = 1;            
        }

        for(let i=value.length; i<this.totalItems; i++) {
            arr[i] = 0;
        }

        this.updateDataBuffer('N', value);
        this.updateDataBuffer('a', value);
        this.updateDataBuffer('e', value);
        this.updateDataBuffer('i', value);
        this.updateDataBuffer('w', value);
        this.updateDataBuffer('M', value);
        this.updateDataBuffer('n', value);
        this.updateDataBuffer('Tp', value);
        this.updateDataBuffer('q', value);
        this.updateDataBuffer('epoch', value, EPOCH);
        this.updateDataBuffer('type', value);

        alive.needsUpdate = true;
        // N.needsUpdate = true;
    }

    render(d:number) {
        SIM_MAT.uniforms.d.value = d;
        this.rnd.setRenderTarget(this.fbo);
        this.rnd.render(this.scene, this.camera);
        this.rnd.setRenderTarget(null);
    }

    drawFbo() {
        this.rnd.autoClear = false;
        this.rnd.clearDepth();
        RTUtils.drawRT(this.fbo, this.rnd, 100, 100);
    }
}