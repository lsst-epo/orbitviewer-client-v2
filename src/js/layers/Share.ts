import Tabs from "../components/Tabs";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";

class Share extends Layer {
    dom: HTMLElement;
    triggerButton: HTMLElement;
    closeButton: HTMLElement;
    ratioToggle: HTMLElement;
    
    constructor(dom) {
        super(dom);
        this.dom = dom;

        this.closeButton = dom.querySelector('.button_close');
        this.triggerButton = document.querySelector('.button_share');
        this.ratioToggle = dom.querySelector('#toggle-ratio');

        this.start();
    }

    start() {
		this.triggerButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.open();
		});

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
        
		const shareTabs = new Tabs('.share_dialog-body');

		const ratioToggle = new ToggleGroup(this.ratioToggle, (value, element) => {
            const screenCapture = this.dom.querySelector('.screen_capture-hero');
            if (screenCapture) {
                value = value.toLowerCase();
                console.log(value);
                const possibleValues = ['square', 'vertical', 'horizontal'];
                possibleValues.forEach(v => screenCapture.classList.remove(v));
                if (value && possibleValues.includes(value)) {
                    screenCapture.classList.add(value);
                }                
            }
        });
    }
}

export default Share;