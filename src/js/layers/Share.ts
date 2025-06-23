import Tabs from "../components/Tabs";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";
import { copyToClipboard } from "@fils/utils";
import { ShareAPI } from "../core/ShareAPI";
import { generateShareableURL } from "../core/Utils";
import { GLOBALS } from "../core/Globals";

const logos = {
	vertical: new Image(),
	horizontal: new Image(),
	square: new Image()
}

logos.vertical.src = "/assets/social/v.png";
logos.horizontal.src = "/assets/social/h.png";
logos.square.src = "/assets/social/s.png";

const sizes = {
    horizontal: {
        width: 1920,
        height: 1080
    },
    vertical: {
        width: 1080,
        height: 1920
    },
    square: {
        width: 1080,
        height: 1080
    }
}

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

    downloadButton: HTMLElement;

    shareAPI : ShareAPI = new ShareAPI();

    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    layout:string;
    openTab:number = 0;

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

        this.downloadButton = document.querySelector('.button_download-default');
        // console.log(this.downloadButton);

        this.input = dom.querySelector('input[type="url"]') as HTMLInputElement;

        this.canvas = this.dom.querySelector('canvas#shareCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');

        this.start();
    }

    start() {
		this.triggerButton.addEventListener('click', (e) => {
			e.preventDefault();
            this.setInputValue(); // Update the input value before opening
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

        this.layout = 'horizontal'

        this.downloadButton.onclick = () => {
            this.canvas.toBlob( blob => {
                // Create a URL for the blob
                const url = URL.createObjectURL(blob);

                // Create a temporary anchor element for download
                const link = document.createElement('a');
                link.href = url;
                const d = new Date();
                link.download = `orbitviewer-${d.toLocaleDateString()}.png`; // Set the filename

                // Trigger the download
                document.body.appendChild(link);
                link.click();

                // Clean up
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, "image/png");
        }
        
		const shareTabs = new Tabs('.share_dialog-body', (index) => {
            // console.log('tab changed to', index);
            this.openTab = index;
            if(index === 1) {
                this.capture();
            }
        });

		const ratioToggle = new ToggleGroup(this.ratioToggle, (value, element) => {
            const screenCapture = this.dom.querySelector('.screen_capture-hero');
            if (screenCapture) {
                value = value.toLowerCase();
                console.log(value);
                const possibleValues = ['square', 'vertical', 'horizontal'];
                possibleValues.forEach(v => screenCapture.classList.remove(v));
                if (value && possibleValues.includes(value)) {
                    screenCapture.classList.add(value);
                    this.layout = value;
                    this.capture();
                }
            }
        });        

        ratioToggle.show();
    }

    capture() {
        const siz = sizes[this.layout];
        this.canvas.width = siz.width;
        this.canvas.height = siz.height;
        GLOBALS.viewer.capture(this.layout, can => {
            this.ctx.drawImage(can, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(logos[this.layout], 0, 0, this.canvas.width, this.canvas.height);
        })
    }

    setInputValue() {
        this.input.value = generateShareableURL();
    }

    getInputValue() {
        const url = generateShareableURL();
        // console.log(url);
        return url;
        if (!this.input) return '';
        return this.input.value.trim();
    }

    open(): Promise<void> {
        if(this.openTab === 1) this.capture();
        return super.open();
    }
}

export default Share;