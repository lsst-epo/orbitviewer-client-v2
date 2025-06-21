import { CanvasDOMLayer, CanvasLayer } from "@fils/gl-dom";
import { Solar3DElement } from "./solar/Solar3DElement";

export class Debug2DCanvas extends CanvasLayer {
  items:Solar3DElement[] = [];

  constructor(_gl:CanvasDOMLayer) {
    super(_gl);
  }

  add(el:Solar3DElement) {
    this.items.push(el);
  }

  protected renderProgram(ctx: CanvasRenderingContext2D): void {
    const w = this.gl.rect.width;
    const h = this.gl.rect.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff0";
    ctx.beginPath();

    for(const item of this.items) {
      if(!item.isCollider()) continue;
      const r = item.rect;
      ctx.rect(r.x, r.y, r.width, r.height);
    }

    ctx.stroke();
    
    ctx.restore();
  }
}