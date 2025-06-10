class Layer {
    private visible: boolean;
    private element: HTMLElement;
    private openClass?: string;
    private closeClass?: string;
    private animationDuration: number;
    protected onStateChange?: (isVisible: boolean) => void;

    constructor(element: HTMLElement, options?: {
        openClass?: string;
        closeClass?: string;
        animationDuration?: number;
        onStateChange?: (isVisible: boolean) => void;
    }) {
        this.element = element;
        this.visible = this.element.getAttribute('aria-hidden') !== 'true';
        this.openClass = options?.openClass;
        this.closeClass = options?.closeClass;
        this.animationDuration = options?.animationDuration || 300;
        this.onStateChange = options?.onStateChange;
    }

    async open(): Promise<void> {
        this.visible = true;
        this.element.setAttribute('aria-hidden', 'false');
        
        if (this.openClass) {
            if (this.closeClass) {
                this.element.classList.remove(this.closeClass);
            }
            this.element.classList.add(this.openClass);
            
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
        }

        if (this.onStateChange) {
            this.onStateChange(true);
        }
    }

    async close(): Promise<void> {
        if (this.closeClass) {
            if (this.openClass) {
                this.element.classList.remove(this.openClass);
            }
            this.element.classList.add(this.closeClass);
            
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
        }

        this.visible = false;

        const focusedElement = this.element.querySelector(':focus') as HTMLElement;
        if (focusedElement) {
            focusedElement.blur();
        }

        this.element.setAttribute('aria-hidden', 'true');

        if (this.onStateChange) {
            this.onStateChange(false);
        }
    }

    toggle(): void {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    }

    isVisible(): boolean {
        return this.visible;
    }

    setStateChangeCallback(callback: (isVisible: boolean) => void) {
        this.onStateChange = callback;
    }
}

export default Layer;