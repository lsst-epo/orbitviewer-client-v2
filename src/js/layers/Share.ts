import Tabs from "../components/Tabs";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";
import { copyToClipboard } from "@fils/utils";
import { ShareAPI } from "../core/ShareAPI";

class Share extends Layer {
    dom: HTMLElement;
    triggerButton: HTMLElement;
    input: HTMLInputElement;
    closeButton: HTMLElement;
    ratioToggle: HTMLElement;
    copyButton: HTMLElement;
    
    fbButton: HTMLElement;
    xButton: HTMLElement;
    apiButton: HTMLElement;

    shareAPI : ShareAPI = new ShareAPI();

    constructor(dom) {
        super(dom, {
            openClass: 'share--open',
            closeClass: 'share--close',
            closingClasses: ['out'],
            animationDuration: 500
        });
        
        this.dom = dom;

        this.closeButton = dom.querySelector('.button_close');
        this.triggerButton = document.querySelector('.button_share');
        this.ratioToggle = dom.querySelector('#toggle-ratio');
        this.copyButton = dom.querySelector('.button_copy');

        this.fbButton = dom.querySelector('.button-fb');
        this.xButton = dom.querySelector('.button-x');
        this.apiButton = dom.querySelector('.button-api');

        this.input = dom.querySelector('input[type="url"]') as HTMLInputElement;

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

        this.fbButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareAPI.facebook(this.getInputValue());
        });

        this.apiButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareAPI.share({
                title: '', // You can set a title if needed
                text: '', // You can set a text if needed
                url: this.getInputValue()
            });
        });

        this.xButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareAPI.x(this.getInputValue());
        });

        this.copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.copyButton.classList.contains('active')) return; // Prevent multiple clicks or if input is not found
            copyToClipboard(this.getInputValue());
            this.copyButton.classList.add('active');
            setTimeout(() => {
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

    getInputValue() {
        if (!this.input) return '';
        return this.input.value.trim();
    }
}

export default Share;