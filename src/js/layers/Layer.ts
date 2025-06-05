class Layer {
    private visible: boolean;
    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.visible = this.element.getAttribute('aria-hidden') !== 'true';
    }

    open(): void {
        this.visible = true;
        this.element.setAttribute('aria-hidden', 'false');
    }

    close(): void {
        this.visible = false;
        this.element.setAttribute('aria-hidden', 'true');
    }

    isVisible(): boolean {
        return this.visible;
    }
}

export default Layer;