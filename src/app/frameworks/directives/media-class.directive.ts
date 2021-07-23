import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[mediaClass]'
})
export class MediaClassDirective {

  @Input() mediaType: String;

  constructor(
    private elementRef: ElementRef
  ) {
  }

  public ngAfterViewInit() {
    let className = this.mediaType.replace(/\.|\//g, '-');
    this.elementRef.nativeElement.classList.add(className);
  }

}
