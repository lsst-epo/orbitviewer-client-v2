import { RTUtils } from "@fils/gfx";
import { Camera, MeshBasicMaterial, Scene, WebGLRenderer, WebGLRenderTarget } from "three";

const SCREEN_MAT = new MeshBasicMaterial();

export class RubinRenderer {
  sceneRT:WebGLRenderTarget;

  constructor(protected rnd:WebGLRenderer) {
    const w = rnd.domElement.width;
    const h = rnd.domElement.height;

    console.log(w, h, window.innerWidth, window.innerHeight);

    this.sceneRT = new WebGLRenderTarget(w, h, {
      samples: 4,
      count: 1,
      colorSpace: "srgb"
    })

    // this.sceneRT.texture

    const rs = new ResizeObserver( entries => {
      // console.log(rnd.domElement.width, rnd.domElement.height);
      this.sceneRT.setSize(rnd.domElement.width, rnd.domElement.height);
    });

    rs.observe(rnd.domElement);
  }

  render(scene:Scene, camera:Camera) {
    this.rnd.setRenderTarget(this.sceneRT);
    this.rnd.render(scene, camera);
    this.rnd.setRenderTarget(null);
    // RTUtils.drawRT(this.sceneRT, this.rnd, 0, 0);
    SCREEN_MAT.map = this.sceneRT.texture;
    RTUtils.renderToViewport(this.rnd, SCREEN_MAT);
  }
}