interface TooltipOptions {
  autoDismissDelay?: number; // milliseconds, 0 = no auto-dismiss
  offset?: number; // pixels between trigger and tooltip
  maxWidth?: number; // max width in pixels
}

class Tooltip {
  private tooltipElement: HTMLElement;
  private chevronElement: HTMLElement;
  private isVisible: boolean = false;
  private autoDismissTimer: number | null = null;
  private options: TooltipOptions;

  constructor(options: TooltipOptions = {}) {
    this.options = {
      autoDismissDelay: 0,
      offset: 8,
      maxWidth: 300,
      ...options
    };
    this.tooltipElement = this.createTooltipElement();
    document.body.appendChild(this.tooltipElement);
    this.bindTouchEvents();
  }

  private createTooltipElement(): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    
    // Only set essential positioning styles
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = `${this.options.maxWidth}px`;
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.whiteSpace = 'normal';

    // Create chevron element
    this.chevronElement = document.createElement('div');
    this.chevronElement.className = 'tooltip-chevron';
    this.chevronElement.style.position = 'absolute';

    tooltip.appendChild(this.chevronElement);
    return tooltip;
  }

  private bindTouchEvents() {
    // Handle touch events for mobile devices - hide tooltip when tapping outside
    document.addEventListener('touchstart', (e) => {
      if (this.isVisible && !this.tooltipElement.contains(e.target as Node)) {
        this.hide();
      }
    });
  }

  private clearAutoDismissTimer() {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  private startAutoDismissTimer() {
    if (this.options.autoDismissDelay && this.options.autoDismissDelay > 0) {
      this.autoDismissTimer = window.setTimeout(() => {
        this.hide();
      }, this.options.autoDismissDelay);
    }
  }

  public initialize(triggerElement: HTMLElement, content?: string, alignment: 'left' | 'center' | 'right' = 'center') {
    // Get content from data-tooltip attribute if not provided
    const tooltipContent = content || triggerElement.dataset.tooltip || '';
    
    if (!tooltipContent) {
      console.warn('Tooltip content not found. Provide content parameter or data-tooltip attribute.');
      return;
    }
    
    // Create content container to handle text properly
    const existingContent = this.tooltipElement.querySelector('.tooltip-content');
    if (existingContent) {
      existingContent.textContent = tooltipContent;
    } else {
      const contentElement = document.createElement('div');
      contentElement.className = 'tooltip-content';
      contentElement.textContent = tooltipContent;
      this.tooltipElement.insertBefore(contentElement, this.chevronElement);
    }
    
    this.tooltipElement.dataset.alignment = alignment;
    this.tooltipElement.dataset.triggerElement = triggerElement.id || 'element';
  }

  public show(triggerElement: HTMLElement, content?: string, alignment: 'left' | 'center' | 'right' = 'center') {
    this.clearAutoDismissTimer();
    
    // Always initialize with current parameters (content can come from data-tooltip)
    this.initialize(triggerElement, content, alignment);

    // Make tooltip visible temporarily to get dimensions
    this.tooltipElement.style.visibility = 'hidden';
    this.tooltipElement.style.opacity = '1';
    
    const rect = triggerElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const offset = this.options.offset!;
    
    const viewportHeight = window.innerHeight;
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    
    // Determine if tooltip should appear above or below
    const showAbove = spaceAbove > tooltipRect.height + offset || spaceAbove > spaceBelow;
    
    let left: number;
    let chevronLeft: number;

    // Calculate horizontal position based on alignment
    switch (alignment) {
      case 'left':
        left = rect.left;
        chevronLeft = 10; // Chevron near the left edge
        break;
      case 'right':
        left = rect.right - tooltipRect.width;
        chevronLeft = tooltipRect.width - 22; // Chevron near the right edge
        break;
      case 'center':
      default:
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        chevronLeft = tooltipRect.width / 2 - 6; // Chevron in the center
        break;
    }

    // Ensure tooltip stays within viewport horizontally
    const viewportWidth = window.innerWidth;
    if (left < 10) {
      const adjustment = 10 - left;
      left = 10;
      chevronLeft = Math.max(6, chevronLeft - adjustment);
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      const adjustment = (left + tooltipRect.width) - (viewportWidth - 10);
      left = viewportWidth - tooltipRect.width - 10;
      chevronLeft = Math.min(tooltipRect.width - 18, chevronLeft + adjustment);
    }

    // Position tooltip and chevron
    if (showAbove) {
      this.tooltipElement.style.top = `${rect.top - tooltipRect.height - offset + window.scrollY}px`;
      this.chevronElement.style.top = `${tooltipRect.height}px`;
      this.chevronElement.className = 'tooltip-chevron tooltip-chevron-down';
    } else {
      this.tooltipElement.style.top = `${rect.bottom + offset + window.scrollY}px`;
      this.chevronElement.style.top = `-6px`;
      this.chevronElement.className = 'tooltip-chevron tooltip-chevron-up';
    }

    this.tooltipElement.style.left = `${left}px`;
    this.chevronElement.style.left = `${chevronLeft}px`;

    // Show tooltip
    this.tooltipElement.style.visibility = 'visible';
    this.isVisible = true;
    
    // Start auto-dismiss timer
    this.startAutoDismissTimer();
  }

  public hide() {
    this.clearAutoDismissTimer();
    this.tooltipElement.style.opacity = '0';
    this.tooltipElement.style.visibility = 'hidden';
    this.isVisible = false;
  }

  public isTooltipVisible(): boolean {
    return this.isVisible;
  }

  public destroy() {
    this.clearAutoDismissTimer();
    if (this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
  }

  public updateOptions(newOptions: Partial<TooltipOptions>) {
    this.options = { ...this.options, ...newOptions };
    this.tooltipElement.style.maxWidth = `${this.options.maxWidth}px`;
  }
}

export default Tooltip;