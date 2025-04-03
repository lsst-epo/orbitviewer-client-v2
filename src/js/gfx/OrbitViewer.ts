import { ThreeDOMLayer, ThreeLayer } from "@fils/gl-dom";
import { PerspectiveCamera } from "three";
import { SolarParticles } from "./solar/SolarParticles";
import { OrbitElements } from "../core/solar/SolarSystem";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class OrbitViewer extends ThreeLayer {
    camera:PerspectiveCamera;
    particles:SolarParticles;
    controls:OrbitControls;

    constructor(_gl:ThreeDOMLayer) {
        super(_gl);
        const w = this.gl.rect.width;
        const h = this.gl.rect.height;
        this.camera = new PerspectiveCamera(35, w/h, .1, 20000);
        this.scene.add(this.camera);
        this.params.camera = this.camera;

        this.camera.position.y = 500;
        this.camera.position.z = 3000;
        this.controls = new OrbitControls(this.camera, _gl.dom);

        this.particles = new SolarParticles();
        this.particles.init(_gl.renderer);

        this.scene.add(this.particles.points);
        this.scene.add(this.particles.mesh);
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
        this.controls.update();
        this.particles.update(d, this.camera);
    }
}