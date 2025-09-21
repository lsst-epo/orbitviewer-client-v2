import { BufferAttribute, BufferGeometry, ColorRepresentation, Line, LineBasicMaterial, Object3D, Sphere, Vector3 } from "three";
// import { isPortrait } from "../../production/utils/Helpers";
// import { initMaterial } from "../gfx/ShaderLib";
// import { EllipticalPath } from "./EllipticalPath";
// import { PlanetOptions, PLANET_GEO } from "./Planet";
import { slugify } from "@fils/utils";
import gsap from "gsap";
import { GLOBALS } from "../../core/Globals";
import { calculateOrbitByType, OrbitElements, OrbitType } from "../../core/solar/SolarSystem";
import { UserFilters } from "../../core/solar/SolarUtils";
import { DEFAULT_PATH_ALPHA, EllipticalPath, OBJECT_PATH_ALPHA } from "./EllipticalPath";
import { Solar3DElement } from "./Solar3DElement";
import { SolarDOMElement } from "./SolarDomElement";

const L_DUMMY = new LineBasicMaterial({
    color: 0xff0000
});

const tmp:Vector3 = new Vector3();

export type SolarElementOptions = {
    color?:ColorRepresentation;
    mapURL?:string;
}

/* const lockedPosition = {
	portrait: {
		distance: .03,
		offset: new Vector3(0, -.0055, 0)
	},
	landscape: {
		distance: .03,
		offset: new Vector3(.01, 0, 0)
	}
} */

export enum Mode {
    ORBIT,
    OBJECT
}

export class SolarElement extends Solar3DElement {
    container:Object3D = new Object3D();
    boundingSphere:Sphere = new Sphere();
    // mesh:Mesh;
    data:OrbitElements;
    orbitPath:EllipticalPath;
    protected _selected:boolean = false;
    // material:MeshPhongMaterial;
    target:Object3D;
	type: string;
    category: string;
    closeUp: boolean = false;

    domRef:SolarDOMElement = null;

    isPlanet:boolean = false;

    lockedObjectDistance = { min: 1, max: 10 };
    lockedOrbitDistance = { min: 1, max: 10 };
    offsetObject = new Vector3();
    offsetOrbit = new Vector3();

    slug:string;

    protected _mode:Mode = 0;

    protected _active:boolean = true;

    // lockedPosition = {
    //     portrait: {
    //         distance: .03,
    //         offset: new Vector3(0, -100, 0)
    //     },
    //     landscape: {
    //         distance: .03,
    //         offset: new Vector3(.01, 0, 0)
    //     }
    // }

    sunLine:Line;

    constructor(id:string, _data:OrbitElements, opts:SolarElementOptions={}) {
        super();

        this.data = _data;
        this.type = id;
        this.name = id;
        this.slug = slugify(id);
        this.category = _data.category;
        // console.log(id, this.category)

        let scl = .001;

        // console.log(_data);

        this.scale.multiplyScalar(scl);

        const lineGeo = new BufferGeometry();
        const pos = new Float32Array([0,0,0,10,10,10]);
        lineGeo.setAttribute('position', new BufferAttribute(pos, 3));
        this.sunLine = new Line(lineGeo, L_DUMMY);

        // console.log(id, _data);
        if(id !== 'sol') this.orbitPath = new EllipticalPath(_data);


        // this.mesh = new Mesh(PLANET_GEO, this.initMaterial(opts));
        // this.mesh.visible = false;
        // this.container.add(this.mesh);
        this.add(this.container);
        this.target = this;

        // const min = this.boundingBox.min;
        // const max = this.boundingBox.max;
        // const center = max.clone().sub(min);

        // this.lockedPosition.landscape.distance = max.length() * 2;
        // this.lockedPosition.landscape.offset.set(0,max.length()+center.y,0);
        // this.lockedPosition.portrait.distance = max.length() * 2;
        // this.lockedPosition.portrait.offset.set(0,-max.length()-1000,0);

        this.updateCameraView();
    }

    set mode(value:Mode) {
        this._mode = value;
        if(this.selected) return;
        this.blur(value === 0 ? DEFAULT_PATH_ALPHA : OBJECT_PATH_ALPHA);
    }

    get mode():Mode {
        return this._mode;
    }

    updateFilters() {
        // 1. check category
        const cMap = UserFilters.categories;
        this.enabled = cMap[this.data.category];
        if(!this._active) return;

        // 2. check other filters
        const dMap = UserFilters.distanceRange;
        this.enabled = this.data.a >= dMap.min && this.data.a <= dMap.max;

        if(!this._active) return;

        // 3. discovered by
        const by = UserFilters.discoveredBy;
        if(by === 1) {
            // rubin
            this.enabled = this.data.rubin_discovery === true;
        } else if(by === 2) {
            // non rubin
            this.enabled = this.data.rubin_discovery !== true;
        }

        if(this._active) this.blur();
    }

    set enabled(value:boolean) {
        this._active = value;
        // this.parent.visible = value;
        this.orbitPath.ellipse.visible = value;
    }

    get enabled():boolean {
        return this._active;
    }

    updateCameraView() {
        // const viewport = GLOBALS.getViewport();
        if(this.data.id === 'sol') return;
        const scl = this.scale.x;
        // console.log(viewport, GLOBALS.isMobile());

        const box = this.orbitPath.boundingBox;
        tmp.copy(box.max).sub(box.min);
        const R = tmp.length()/2;

        if(GLOBALS.isMobile()) {
            this.offsetObject.set(0, -scl*1.5, 0);
            this.lockedObjectDistance = {
                min: scl * 5,
                max: scl * 15
            }
            this.offsetOrbit.set(0, -R, 0);
            this.lockedOrbitDistance = {
                min: R * 5,
                max: R * 15
            }
        } else {
            this.offsetObject.set(-scl, 0, 0);
            this.lockedObjectDistance = {
                min: scl * 3,
                max: scl * 8
            }
            this.offsetOrbit.set(-R, 0, 0);
            this.lockedOrbitDistance = {
                min: R * 2,
                max: R * 10
            }
        }
    }

    initMaterial(opts:SolarElementOptions = {}){

        // this.material = initMaterial(new MeshPhongMaterial({
        //     color: opts.color ? opts.color : 0xffffff,
        //     shininess: 0
        // })) as MeshPhongMaterial;

        // return this.material;
    }

    // get boundingBox(): Box3 {
    //     return this.orbitPath.boundingBox;
    // }

    // get lockedDistance():number {
    //     const t = isPortrait() ? this.lockedPosition.portrait : this.lockedPosition.landscape;
    //     return t.distance;
    // }

    // get lockedOffset():Vector3 {
    //     const t = isPortrait() ? this.lockedPosition.portrait : this.lockedPosition.landscape;
    //     return t.offset;
    // }

    update(d:number) {
        this.updateDistanceToCamera();
        if(this.data.id === 'sol') return;
        calculateOrbitByType(this.data, d, OrbitType.Elliptical, this.position);
        // if(this.type === 'test') console.log(`${this.position.x}, ${this.position.y}, ${this.position.z}`)

        /* const pos = this.sunLine.geometry.attributes.position;
        const arr = pos.array as Float32Array;
        arr[3] = this.position.x;
        arr[4] = this.position.y;
        arr[5] = this.position.z;

        pos.needsUpdate = true; */

        // this.mesh.updateMatrixWorld();
        // this.material.update();
        this.orbitPath.update(d, this.position, this.scale.x);
        this.orbitPath.ellipse.visible = this.enabled;

        // this.orbitPath.ellipse.visible = this.visible;
    }
    
    focus() {
        if(!this._active) return;
        if(this.data.id === 'sol') return;
        this.orbitPath.ellipse.visible = true;
        gsap.to(this.orbitPath.material, {
            opacity: 1,
            overwrite: true,
            duration: .8,
            ease: 'cubic.out'
        })
    }

    blur(op?:number) {
        if(!this._active) return;
        let opacity = this.mode === 0 ? DEFAULT_PATH_ALPHA : OBJECT_PATH_ALPHA;
        if(this.data.id === 'sol') return;
        if(op !== undefined) opacity = op;
        this.orbitPath.ellipse.visible = true;
        gsap.to(this.orbitPath.material, {
            opacity,
            overwrite: true,
            duration: .8,
            ease: 'cubic.out',
            onComplete: () => {
                this.orbitPath.ellipse.visible = opacity > .001;
            }
        })
    }

    set selected(value:boolean) {
        if(!this._active) return;
        this._selected = value;
        if(this._selected) this.focus();
        else this.blur();
        // this.orbitPath.selected = value;
        // this.material.selected = value;
    }

    get selected():boolean {
        return this._selected;
    }

    hidePath() {
        this.blur(0);
    }

}
