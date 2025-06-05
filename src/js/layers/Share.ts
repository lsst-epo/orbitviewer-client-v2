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
        // Open Button
		this.triggerButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.open();
		});

        // Close Button
		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
        
        // Tabs
		const shareTabs = new Tabs('.share_dialog-body');

		// Togglegroups
		const ratioToggle = new ToggleGroup(this.ratioToggle);
    }
}

export default Share;