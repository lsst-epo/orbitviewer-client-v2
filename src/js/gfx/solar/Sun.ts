import { MathUtils } from "@fils/math";
import { Mesh, Object3D, SphereGeometry, Vector3 } from "three";
// import { CameraManager } from "../core/CameraManager";
// import { SunMaterial } from "../gfx/SunMaterial";
import { InteractiveObject } from "./SolarElement";
// import { P_MAT, SunParticles } from "./SunParticles";
import { PLANET_SCALE } from "../../core/solar/Planet";
import { KM2AU, SUN_RADIUS } from "../../core/solar/SolarSystem";
import { GLOBALS } from "../../core/Globals";

const GEO = new SphereGeometry(1, 32, 32);
const R = SUN_RADIUS * KM2AU * PLANET_SCALE;

export const SUN_SCALE = {
    min: R,
    max: R
}

/**
 * GFX Asset for the Sun
 */
export class Sun extends Object3D implements InteractiveObject {
    mesh:Mesh;
    // particles:SunParticles;
    selected:boolean = false;
    target:Object3D = this;
    lockedDistance = {
      min: 4.6,
      max: 6
    };
    lockedOffset:Vector3 = new Vector3()
    closeUp: boolean = true;

    constructor() {
        super();

        this.scale.setScalar(R);

        this.mesh = new Mesh(
            GEO,
            new SunMaterial({
                emissive: 0xff6600,
                emissiveIntensity: 1.5
            })
        );

        this.add(this.mesh);

        // this.particles = new SunParticles(1.1, this.scale.x * .15);
        // this.add(this.particles.mesh);
    }

    set highlight(value:boolean) {
        /* gsap.killTweensOf(this.scale);
        const scl = value ? SUN_SCALE.max : SUN_SCALE.min;
        gsap.to(this.scale, {x: scl, y: scl, z: scl, ease: 'power2.inOut', duration: 3}); */
        this.selected = value;
    }

    update(time:number) {
        const t = GLOBALS.solarClock.time;
        
        // const sel = this.selected;

        /* const cd = MathUtils.smoothstep(10, 10000, camPos.length());
        sunMat.emissiveIntensity = MathUtils.lerp(sunMat.emissiveIntensity, sel ? MathUtils.lerp(1.8, 100, cd) : 1.6, .016);
        const scl = SUN_RADIUS * KM2AU * PLANET_SCALE * MathUtils.lerp(1, sel ? 50 : 5, cd);
        const s = MathUtils.lerp(this.scale.x, scl, .016);
        this.scale.setScalar(scl);
        let pscl = MathUtils.lerp(
            this.particles.mesh.scale.x,
            sel ? MathUtils.lerp(1.1,1.6,MathUtils.smoothstep(10, 20, camPos.length())) : 1.1,
            .16
        );
        this.particles.mesh.scale.setScalar(pscl);
        P_MAT.uniforms.glowStrength.value = MathUtils.lerp(
            P_MAT.uniforms.glowStrength.value,
            sel ? 5 : 3,
            .016
        );
        P_MAT.uniforms.highlighted.value = MathUtils.lerp(
            P_MAT.uniforms.highlighted.value,
            sel ? 1 : 0,
            .016
        ); */
    }
}