import { ShaderMaterial, Texture, WebGLRenderer, WebGLRenderTarget } from "three";

const WIDTH = 1024;
const HEIGHT = WIDTH / 2;

import vertexShader from '../../../glsl/lib/earth_clouds.vert';
import fragmentShader from '../../../glsl/lib/earth_clouds.frag';
import { RTUtils } from "@fils/gfx";
import { GLOBALS } from "../../core/Globals";
import { tLoader } from "../solar/PlanetAssets";
import { GFXTier } from "../core/RubinRenderer";

const MAT = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: {
      value: 0
    },
    map: {
      value: tLoader.load(`/assets/textures/earth_clouds.webp`)
    }
  }
})

export class EarthClouds {
  rt:WebGLRenderTarget;

  needsUpdate:boolean = true;
  forceRender:boolean = true;

  previousTime:number = -Infinity;

  constructor() {
    this.rt = new WebGLRenderTarget(WIDTH, HEIGHT, {
      samples: 1
    });
  }

  get texture():Texture {
    return this.rt.texture;
  }

  setTier(tier:GFXTier) {
    this.rt.setSize(
      tier.cloudsWidth,
      tier.cloudsWidth / 2
    )
    this.forceRender = true;
  }

  render(rnd:WebGLRenderer) {
    if(!this.needsUpdate && !this.forceRender) return;
    this.needsUpdate = false;
    if(!this.forceRender && Math.abs(GLOBALS.solarClock.time - this.previousTime) < 100) return;
    this.previousTime = GLOBALS.solarClock.time;
    MAT.uniforms.time.value = GLOBALS.solarClock.time;
    // console.log('render clouds')
    RTUtils.renderToRT(this.rt, rnd, MAT);
    rnd.setRenderTarget(null);
    this.forceRender = false;
  }
}