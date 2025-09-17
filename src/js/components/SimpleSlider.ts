import { MathUtils } from "@fils/math";

export interface SliderListener {
  onChange(normalizedValue:number):void;
}

export class SimpleSlider {
  protected thumb:HTMLElement;
  protected track: HTMLElement;
  protected trackRect:DOMRect;

  enabled:boolean = false;

  private _onMouseDown;
  private _onTouchStart;
  private _onMouseMove;
  private _onTouchMove;
  private _onMouseUp;
  private _onTouchEnd;
  private _onKeyDown;

  private _anchorMX:number;
  private _anchorX:number; 
  isDragging:boolean = false;

  units:string = "";

  protected _min:number = 0;
  protected _max:number = 100;

  domV:HTMLElement;

  listeners:SliderListener[] = []

  constructor(public dom:HTMLElement, protected _value:number=0) {
    this.thumb = dom.querySelector('.rangeslider_input-thumb');
    this.track = dom.querySelector('.track');

    this.domV = dom.querySelector('.value').querySelector('span');
    
    this.update();

    this.addEventListeners();
  }

  addListener(lis:SliderListener) {
    if(this.listeners.indexOf(lis) > -1) return;
    this.listeners.push(lis);
  }

  removeListener(lis:SliderListener) {
    this.listeners.splice(this.listeners.indexOf(lis), 1);
  }

  setMinMax(min:number, max:number) {
    const minL = this.dom.querySelector('.min');
    const maxL = this.dom.querySelector('.max');

    if (minL && maxL) {
      minL.textContent = `${min}`;
      maxL.textContent = `${max}`;

      this._min = min;
      this._max = max;
    }

    this.updateSlider();
  }

  protected addEventListeners() {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);

    this.thumb.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    this.thumb.addEventListener('touchstart', this._onTouchStart);
    document.addEventListener('touchmove', this._onTouchMove);
    document.addEventListener('touchend', this._onTouchEnd);

    document.addEventListener('keydown', this._onKeyDown);
  }

  protected removeEventListeners() {
    this.thumb.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    this.thumb.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);

    document.removeEventListener('keydown', this._onKeyDown);
  }

  protected onMouseDown(e:MouseEvent) {
    this.startDrag(e.clientX);
  }

  protected onMouseUp(e:MouseEvent) {
    this.stopDrag();
  }

  protected onMouseMove(e:MouseEvent) {
    this.drag(e.clientX);
  }

  protected onTouchStart(e:TouchEvent) {
    this.startDrag(e.touches[0].clientX);
  }
  
  protected onTouchMove(e:TouchEvent) {
    this.drag(e.touches[0].clientX);
  }

  protected onTouchEnd(e:TouchEvent) {
    this.stopDrag();
  }

  protected onKeyDown(e:KeyboardEvent) {
    const {activeElement} = document;
    const isActive = activeElement === this.dom || this.dom.contains(activeElement);
    if(!this.enabled || !isActive) return;
    if(e.key === 'ArrowRight') {
      this.updateBy(1);
    } else if(e.key === 'ArrowLeft') {
      this.updateBy(-1);
    } 
  }

  /**
   * Update Slider by normalized units
   * @param nD normalized distance
   */
  protected updateBy(nD:number) {
    const d = 1/(this._max - this._min);
    this._value = MathUtils.clamp(this._value + d * nD, 0, 1);
    this.updateSlider();
  }

  protected startDrag(x:number) {
    if(!this.enabled) return;
    if(this.isDragging) return;
    this.isDragging = true;
    this._anchorMX = x;
    this._anchorX = this._value * this.trackRect.width;
  }

  protected drag(x:number) {
    if(!this.enabled) return;
    if(!this.isDragging) return;
    const dx = x - this._anchorMX;
    const w = this.trackRect.width;
    let nx = this._anchorX + dx;
    nx = MathUtils.clamp(0, w, nx);

    this._value = MathUtils.smoothstep(0, w, nx);
    // console.log(this._value);
    this.updateSlider();
  }

  protected stopDrag() {
    this.isDragging = false;
  }

  update() {
    this.trackRect = this.track.getBoundingClientRect();
    this.updateSlider();
  }

  get value():number {
    return this._value;
  }

  set value(val:number) {
    this._value = val;
    this.updateSlider();
  }

  protected updateSlider() {
    this.thumb.style.transform = `translateX(${this._value*this.trackRect.width}px)`;
    // this.thumb.setAttribute('aria-valuenow', this._value.toString());
    const nV = Math.round(MathUtils.lerp(this._min, this._max, this._value));
    this.domV.textContent = `${nV} ${this.units}`;

    for(const lis of this.listeners) {
      lis.onChange(nV);
    }
  }

  destroy() {
    this.removeEventListeners();
  }
}