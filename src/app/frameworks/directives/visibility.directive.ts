import { Directive, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[observeVisibility]'
})
export class VisibilityDirective {

  @Input() element: HTMLElement;
  @Output() reached: EventEmitter<any> = new EventEmitter<any>();

  private observer: IntersectionObserver
  private elementLoaded: boolean

  constructor() {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('element' in changes) {
      if (this.element && !this.elementLoaded) {
        this.initIntersectionObserver();
        this.elementLoaded = true;
      }
    }
  }

  public initIntersectionObserver() {
    console.log('initIntersectionObserver',);
    let options = {
      rootMargin: '100px',
      threshold: 0
    };
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.reached.emit()
        }
      })
    }, options);
    this.observer.observe(this.element);

  }

  public ngOnDestroy() {
    this.observer.disconnect();
  }

}
