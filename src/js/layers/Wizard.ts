import Layer from "./Layer";

class Wizard extends Layer {
    dom: HTMLElement;
    
    constructor(dom) {
        super(dom);
        this.dom = dom;

        this.start();
    }

    start() {
		const wizardButton = document.querySelectorAll('.wizard_tooltip .button');
		wizardButton.forEach(el => {
			el.addEventListener('click', (event) => {
				event.preventDefault();
                this.close();
			});
		});
        
    }
}

export default Wizard;