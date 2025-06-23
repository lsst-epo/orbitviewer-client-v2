class Tabs {
  private tabLinks: NodeListOf<HTMLElement>;
  private tabContents: NodeListOf<HTMLElement>;

  constructor(containerSelector: string, protected onChange:Function = null) {
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      throw new Error(`Container not found: ${containerSelector}`);
    }

    this.tabLinks = container.querySelectorAll('[role="tab"]');
    this.tabContents = container.querySelectorAll('[role="tabpanel"]');
    
    this.init();
  }

  private init(): void {
    this.tabLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showTab(index);
        if(this.onChange) this.onChange(index);
      });
    });

    this.showTab(0);
  }

  private showTab(activeIndex: number): void {
    this.tabContents.forEach((content) => {
      content.setAttribute('aria-hidden', 'true');
    });

    this.tabLinks.forEach((link) => {
      link.setAttribute('aria-selected', 'false');
    });

    if (this.tabContents[activeIndex]) {
      this.tabContents[activeIndex].setAttribute('aria-hidden', 'false');
    }

    if (this.tabLinks[activeIndex]) {
      this.tabLinks[activeIndex].setAttribute('aria-selected', 'true');
    }
  }

  public getActiveTabIndex(): number {
    return Array.from(this.tabLinks).findIndex(
      link => link.getAttribute('aria-selected') === 'true'
    );
  }

  public getActiveTab(): HTMLElement | null {
    return document.querySelector('[role="tab"][aria-selected="true"]');
  }
}

export default Tabs;