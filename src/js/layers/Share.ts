import Tabs from "../components/Tabs";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";
import { copyToClipboard } from "@fils/utils";

class Share extends Layer {
    dom: HTMLElement;
    triggerButton: HTMLElement;
    closeButton: HTMLElement;
    ratioToggle: HTMLElement;
    copyButton: HTMLElement;
    
    constructor(dom) {
        super(dom, {
            openClass: 'share--open',
            closeClass: 'share--close',
            animationDuration: 500
        });
        
        this.dom = dom;

        this.closeButton = dom.querySelector('.button_close');
        this.triggerButton = document.querySelector('.button_share');
        this.ratioToggle = dom.querySelector('#toggle-ratio');
        this.copyButton = dom.querySelector('.button_copy');

        console.log(this.copyButton);

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

        this.copyButton.addEventListener('click', (e) => {
            const input = this.copyButton.closest('div').querySelector('input');
            if (!input || this.copyButton.classList.contains('active')) return; // Prevent multiple clicks or if input is not found
            copyToClipboard(input.value);
            this.copyButton.classList.add('active');
            setTimeout(() => {
                // TODO: SHOW Active THREE SECONDS
                this.copyButton.classList.remove('active');
            }, 3000); // Reset the button after 3 seconds
            
        })
        
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