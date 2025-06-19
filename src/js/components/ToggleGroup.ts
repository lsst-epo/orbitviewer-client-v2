class ToggleGroup {
    inputs: HTMLInputElement[] = [];
    initValue: string | null = null;
    indicator: HTMLDivElement | null;
    resizeObserver: ResizeObserver | null = null;
    callback: ((value: string, index: number) => void) | null;
    
    constructor(public element:HTMLElement, callback = null) {
        // this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.indicator = null;
        this.inputs = [];
        this.callback = callback;

        this.init();
    }

    show() {
        this.element.setAttribute('aria-hidden', 'false');
        this.updateIndicator();
    }

    hide() {
        this.element.setAttribute('aria-hidden', 'true');
    }

    init() {
        this.createIndicator();
        this.cacheInputs();
        this.bindEvents();
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
        const checkedInput = this.inputs.find(input => input.checked);
        if (checkedInput) {
           this.initValue = checkedInput.value;
        }
    }

    reset() {
        if (this.initValue) {
            const input = this.inputs.find(input => input.value === this.initValue);
            if (input) {
                const index = this.inputs.indexOf(input);
                this.selectedIndex = index;
                this.updateIndicator();
                if (this.callback && input.checked) {
                    this.callback(input.value, index);
                }
            }
        }
    }

    bindEvents() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    this.updateIndicator();
                }
            }
        });

        this.resizeObserver.observe(this.element);

        this.inputs.forEach(input => {
            /* input.addEventListener('change', () => {
                this.updateIndicator();
                if (this.callback && input.checked) {
                    this.callback(input.value, input);
                }
            }); */

            input.onclick = () => {
                const index = this.inputs.indexOf(input);
                this.selectedIndex = index;
                // console.log(this.selectedIndex);
                this.updateIndicator();
                if(this.callback) this.callback(input.value, index)
            }
        });
        
        window.addEventListener('resize', () => this.updateIndicator());
    }

    get selectedIndex():number {
        for(let i=0;i <this.inputs.length; i++) {
            if(this.inputs[i].checked) return i;
        }
    }

    set selectedIndex(k:number) {
        for(let i=0;i <this.inputs.length; i++) {
            this.inputs[i].checked = i === k;
        }
    }

    updateIndicator() {
        const checkedInput = this.inputs.find(input => input.checked);
        if (!checkedInput) {
            this.indicator.style.opacity = '0';
            return;
        }

        const label = checkedInput.closest('label');
        const item = label.closest('.togglegroup-item') as HTMLElement;
        
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

export default ToggleGroup;