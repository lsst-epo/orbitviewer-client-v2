import Layer from "./Layer";

class Toast extends Layer {
    constructor(dom: Element) {
        super(dom as HTMLElement, {
            openClass: 'toast--open',
            closeClass: 'toast--close',
            animationDuration: 300
        });
    }
}

export default Toast;
