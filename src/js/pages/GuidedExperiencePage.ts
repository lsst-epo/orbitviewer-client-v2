import { DefaultPage } from "./DefaultPage";
import { ObjectsScroller } from "../components/ObjectsScroller";
import { $ } from "@fils/utils";
import { GLOBALS } from "../core/Globals";


export class GuidedExperiencePage extends DefaultPage {
    dom: HTMLElement;
    slides:any[];
    currentSlide:number = 0;
    progressBar:HTMLElement;
    // scroller: ObjectsScroller;
    current:HTMLElement;

    nextBtn:HTMLElement;
    prevBtn:HTMLElement;

    solarElements:string[] = [];
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);
    }

    create() {
        super.create();
        const container = $('.object_detail', this.dom);
        this.slides = JSON.parse(container.getAttribute('data-slides'));
        container.removeAttribute('data-slides');

        this.progressBar = $('.current', this.dom);
        this.current = $('[aria-current="step"]', this.dom);

        for(const slide of this.slides) {
            if(slide.closeUp) {
                this.solarElements.push(slide.closeUp[0].elementID);
            }
        }

        GLOBALS.viewer.goToGuidedExperienceMode(this.solarElements);

        // console.log($('.nav'));

        const nxt = $('[guide-next]', this.dom);
        const prev = $('[guide-previous]', this.dom);

        // console.log(nxt);
        // console.log(prev);

        nxt.onclick = () => {
            this.goToNextSlide();
        }

        prev.onclick = () => {
            this.goToPrevSlide();
        }

        this.nextBtn = nxt;
        this.prevBtn = prev;

        this.updateButtons();
        this.updateSlideContent();
    }

    updateButtons() {
        this.nextBtn.setAttribute('data-enabled', `${this.currentSlide < this.slides.length-1}`);
        this.prevBtn.setAttribute('data-enabled', `${this.currentSlide > 0}`);
        this.current.textContent = `${this.currentSlide+1}`;
    }

    goToNextSlide() {
        if(this.currentSlide === this.slides.length-1) return;
        this.currentSlide = this.currentSlide+1;
        this.updateSlideContent();
        this.updateButtons();
    }

    goToPrevSlide() {
        if(this.currentSlide === 0) return;
        this.currentSlide = this.currentSlide-1;
        this.updateSlideContent();
        this.updateButtons();
    }

    updateSlideContent() {
        const slide = this.slides[this.currentSlide];
        // console.log(slide);
        const eyebrow = $('h3.eyebrow', this.dom);
        const text = $('.guide_step-text', this.dom);

        eyebrow.textContent = slide.subTitle || "";
        let txt = ``;
        if(slide.slideTitle) txt += `<h2>${slide.slideTitle}</h2>`;
        if(slide.slideContent) txt += `<p>${slide.slideContent}</p>`;
        text.innerHTML = txt;

        this.progressBar.style.width = `${100 * (this.currentSlide/(this.slides.length-1))}%`;

        if(slide.closeUp) {
            const id = slide.closeUp[0].elementID;
            GLOBALS.viewer.followSolarElementById(id);
        } else {
            GLOBALS.viewer.goToGuidedExperienceMode(this.solarElements);
        }
    }

    update() {
    }

    dispose() {
        super.dispose();
        // this.scroller.destroy();
    }
}