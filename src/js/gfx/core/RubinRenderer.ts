import { RTUtils } from "@fils/gfx";
import { BlurPass, BlurSettings } from "@fils/vfx";
import { Camera, MeshBasicMaterial, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget } from "three";

const SCREEN_MAT = new MeshBasicMaterial();

const GLOW:BlurSettings = {
  scale: .5,
  radius: 1,
  quality: 2,
  iterations: 4
}

import vertexShader from "../../../glsl/vfx/comp.vert";
import fragmentShader from "../../../glsl/vfx/comp.frag";

const COMP = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    scene: { value: null },
    glow: { value: null },
    glowBlurred: { value: null }
  }
})

export class RubinRenderer {
  sceneRT:WebGLRenderTarget;
  glowRT:WebGLRenderTarget;
  glowBlur:BlurPass;

  compRT:WebGLRenderTarget;

  constructor(protected rnd:WebGLRenderer) {
    const w = rnd.domElement.width;
    const h = rnd.domElement.height;

    console.log(w, h, window.innerWidth, window.innerHeight);

    this.sceneRT = new WebGLRenderTarget(w, h, {
      samples: 4,
      count: 1,
      colorSpace: rnd.outputColorSpace
    });

    this.glowRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 2,
      colorSpace: rnd.outputColorSpace
    });

    this.glowBlur = new BlurPass(this.glowRT.textures[1], w, h, GLOW);
    this.glowBlur.target.texture.colorSpace = rnd.outputColorSpace;
    this.glowBlur.write.texture.colorSpace = rnd.outputColorSpace;

    this.compRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 1,
      colorSpace: rnd.outputColorSpace
    });

    // this.sceneRT.texture

    const rs = new ResizeObserver( entries => {
      // console.log(rnd.domElement.width, rnd.domElement.height);
      this.sceneRT.setSize(rnd.domElement.width, rnd.domElement.height);
      this.glowRT.setSize(rnd.domElement.width, rnd.domElement.height);
      this.glowBlur.setSize(rnd.domElement.width, rnd.domElement.height);
      this.compRT.setSize(rnd.domElement.width, rnd.domElement.height);
    });

    rs.observe(rnd.domElement);
  }

  render(scene:Scene, camera:Camera) {
    // 1. Render scene
    this.rnd.setRenderTarget(this.sceneRT);
    this.rnd.render(scene, camera);

    // 2. render glow
    this.rnd.setRenderTarget(this.glowRT);
    const bg = scene.background;
    scene.background = null;
    this.rnd.render(scene, camera);
    scene.background = bg;

    // 3. blur glow
    this.glowBlur.renderInternal(this.rnd);

    // 4. composition
    COMP.uniforms.scene.value = this.sceneRT.texture;
    COMP.uniforms.glow.value = this.glowRT.textures[1];
    COMP.uniforms.glowBlurred.value = this.glowBlur.texture;
    RTUtils.renderToRT(this.compRT, this.rnd, COMP);
    
    // release renderer
    this.rnd.setRenderTarget(null);

    // 5. Render to screen
    SCREEN_MAT.map = this.compRT.texture;
    RTUtils.renderToViewport(this.rnd, SCREEN_MAT);
  }
}