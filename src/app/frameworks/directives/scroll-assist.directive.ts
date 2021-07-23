import { Directive, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[scrollAssist]'
})
export class ScrollAssistDirective {

  @Input() scrollElement: HTMLElement;
  @Input() elementWrap: ElementRef;
  @Input() showNewMessage: boolean;
  @Input() isMessageRecieved: boolean;

  @Output() unsetNewMessage: EventEmitter<any> = new EventEmitter<any>();
  @Output() hideNewMessage: EventEmitter<any> = new EventEmitter<any>();

  private elementLoaded: boolean
  private observer: MutationObserver
  private isScrollListener: boolean

  constructor() {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('elementWrap' in changes) {
      if (this.elementWrap && !this.elementLoaded) {
        this.initMutationObserver();
        this.elementLoaded = true;
      }
    }
    if ('showNewMessage' in changes) {
      if (this.showNewMessage) {
        this.addScrollListener();
      } else {
        this.removeScrollListener();
      }
    }
  }

  public addScrollListener() {
    if (this.scrollElement && !this.isScrollListener) {
      this.isScrollListener = true;
      this.scrollElement.addEventListener('scroll', this.scrollListener)
    }
  }

  public removeScrollListener() {
    this.isScrollListener = false;
    this.scrollElement.removeEventListener('scroll', this.scrollListener)
  }

  public scrollListener = e => {
    if (this.scrollElement?.scrollTop > -5) {
      this.hideNewMessage.emit();
    }
  }

  public initMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation, index) => {
        if (mutation?.attributeName === 'ng-reflect-is-message-sent') {
          if ((mutation.target as HTMLElement).attributes['ng-reflect-is-message-sent'].value === 'true') {
            this.scrollElement?.firstElementChild?.firstElementChild?.scrollIntoView()
          }
        }
        if (
          mutation?.attributeName === 'ng-reflect-is-message-recieved' &&
          (mutation?.target as HTMLElement)?.attributes?.['ng-reflect-is-message-recieved']?.value === 'true'
        ) {
          if (this.scrollElement.scrollTop > -1) {
            this.hideNewMessage.emit();
            this.unsetNewMessage.emit();
          } else {
            this.scrollElement.scrollTop = this.scrollElement.scrollTop - 26;
            this.unsetNewMessage.emit();
          }
        }
      });
    });
    this.observer.observe(this.elementWrap.nativeElement, {
      attributes: true,
      childList: true,
      characterData: false,
      subtree: true
    });
  }

  public ngOnDestroy() {
    this.observer?.disconnect();
    this.scrollElement.removeEventListener('scroll', this.scrollListener)
  }

}
