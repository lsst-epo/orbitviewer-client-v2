import { CanvasDOMLayer, CanvasLayer } from "@fils/gl-dom";
import { Solar3DElement } from "./solar/Solar3DElement";
import { SolarDOMElement } from "./solar/SolarDomElement";

export class Debug2DCanvas extends CanvasLayer {
  blockers:Solar3DElement[] = [];
  items:SolarDOMElement[] = [];

  constructor(_gl:CanvasDOMLayer) {
    super(_gl);
  }

  add(el:Solar3DElement) {
    this.blockers.push(el);
  }

  addItem(item:SolarDOMElement) {
    this.items.push(item);
  }

  protected renderProgram(ctx: CanvasRenderingContext2D): void {
    const w = this.gl.rect.width;
    const h = this.gl.rect.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff0";
    ctx.beginPath();

    for(const item of this.blockers) {
      if(!item.isCollider()) continue;
      const r = item.rect;
      ctx.rect(r.x, r.y, r.width, r.height);
    }

    ctx.stroke();

    ctx.strokeStyle = "#f0f";
    ctx.beginPath();
    for(const item of this.items) {
      if(!item.ref.enabled) continue;
      const r = item.rect;
      // console.log(r);
      if(!r) continue;
      ctx.rect(r.x, r.y, r.width, r.height);
    }
    ctx.stroke();
    
    ctx.restore();
  }
}