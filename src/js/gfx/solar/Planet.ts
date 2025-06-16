import { Color, ColorRepresentation, DoubleSide, Mesh, ShaderMaterial, SphereGeometry, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { isPortrait } from "../../production/utils/Helpers";
// import { PlanetMaterial, PlanetMaterialParameters } from "../gfx/PlanetMaterial";
// import { initMaterial } from "../gfx/ShaderLib";
import { GLOBALS } from "../../core/Globals";
import { PLANET_SCALE, PlanetCameraLock } from "../../core/solar/Planet";
import { cloneOrbitElements, DEG_TO_RAD, KM2AU, OrbitElements } from "../../core/solar/SolarSystem";
import { PlanetMaterial, PlanetMaterialParameters } from "../planets/PlanetMaterial";
import { PlanetTextureMap } from "./PlanetAssets";
import { SolarElement, SolarElementOptions } from "./SolarElement";

export const PLANET_GEO = new SphereGeometry(1, 64, 32);
const tLoader = new TextureLoader();

export type PlanetId = 'mercury'|'venus'|'earth'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune';

const gltfLoader = new GLTFLoader();

// const L_DUMMY = initMaterial(new LineBasicMaterial({
//     color: 0xff0000
// }));

import fragmentShader from "../../../glsl/lib/atmosphere.frag";
import vertexShader from "../../../glsl/lib/atmosphere.vert";

export function getAtmosphereMaterial(color1:ColorRepresentation, color2:ColorRepresentation, fresnelWidth:number=1, brightness:number=1.5):ShaderMaterial {
    return new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            color1: {
                value: new Color(color1)
            },
            color2: {
                value: new Color(color2)
            },
            fresnelWidth: {
                value: fresnelWidth
            },
            brightness: {
                value: brightness
            }
        },
        transparent: true,
        depthWrite: false
    })
}


export class Planet extends SolarElement {
    material: PlanetMaterial;
	mesh: Mesh;

    rotationSpeed:number;
    type:PlanetId;

    // hasAtmosphere:boolean = false;
    atmosphere:Mesh;
    atmosphereMaterial:ShaderMaterial;

	constructor(id: PlanetId, _data: OrbitElements, opts: SolarElementOptions = {}) {
		super(id, _data, opts);

        this.offsetDesktop.set(-4, 0, 0);

        this.initMaterial(opts);

		this.mesh = new Mesh(PLANET_GEO, this.material);

		this.parent.add(this.mesh);

		this.closeUp = true;

		if (PlanetCameraLock[id]) {
			this.lockedDistance = PlanetCameraLock[id];
		}

        // console.log(PlanetRadiusMap[this.type] * KM2AU);
        PlanetDataMap[this.type] = cloneOrbitElements(_data);
        const scl = PlanetRadiusMap[this.type] * KM2AU * PLANET_SCALE * 100;
        this.scale.set(scl, scl, scl);
        // correct fresnel

        if(id === 'saturn') {
            // console.log('Houston, we\'ve got Saturn!');
			gltfLoader.load('/assets/models/ring.glb', (gltf) => {
				// console.log(gltf.scene);
				gltf.scene.scale.setScalar(2);
				const mesh = gltf.scene.children[0] as Mesh;
				mesh.material = new PlanetMaterial({
					side: DoubleSide,
					transparent: true,
					depthWrite: false,
					map: PlanetTextureMap.saturn.ring
				});
				this.mesh.add(gltf.scene);
			});
        }

        // add atmosphere
        this.initAtmosphere(id);

        // this.rotationSpeed = Random.randf(-1, 1);
        const rt = PlanetRotationMap[this.type] as PlanetRotationData;
        this.rotationSpeed = DEG_TO_RAD * (360 / rt.period);
        this.parent.rotation.z = DEG_TO_RAD * -(rt.axialTilt + _data.i);

        this.orbitPath.setPathOptions({
            isPlanet: true,
            planetPosition: this.position,
            fadeDistance: this.scale.x
        })

        this.visible = false;

    }

    initAtmosphere(id:PlanetId) {
        const opts = PlanetAtmosphereSettings[id];
        this.atmosphereMaterial = getAtmosphereMaterial(opts.color1, opts.color2, opts.fresnelWidth * PLANET_SCALE / 1000, opts.brightness);
        this.atmosphere = new Mesh(PLANET_GEO, this.atmosphereMaterial);
        this.atmosphere.scale.setScalar(opts.scale);
        this.parent.add(this.atmosphere);
    }

    initMaterial(opts?: SolarElementOptions): PlanetMaterial {
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
            this.material.normalScale.set(4, 4);
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
        // if(!this.orbitPath.material.ref) return;
        // console.log(this.position === this.orbitPath.material.ref.uniforms.planetPosition.value);
        // calculateOrbitByType(this.data, d-.00000000000000001, OrbitType.Elliptical, this.offsetDesktop);
        // if(!this.hasAtmosphere) return;
        // this.atmosphereMaterial.uniforms.time.value = GLOBALS.solarClock.time;
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
        period: 0.9972685185,
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

export type AtmosphereSettings = {
    fresnelWidth: number;
    scale: number;
    color1: ColorRepresentation;
    color2: ColorRepresentation;
    brightness:number;
}

export const PlanetAtmosphereSettings:Record<PlanetId,AtmosphereSettings> = {
    mercury: {
        color1: 0xFFFFFF,
        color2: 0xeeeeee,
        fresnelWidth: .2,
        scale: 1.005,
        brightness: 1.75
    },
    venus: {
        color1: 0xFFFF33,
        color2: 0xF4B681,
        fresnelWidth: .6,
        scale: 1.01,
        brightness: 1.5
    },
    earth: {
        color1: 0x0022EE,
        color2: 0xAAFFFF,
        fresnelWidth: 1.35,
        scale: 1.05,
        brightness: 3.5
    },
    mars: {
        color1: 0xFF3333,
        color2: 0xF4B681,
        fresnelWidth: .25,
        scale: 1.005,
        brightness: 3.6
    },
    jupiter: {
        color1: 0xFF6633,
        color2: 0xCCCC33,
        fresnelWidth: 5,
        scale: 1.006,
        brightness: 1.5
    },
    saturn: {
        color1: 0x9966FF,
        color2: 0xCCCCFF,
        fresnelWidth: 6,
        scale: 1.008,
        brightness: 1.5
    },
    uranus: {
        color1: 0x74E6AF,
        color2: 0xeeeeee,
        fresnelWidth: 5,
        scale: 1.02,
        brightness: 1.5
    },
    neptune: {
        color1: 0x3333FF,
        color2: 0xFF0000,
        fresnelWidth: 5,
        scale: 1.04,
        brightness: 1.5
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
