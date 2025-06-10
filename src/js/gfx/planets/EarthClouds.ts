import { ShaderMaterial, Texture, WebGLRenderer, WebGLRenderTarget } from "three";

const WIDTH = 2048;
const HEIGHT = WIDTH / 2;

import vertexShader from '../../../glsl/lib/earth_clouds.vert';
import fragmentShader from '../../../glsl/lib/earth_clouds.frag';
import { RTUtils } from "@fils/gfx";
import { GLOBALS } from "../../core/Globals";
import { tLoader } from "../solar/PlanetAssets";

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

  constructor() {
    this.rt = new WebGLRenderTarget(WIDTH, HEIGHT, {
      samples: 1
    });
  }

  get texture():Texture {
    return this.rt.texture;
  }

  render(rnd:WebGLRenderer) {
    if(!this.needsUpdate) return;
    this.needsUpdate = false;
    MAT.uniforms.time.value = GLOBALS.solarClock.time;
    RTUtils.renderToRT(this.rt, rnd, MAT);
    rnd.setRenderTarget(null);
  }
}