class ToggleGroup {
    element: any;
    inputs: any[];
    indicator: HTMLDivElement | null;
    callback: ((value: string, element: HTMLElement) => void) | null;
    
    constructor(element, callback = null) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.indicator = null;
        this.inputs = [];
        this.callback = callback;
        
        this.init();
    }

    init() {
        this.createIndicator();
        this.cacheInputs();
        this.bindEvents();
        
        // Wait until element is visible and has dimensions
        this.waitForVisibility();
    }

    waitForVisibility() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && (entry.target as HTMLElement).offsetWidth > 0) {
                    this.updateIndicator();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(this.element);
        
        // Fallback: also try after a longer delay
        setTimeout(() => {
            if (this.element.offsetWidth > 0) {
                this.updateIndicator();
                observer.unobserve(this.element);
            }
        }, 100);
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'togglegroup-indicator';
        this.element.insertBefore(this.indicator, this.element.firstChild);
        
        // Ensure parent positioning
        this.element.style.position = 'relative';
    }

    cacheInputs() {
        this.inputs = Array.from(this.element.querySelectorAll('input[type="radio"]'));
    }

    bindEvents() {
        this.inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateIndicator();
                if (this.callback && input.checked) {
                    this.callback(input.value, input);
                }
            });
        });
        
        window.addEventListener('resize', () => this.updateIndicator());
    }

    updateIndicator() {
        const checkedInput = this.inputs.find(input => input.checked);
        if (!checkedInput) {
            this.indicator.style.opacity = '0';
            return;
        }

        const label = checkedInput.closest('label');
        const item = label.closest('.togglegroup-item');
        
        const width = label.offsetWidth;
        const left = item.offsetLeft;
        
        // Only update if we have valid dimensions
        if (width > 0) {
            this.indicator.style.opacity = '1';
            this.indicator.style.width = `${width}px`;
            this.indicator.style.transform = `translateX(${left}px)`;
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.togglegroup').forEach(el => {
        new ToggleGroup(el);
    });
});

export default ToggleGroup;