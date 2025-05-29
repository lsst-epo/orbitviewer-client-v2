import { ColorRepresentation, DoubleSide, Mesh, MeshPhongMaterial, MeshStandardMaterial, SphereGeometry, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { isPortrait } from "../../production/utils/Helpers";
// import { PlanetMaterial, PlanetMaterialParameters } from "../gfx/PlanetMaterial";
// import { initMaterial } from "../gfx/ShaderLib";
import { SolarElement, SolarElementOptions } from "./SolarElement";
import { cloneOrbitElements, DEG_TO_RAD, KM2AU, OrbitElements } from "../../core/solar/SolarSystem";
import { PLANET_SCALE, PlanetCameraLock } from "../../core/solar/Planet";
import { PlanetTextureMap } from "./PlanetAssets";
import { PlanetMaterial, PlanetMaterialParameters } from "../planets/PlanetMaterial";
import { GLOBALS } from "../../core/Globals";

export const PLANET_GEO = new SphereGeometry(1, 64, 32);
const tLoader = new TextureLoader();

export type PlanetId = 'mercury'|'venus'|'earth'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune';

const gltfLoader = new GLTFLoader();

// const L_DUMMY = initMaterial(new LineBasicMaterial({
//     color: 0xff0000
// }));


export class Planet extends SolarElement {
    material: PlanetMaterial;
	mesh: Mesh;

    rotationSpeed:number;
    type:PlanetId;

	constructor(id: PlanetId, _data: OrbitElements, opts: SolarElementOptions = {}) {
		super(id, _data, opts);

        this.initMaterial(opts);

		this.mesh = new Mesh(PLANET_GEO, this.material);

		this.parent.add(this.mesh);

		this.closeUp = true;

		if (PlanetCameraLock[id]) {
			this.lockedDistance = PlanetCameraLock[id];
		}

        // console.log(PlanetRadiusMap[this.type] * KM2AU);
        PlanetDataMap[this.type] = cloneOrbitElements(_data);
        let scl = PlanetRadiusMap[this.type] * KM2AU * PLANET_SCALE * 100;
        this.scale.set(scl, scl, scl);
        // correct fresnel

        if(id === 'saturn') {
            // console.log('Houston, we\'ve got Saturn!');
			gltfLoader.load('/assets/models/ring.glb', (gltf) => {
				// console.log(gltf.scene);
				gltf.scene.scale.setScalar(2);
				const mesh = gltf.scene.children[0] as Mesh;
				mesh.material = new MeshStandardMaterial({
					side: DoubleSide,
					transparent: true,
					depthWrite: false,
					map: PlanetTextureMap.saturn.ring
				});
				this.mesh.add(gltf.scene);
			});
        }

        // this.rotationSpeed = Random.randf(-1, 1);
        const rt = PlanetRotationMap[this.type] as PlanetRotationData;
        this.rotationSpeed = DEG_TO_RAD * (360 / rt.period);
        this.parent.rotation.z = DEG_TO_RAD * -(rt.axialTilt + _data.i);

    }

    initMaterial(opts?: SolarElementOptions): PlanetMaterial {
        const s = PlanetShaderSettings[this.type];

        const opts2:PlanetMaterialParameters = {
            // fresnelColor: s.fresnelColor,
            // fresnelWidth: s.fresnelWidth,
            // sunIntensity: s.sunIntensity
        };

        if(this.type === 'earth') {
            opts2.nightMap = tLoader.load(`/assets/textures/${this.type}_night.webp`);
            // opts2.cloudsMap = tLoader.load(`/assets/textures/${this.type}_clouds.webp`);
            opts2.cloudsMap = GLOBALS.clouds.texture;
        }

        this.material = new PlanetMaterial({
            color: opts.color ? opts.color : 0xffffff,
            roughness: 1,
			metalness: 0,
            map: PlanetTextureMap[this.type].map
        }, opts2, this.type === "earth");

        if(this.type === 'earth') {
            this.material.normalMap = tLoader.load(`/assets/textures/${this.type}_normal.webp`);
        }

        return this.material;
    }

    // get lockedDistance():number {
    //     const lock = isPortrait() ? PlanetLockedMapPortrait[this.type] : PlanetLockedMap[this.type];
    //     return lock.distance;
    // }

    // get lockedOffset():Vector3 {
    //     const lock = isPortrait() ? PlanetLockedMapPortrait[this.type] : PlanetLockedMap[this.type];
    //     return lock.offset;
    // }

    update(d:number) {
        super.update(d);
        const rt = PlanetRotationMap[this.type] as PlanetRotationData;
        this.mesh.rotation.y = rt.meridian * DEG_TO_RAD + d * this.rotationSpeed;
        this.material.update();
    }

}

export const PlanetRadiusMap:Record<PlanetId,number> = {
    'mercury': 2440,
    'venus': 6052,
    'earth': 6371,
    'mars': 3390,
    'jupiter': 69911,
    'saturn': 58232,
    'uranus': 25360,
    'neptune': 24620
}

export type PlanetRotationData = {
    axialTilt:number;
    period:number;
    meridian:number;
}

export const PlanetRotationMap:Record<PlanetId, PlanetRotationData> = {
    mercury: {
        axialTilt: 0.034,
        period: 58.6462,
        meridian: 329.5988
    },
    venus: {
        axialTilt: 177.36,
        period: 243.018,
        meridian: 160.20
    },
    earth: {
        axialTilt: 23.4392811,
        period: 1,
        meridian: 0
    },
    mars: {
        axialTilt: 25.19,
        period: 1.02595676,
        meridian: 176.049863
    },
    jupiter: {
        axialTilt: 3.13,
        period: 0.41354,
        meridian: 284.95
    },
    saturn: {
        axialTilt: 26.73,
        period: 0.44401,
        meridian: 38.90
    },
    uranus: {
        axialTilt: 97.77,
        period: 0.71833,
        meridian: 203.81
    },
    neptune: {
        axialTilt: 28.32,
        period: 0.67125,
        meridian: 249.978
    }
}

export type ShaderSettings = {
    fresnelWidth: number;
    fresnelColor: ColorRepresentation;
    sunIntensity:number;
}

export const PlanetShaderSettings:Record<PlanetId,ShaderSettings> = {
    mercury: {
        fresnelColor: 0x010111,
        fresnelWidth: .002,
        sunIntensity: 7.5
    },
    venus: {
        fresnelColor: 0x010111,
        fresnelWidth: .004,
        sunIntensity: 1.5
    },
    earth: {
        fresnelColor: 0x010133,
        fresnelWidth: .005,
        sunIntensity: 2.5
    },
    mars: {
        fresnelColor: 0x330101,
        fresnelWidth: .004,
        sunIntensity: 2.5
    },
    jupiter: {
        fresnelColor: 0x000000,
        fresnelWidth: .04,
        sunIntensity: 0.5
    },
    saturn: {
        fresnelColor: 0x010101,
        fresnelWidth: .04,
        sunIntensity: .5
    },
    uranus: {
        fresnelColor: 0x000000,
        fresnelWidth: .1,
        sunIntensity: 0.25
    },
    neptune: {
        fresnelColor: 0x010111,
        fresnelWidth: .1,
        sunIntensity: .2
    }
}

export type CameraLockPosition = {
    distance: number;
    offset: Vector3;
}

export const PlanetLockedMap:Record<PlanetId,CameraLockPosition> = {
    mercury: {
        distance: .015,
        offset: new Vector3(.0015, .0015, 0) // Ok
    },
    venus: {
        distance: .033,
        offset: new Vector3(.001, .0025, 0) // OK
    },
    earth: {
        distance: .03,
        offset: new Vector3(.0025, .005, 0) // Ok
    },
    mars: {
        distance: .02,
        offset: new Vector3(.005, .0025, 0) // Ok
    },
    jupiter: {
        distance: .5,
        offset: new Vector3(-.05, .06, 0) // Ok
    },
    saturn: {
        distance: .35,
        offset: new Vector3(-.025, -.04, 0) // Ok
    },
    uranus: {
        distance: .15,
        offset: new Vector3(-.01, .02, 0) // ok
    },
    neptune: {
        distance: .15,
        offset: new Vector3(-.009, .02, 0)
    }
}

export const PlanetLockedMapPortrait:Record<PlanetId,CameraLockPosition> = {
    mercury: {
        distance: .025,
        offset: new Vector3(0, -0.005, 0)
    },
    venus: {
        distance: .038,
        offset: new Vector3(0, -0.005, 0)
    },
    earth: {
        distance: .038,
        offset: new Vector3(0, -0.005, 0)
    },
    mars: {
        distance: .03,
        offset: new Vector3(0, -0.005, 0)
    },
    jupiter: {
        distance: .45,
        offset: new Vector3(0, -0.07, 0)
    },
    saturn: {
        distance: .5,
        offset: new Vector3(0, -0.08, 0)
    },
    uranus: {
        distance: .2,
        offset: new Vector3(0, -0.03, 0)
    },
    neptune: {
        distance: .2,
        offset: new Vector3(0.02, -0.04, 0)
    }
}

export const PlanetDataMap:Record<PlanetId,OrbitElements> = {
    earth: null,
    mercury: null,
    venus: null,
    mars: null,
    jupiter: null,
    saturn: null,
    uranus: null,
    neptune: null
}
