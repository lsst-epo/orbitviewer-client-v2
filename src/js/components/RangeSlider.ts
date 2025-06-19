interface RangeSliderOptions {
  values?: number[];
  minmax?: [number, number];
  label?: string;
  onChange?: (values: number[]) => void;
  onDragStart?: (thumbIndex: number) => void;
  onDragEnd?: (thumbIndex: number) => void;
}

class RangeSlider {
  private container: HTMLElement;
  private track: HTMLElement;
  private range: HTMLElement;
  private thumbs: HTMLElement[] = [];
  private valueDisplays: HTMLElement[] = [];
  private labels: { min: HTMLElement; max: HTMLElement };
  
  private values: number[];
  private initValues: number[] = [];
  private minValue: number;
  private maxValue: number;
  private label: string = '{{value}}';
  private isDragging: boolean = false;
  private activeThumbIndex: number = -1;
  private trackRect: DOMRect | null = null;
  
  private options: RangeSliderOptions;

  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, options: RangeSliderOptions = {}) {
    this.container = container;
    this.options = options;
    this.label = options.label || this.label;
    
    // Extract values and minmax from DOM if not provided in options
    const extractedData = this.extractDataFromDOM();
    this.values = options.values || extractedData.values;
    this.initValues = [...this.values]; // Store initial values for reset
    this.minValue = options.minmax?.[0] ?? extractedData.minmax[0];
    this.maxValue = options.minmax?.[1] ?? extractedData.minmax[1];

    this.initializeElements();
    this.attachEventListeners();

    this.updateSlider();
  }

  private extractDataFromDOM(): { values: number[]; minmax: [number, number] } {
    const values: number[] = [];
    const thumbs = this.container.querySelectorAll('.rangeslider_input-thumb');
    
    // Extract values from aria-valuenow attributes or value display elements
    thumbs.forEach(thumb => {
      const ariaValue = thumb.getAttribute('aria-valuenow');
      if (ariaValue) {
        values.push(parseFloat(ariaValue));
      } else {
        // Fallback: try to get value from the display span
        const valueSpan = thumb.querySelector('.value span') as HTMLElement;
        if (valueSpan && valueSpan.textContent) {
          const value = parseFloat(valueSpan.textContent.trim());
          if (!isNaN(value)) {
            values.push(value);
          }
        }
      }
    });
    
    // Extract minmax from labels
    const minLabel = this.container.querySelector('.rangeslider-labels .min') as HTMLElement;
    const maxLabel = this.container.querySelector('.rangeslider-labels .max') as HTMLElement;
    
    let minValue = 0;
    let maxValue = 100;
    
    if (minLabel && minLabel.textContent) {
      const parsedMin = parseFloat(minLabel.textContent.trim());
      if (!isNaN(parsedMin)) {
        minValue = parsedMin;
      }
    }
    
    if (maxLabel && maxLabel.textContent) {
      const parsedMax = parseFloat(maxLabel.textContent.trim());
      if (!isNaN(parsedMax)) {
        maxValue = parsedMax;
      }
    }
    
    // Fallback to single value if no values found
    if (values.length === 0) {
      values.push(minValue);
    }
    
    return {
      values,
      minmax: [minValue, maxValue]
    };
  }

  private initializeElements(): void {
    // Get track and range elements
    this.track = this.container.querySelector('.track') as HTMLElement;
    this.range = this.container.querySelector('.range') as HTMLElement;
    
    // Get thumb elements
    const thumbElements = this.container.querySelectorAll('.rangeslider_input-thumb');
    this.thumbs = Array.from(thumbElements) as HTMLElement[];
    
    // Get value display elements
    this.valueDisplays = this.thumbs.map(thumb => 
      thumb.querySelector('.value span') as HTMLElement
    );
    
    // Get label elements
    const minLabel = this.container.querySelector('.rangeslider-labels .min') as HTMLElement;
    const maxLabel = this.container.querySelector('.rangeslider-labels .max') as HTMLElement;
    this.labels = { min: minLabel, max: maxLabel };
    this.labels.min.textContent = this.getLabelFromValue(Math.round(this.minValue));
    this.labels.max.textContent = this.getLabelFromValue(Math.round(this.maxValue));

    // Set initial aria attributes
    this.thumbs.forEach((thumb, index) => {
      thumb.setAttribute('aria-valuemin', this.minValue.toString());
      thumb.setAttribute('aria-valuemax', this.maxValue.toString());
      thumb.setAttribute('aria-valuenow', this.values[index]?.toString() || '0');
    });
  }

  private attachEventListeners(): void {
    // Resize observer to handle dynamic resizing of the container
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.trackRect = this.track.getBoundingClientRect();
          this.updateSlider();
        }
      }
    });

    this.resizeObserver.observe(this.container);

    // Mouse events for each thumb
    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('mousedown', (e) => this.handleMouseDown(e, index));
      thumb.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
    });

    // Global mouse events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Track click for jumping to position
    this.track.addEventListener('click', this.handleTrackClick.bind(this));

    // Touch events for mobile support
    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('touchstart', (e) => this.handleTouchStart(e, index));
    });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseDown(event: MouseEvent, thumbIndex: number): void {
    event.preventDefault();
    this.startDrag(thumbIndex);
    this.options.onDragStart?.(thumbIndex);
  }

  private handleTouchStart(event: TouchEvent, thumbIndex: number): void {
    event.preventDefault();
    this.startDrag(thumbIndex);
    this.options.onDragStart?.(thumbIndex);
  }

  private startDrag(thumbIndex: number): void {
    this.isDragging = true;
    this.activeThumbIndex = thumbIndex;
    this.thumbs[thumbIndex].focus();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.trackRect) {
      this.updateValueFromPosition(event.clientX);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.isDragging && this.trackRect && event.touches.length > 0) {
      event.preventDefault();
      this.updateValueFromPosition(event.touches[0].clientX);
    }
  }

  private handleMouseUp(): void {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  private handleTouchEnd(): void {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  private endDrag(): void {
    if (this.activeThumbIndex >= 0) {
      this.options.onDragEnd?.(this.activeThumbIndex);
    }
    this.isDragging = false;
    this.activeThumbIndex = -1;
    // this.trackRect = null;
  }

  private handleTrackClick(event: MouseEvent): void {
    if (this.isDragging) return;
    
    const clickPosition = event.clientX;
    const { trackRect } = this;
    const percentage = (clickPosition - trackRect.left) / trackRect.width;
    const newValue = this.minValue + (percentage * (this.maxValue - this.minValue));
    
    // Find closest thumb to move
    const closestThumbIndex = this.findClosestThumb(newValue);
    this.activeThumbIndex = closestThumbIndex;
    this.updateValueFromPosition(clickPosition);
    this.activeThumbIndex = -1;
  }

  private findClosestThumb(value: number): number {
    if (this.values.length === 1) return 0;
    
    const distance0 = Math.abs(this.values[0] - value);
    const distance1 = Math.abs(this.values[1] - value);
    
    return distance0 <= distance1 ? 0 : 1;
  }

  private updateValueFromPosition(clientX: number): void {
    if (!this.trackRect || this.activeThumbIndex < 0) return;
    
    const percentage = Math.max(0, Math.min(1, 
      (clientX - this.trackRect.left) / this.trackRect.width
    ));
    
    let newValue = this.minValue + (percentage * (this.maxValue - this.minValue));
    newValue = this.roundToStep(newValue);
    
    // Constrain values to prevent thumbs from crossing
    if (this.values.length === 2) {
      if (this.activeThumbIndex === 0) {
        newValue = Math.min(newValue, this.values[1]);
      } else {
        newValue = Math.max(newValue, this.values[0]);
      }
    }
    
    this.values[this.activeThumbIndex] = newValue;
    this.updateSlider();
    this.options.onChange?.(this.values);
  }

  private handleKeyDown(event: KeyboardEvent, thumbIndex: number): void {
    const step = (this.maxValue - this.minValue) / 100; // 1% steps
    let newValue = this.values[thumbIndex];
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue -= step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue += step;
        break;
      case 'Home':
        newValue = this.minValue;
        break;
      case 'End':
        newValue = this.maxValue;
        break;
      default:
        return;
    }
    
    event.preventDefault();
    newValue = Math.max(this.minValue, Math.min(this.maxValue, newValue));
    
    // Prevent thumbs from crossing
    if (this.values.length === 2) {
      if (thumbIndex === 0) {
        newValue = Math.min(newValue, this.values[1]);
      } else {
        newValue = Math.max(newValue, this.values[0]);
      }
    }
    
    this.values[thumbIndex] = newValue;
    this.updateSlider();
    this.options.onChange?.(this.values);
  }

  private roundToStep(value: number): number {
    // Round to reasonable precision to avoid floating point issues
    return Math.round(value);
  }

  private getLabelFromValue(value: number): string {
    // Replace {{value}} with the actual value in the label
    return this.label.replace('{{value}}', value.toString());
  }

  private updateSlider(): void {
    const valueRange = this.maxValue - this.minValue;
    const trackWidth = this.trackRect?.width || 0;

    if (trackWidth === 0) return; // Skip update if track width is zero

    // console.log('update slider');

    // Skip update if track has no width yet (not rendered)
    /* if (trackWidth === 0) {
      requestAnimationFrame(() => this.updateSlider());
      return;
    } */
    
    // Update thumb positions and values
    this.thumbs.forEach((thumb, index) => {
      if (this.values[index] !== undefined) {
        const percentage = (this.values[index] - this.minValue) / valueRange;
        const translateX = percentage * trackWidth;
        thumb.style.transform = `translateX(${translateX}px)`;
        thumb.setAttribute('aria-valuenow', this.values[index].toString());
        
        if (this.valueDisplays[index]) {
          this.valueDisplays[index].textContent = this.getLabelFromValue(Math.round(this.values[index]));
        }
      }
    });
    
    // Update range bar position (only if range element exists)
    if (this.range) {
      if (this.values.length === 1) {
        // Single thumb: range from min to thumb
        const percentage = (this.values[0] - this.minValue) / valueRange;
        const width = percentage * trackWidth;
        this.range.style.transform = 'translateX(0px)';
        this.range.style.width = `${width}px`;
      } else if (this.values.length === 2) {
        // Two thumbs: range between thumbs
        const leftPercentage = (this.values[0] - this.minValue) / valueRange;
        const rightPercentage = (this.values[1] - this.minValue) / valueRange;
        const leftPosition = leftPercentage * trackWidth;
        const width = (rightPercentage - leftPercentage) * trackWidth;
        this.range.style.transform = `translateX(${leftPosition}px)`;
        this.range.style.width = `${width}px`;
      }
    }
  }

  // Public methods
  public getValues(): number[] {
    return [...this.values];
  }

  public reset(): void {
    this.values = [...this.initValues];
    this.updateSlider();
    this.options.onChange?.(this.values);
  }

  public setValues(newValues: number[]): void {
    this.values = newValues.map(value => 
      Math.max(this.minValue, Math.min(this.maxValue, value))
    );
    this.updateSlider();
    this.options.onChange?.(this.values);
  }

  public setRange(min: number, max: number): void {
    this.minValue = min;
    this.maxValue = max;
    
    // Update labels
    this.labels.min.textContent = this.getLabelFromValue(Math.round(this.minValue));
    this.labels.max.textContent = this.getLabelFromValue(Math.round(this.maxValue));
    
    // Update aria attributes
    this.thumbs.forEach(thumb => {
      thumb.setAttribute('aria-valuemin', min.toString());
      thumb.setAttribute('aria-valuemax', max.toString());
    });
    
    // Constrain current values to new range
    this.values = this.values.map(value => 
      Math.max(min, Math.min(max, value))
    );
    
    this.updateSlider();
  }

  public destroy(): void {
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.resizeObserver.unobserve(this.container);
    this.resizeObserver.disconnect();
  }
}

export default RangeSlider;