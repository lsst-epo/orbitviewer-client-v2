import { ThreeDOMLayer, ThreeLayer } from "@fils/gl-dom";
import { AmbientLight, Object3D, PerspectiveCamera, PointLight, PointLightHelper, WebGLRenderTarget } from "three";
import { OrbitElements, SolarCategory } from "../core/solar/SolarSystem";
import { SolarParticles } from "./solar/SolarParticles";

import gsap from "gsap";
import { CLOCK_SETTINGS, GLOBALS } from "../core/Globals";
import { PlanetId } from "../core/solar/Planet";
import { JD2MJD } from "../core/solar/SolarTime";
import { mapOrbitElements, mapOrbitElementsV2, OrbitDataElements, OrbitDataElementsV2 } from "../core/solar/SolarUtils";
import { RubinRenderer } from "./core/RubinRenderer";
import { Planet } from "./solar/Planet";
import { InteractiveObject, SolarElement } from "./solar/SolarElement";
import { Sun } from "./solar/Sun";

// import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { LoadManager } from "../core/data/LoadManager";
import { SolarItemUI } from "../layers/SolarItemsUI";
import { CameraManager, camOcluders, DEFAULT_CAM_LIMITS } from "./core/CameraManager";

export interface FollowTarget {
	target: InteractiveObject;
	alpha: number;
}

export const NEAR = 5000;
export const FAR = 75000;

const dummy = new Object3D();

export class OrbitViewer extends ThreeLayer {
  camera:PerspectiveCamera;
  particles:SolarParticles;
  
	controls:CameraManager;

	ambientLight: AmbientLight;
	sunLight: PointLight;
	sunLightHelper: PointLightHelper;

	// lensFlare:Lensflare;

	solarElements:Array<SolarElement> = []

	sun:Sun;
	earth:Planet;

	solarItemsUI:SolarItemUI;

	cameraTarget: FollowTarget = {
		target: null,
		alpha: .016
	};

	vfx:RubinRenderer;
	useVFX:boolean = true;

    constructor(_gl:ThreeDOMLayer) {
      super(_gl);
      const w = this.gl.rect.width;
      const h = this.gl.rect.height;
      this.camera = new PerspectiveCamera(35, w/h, .01, DEFAULT_CAM_LIMITS.maxDistance);
      this.scene.add(this.camera);
      this.params.camera = this.camera;

      this.camera.position.y = 5000;
      this.camera.position.z = 10000;
			this.controls = new CameraManager(this.camera, _gl.renderer.domElement);
      
			// console.log(this.controls.minDistance, this.controls.maxDistance)
			// this.controls.autoRotate = true;
			// this.controls.autoRotateSpeed = .25;

			window['cam'] = this.camera;

			this.vfx = new RubinRenderer(_gl.renderer);

      this.particles = new SolarParticles();
      this.particles.init(_gl.renderer);

      // this.scene.add(this.particles.points);
      this.scene.add(this.particles.mesh);
			// this.particles.mesh.visible = false;

			this.sun = new Sun();
			this.scene.add(this.sun);
			camOcluders.push(this.sun);

      this.sunLight = new PointLight(0xffffff, 1, 0, 0);
      this.scene.add(this.sunLight);
      this.sunLightHelper = new PointLightHelper(this.sunLight, 100);
      
			/* this.lensFlare = new Lensflare();
			
			const textureFlare0 = tLoader.load( "/assets/textures/lensflare0.png" );
			const textureFlare1 = tLoader.load( "/assets/textures/lensflare1.png" );
			const textureFlare2 = tLoader.load( "/assets/textures/lensflare2.png" );
			const textureFlare3 = tLoader.load( "/assets/textures/lensflare3.png" );

			this.lensFlare.addElement( new LensflareElement( textureFlare0, 512, 0 ) );
			this.lensFlare.addElement( new LensflareElement( textureFlare1, 512, 0 ) );
			this.lensFlare.addElement( new LensflareElement( textureFlare2, 512, 0.5 ) );
			this.lensFlare.addElement( new LensflareElement( textureFlare3, 60, 0.96 ) );

			this.sunLight.add(this.lensFlare); */
			
			// this.sunLightHelper.visible = false;
      // this.scene.add(this.sunLightHelper);

			this.solarItemsUI = new SolarItemUI();

      this.ambientLight = new AmbientLight(0xffffff, 0.05);
      this.scene.add(this.ambientLight);

			this.scene.fog = GLOBALS.fog;

			GLOBALS.viewer = this;
    }

		fadeIn() {
			if(GLOBALS.fog.far === FAR) return;
			gsap.to(GLOBALS.fog, {
				far: FAR,
				overwrite: true,
				duration: 5,
				ease: 'cubic.inOut'
			});
		}

		goToLandingMode() {
			this.fadeIn();
			this.controls.followTarget(this.sun, true);
			
			// dummy.lookAt(this.earth.position);
			// dummy.updateMatrix();
			dummy.rotation.set(-3.0288209992191786, -1.018007295096466, -3.045504707405481);
			this.controls.setRotation(dummy.rotation);

			gsap.to(CLOCK_SETTINGS, {
				speed: 100,
				overwrite: true,
				duration: 5,
				ease: 'expo.inOut'
			});

			this.solarItemsUI.hide();
		}

		goToOrbitViewerMode(goLive:boolean=false) {
			this.fadeIn();
			this.controls.releaseCameraTarget();
			gsap.killTweensOf(CLOCK_SETTINGS);
			if(goLive) GLOBALS.solarClock.goLive();

			this.solarItemsUI.show();
		}

		centerView() {
			this.controls.centerView();
		}

    hidePaths() {
    	for (const item of this.solarElements) {
				item.orbitPath.ellipse.visible = false;
     	}
    }

    showPaths() {
    	for (const item of this.solarElements) {
				item.orbitPath.ellipse.visible = true;
     	}
    }

		createDwarfPlanets(d:Array<OrbitDataElements>) {
			for(const el of d) {
        el.tperi = JD2MJD(el.tperi);

				const mel = mapOrbitElements(el);
        mel.category = 'planets-moons';
            
				const planet = new SolarElement(el.id, mel, {
          color: 0xFA6868
				});

        this.addElementToScene(planet);
		}

	}

    createSolarItems(){
        const solarItems = LoadManager.craftData.solar_items;
				const sample = LoadManager.data.sample;
				const len = sample.length;

				for(const el of solarItems) {
					if(el.title.toLowerCase() === 'sun' && el.elementCategory) {
						console.log('Add Sun');
						//to-do: add sun
					}
				}

				for(let i=0;i<len;i++) {
					for(const el of solarItems) {
						if(el.title.toLowerCase() === 'sun' && el.elementCategory) {
							continue;
						} else {
							const mel = el.elementCategory.length ? el.elementCategory[0] as SolarCategory : null;
							if(mel === 'planets-moons')  continue;
							// Look for solar item in sample
							const sel:OrbitDataElementsV2 = sample[i];
							// console.log(sel.mpcdesignation, el.elementID, sel.fulldesignation);
							if(sel.mpcdesignation === el.elementID || sel.fulldesignation === el.elementID) {
								console.log('Found Solar Item', el.elementID);
								if(el.elementCategory.length === 0) break;
								const data = mapOrbitElementsV2(sel);
								// console.log(data);
								//Add item...
								const element = new SolarElement(el.elementID, data);
								this.addElementToScene(element);
								break;
							}
						}
					}
				}
    }

    createPlanets(d:Array<OrbitDataElements>) {

      // Overwrite name so we can create fake items
			for(const el of d) {
      	el.tperi = JD2MJD(el.tperi);

				const mel = mapOrbitElements(el);
      	mel.category = 'planets-moons';

				const planet = new Planet(el.id as PlanetId, mel);

      	this.addElementToScene(planet);

				if(el.id === 'earth') {
					console.log("Houston, Houston: we've found the earth");
					this.earth = planet;
				}

      	// this.scene.add(planet.sunLine);
		}

		// this.followTarget(this.solarElements[7]);

		// this.hidePaths();
	}

	protected addElementToScene(element:SolarElement) {
		this.solarElements.push(element);
		this.solarItemsUI.addItem(element);
		this.scene.add(element);
		this.scene.add(element.orbitPath.ellipse);
	}

	followSolarElement(name:string) {
		for(const el of this.solarElements) {
			if(el.name === name) {
				this.fadeIn();
				this.solarItemsUI.hide();
				return this.controls.followTarget(el);
			}
		}
	}

	followPlanet(id:PlanetId) {
		for(const item of this.solarElements) {
			if(id === item.name) {
				console.log(`Follow: ${item.data.id}`);
				this.solarItemsUI.hide();
				return this.controls.followTarget(item);
			}
		}
	}

	releaseCameraTarget() {
		this.controls.releaseCameraTarget();
		this.solarItemsUI.show();
	}

	followSun() {
		this.controls.followTarget(this.sun);
		this.solarItemsUI.hide();
	}

    setTarget(target:WebGLRenderTarget)  {
        this.params.target = target;
    }

    setSize(width: number, height: number): void {
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();
    }

    setData(data:OrbitElements[]) {
        this.scene.remove(this.particles.mesh);
        this.particles.data = data;
        this.scene.add(this.particles.mesh);
    }

    /**
     * Updates Orbit Viewer Engine
     * @param time simulation time in seconds since start
     * @param d current simulation MJD
     */
    update(time:number, d:number) {
   		for (let i = 0, len = this.solarElements.length; i < len; i++) {
				this.solarElements[i].update(d);
			}

    	this.controls.update();

			this.sun.update();

      this.particles.update(d, this.camera);

			if(!this.earth) return;

			if(this.camera.position.distanceTo(this.earth.position) < 100) {
				GLOBALS.clouds.needsUpdate = true;
			}

			this.solarItemsUI.update();
    }

		render(): void {
			if(this.useVFX) this.vfx.render(this.scene, this.camera);
			else super.render();
		}
}
