import { MathUtils } from "@fils/math";
import { Color, Mesh, Object3D, ShaderMaterial, SphereGeometry, Vector3 } from "three";
// import { CameraManager } from "../core/CameraManager";
// import { SunMaterial } from "../gfx/SunMaterial";
import { InteractiveObject } from "./SolarElement";
// import { P_MAT, SunParticles } from "./SunParticles";
import { PLANET_SCALE } from "../../core/solar/Planet";
import { KM2AU, SUN_RADIUS } from "../../core/solar/SolarSystem";
import { GLOBALS } from "../../core/Globals";

import vertexShader from "../../../glsl/lib/sun.vert";
import fragmentShader from "../../../glsl/lib/sun.frag";

const GEO = new SphereGeometry(1, 32, 32);
const R = SUN_RADIUS * KM2AU * PLANET_SCALE;

export const SUN_SCALE = {
    min: R,
    max: R
}

const SUN_MAT = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        time: {
            value: 0
        },
        color1: {
            value: new Color(0xF4B681)
        },
        color2: {
            value: new Color(0xE78557)
        },
        fresnelWidth: {
            value: 4
        },
        brightness: {
            value: 3
        }
    },
    transparent: true
});

/**
 * GFX Asset for the Sun
 */
export class Sun extends Object3D implements InteractiveObject {
    mesh:Mesh;
    // particles:SunParticles;
    selected:boolean = false;
    target:Object3D = this;
    lockedDistance = {
      min: 15,
      max: 25
    };
    lockedOffset:Vector3 = new Vector3()
    closeUp: boolean = true;

    constructor() {
        super();

        this.scale.setScalar(R);

        this.mesh = new Mesh(
            GEO,
            SUN_MAT
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

    update() {
        const t = GLOBALS.solarClock.time;
        SUN_MAT.uniforms.time.value = t;
        
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