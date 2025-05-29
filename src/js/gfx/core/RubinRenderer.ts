import { RTUtils } from "@fils/gfx";
import { Camera, MeshBasicMaterial, Scene, WebGLRenderer, WebGLRenderTarget } from "three";

const SCREEN_MAT = new MeshBasicMaterial();

export class RubinRenderer {
  sceneRT:WebGLRenderTarget;
  glowRT:WebGLRenderTarget;

  constructor(protected rnd:WebGLRenderer) {
    const w = rnd.domElement.width;
    const h = rnd.domElement.height;

    console.log(w, h, window.innerWidth, window.innerHeight);

    this.sceneRT = new WebGLRenderTarget(w, h, {
      samples: 4,
      count: 1,
      colorSpace: rnd.outputColorSpace
    })

    this.glowRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 2,
      colorSpace: rnd.outputColorSpace
    })

    // this.sceneRT.texture

    const rs = new ResizeObserver( entries => {
      // console.log(rnd.domElement.width, rnd.domElement.height);
      this.sceneRT.setSize(rnd.domElement.width, rnd.domElement.height);
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
    
    // 3. release renderer
    this.rnd.setRenderTarget(null);

    // Render to screen
    SCREEN_MAT.map = this.sceneRT.texture;
    RTUtils.renderToViewport(this.rnd, SCREEN_MAT);
  }
}