class SlidingMenu {
 private container: HTMLElement;
 private content: HTMLElement;
 
 constructor(selector: string) {
   this.container = document.querySelector(selector);
   this.content = this.container.querySelector('.nav_dropdown-content');
   this.init();
 }

 private init() {
   this.bindEvents();
 }

 private bindEvents() {
  const itemLanguages = document.querySelector('#menuitem-languages');
  itemLanguages.addEventListener('click', () => {
    this.showSubmenu('language');
  });

  const itemExploration = document.querySelector('#menuitem-exploration');
  itemExploration.addEventListener('click', () => {
    this.showSubmenu('exploration');
  });

  const backButtons = document.querySelectorAll('.button_back');
  backButtons.forEach((el)=> {
    el.addEventListener('click', () => {
      this.showLevel1();
    });
  });
}

 public open() {
   this.container.style.display = 'block';
   this.updateHeight();
 }

 private showSubmenu(type: 'language' | 'exploration') {
   this.container.querySelectorAll('.nav_dropdown_level-group').forEach(group => {
     group.setAttribute('aria-hidden', 'true');
   });
   
   const targetGroup = this.container.querySelector(`[data-menu="${type}"]`);
   targetGroup?.setAttribute('aria-hidden', 'false');
   
   this.content.classList.add('show-level-2');
   this.updateHeight();
 }

 private showLevel1() {
    this.content.classList.remove('show-level-2');
    this.updateHeight();
  }

  private updateHeight() {
    const isLevel2 = this.content.classList.contains('show-level-2');
    let targetElement: HTMLElement;
    
    if (isLevel2) {
      targetElement = this.container.querySelector('.nav_dropdown_level-group[aria-hidden="false"]') as HTMLElement;
    } else {
      targetElement = this.container.querySelector('.nav_dropdown_level-1 .listitem-content') as HTMLElement;
    }
    
    if (targetElement) {
      this.content.style.height = `${targetElement.offsetHeight}px`;
    }
  }
}

export default SlidingMenu;