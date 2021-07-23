// import { createGesture, Gesture, GestureDetail } from '@ionic/core';
import { Gesture, GestureController, GestureDetail } from '@ionic/angular';
import { EventEmitter, Directive, OnInit, OnDestroy, Output, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appLongPress]'
})
export class LongPressDirective implements OnInit, OnDestroy {

  ionicGesture: Gesture;
  timerId: any;

  @Input() delay: number = 500;
  @Output() longPressed: EventEmitter<any> = new EventEmitter();

  constructor(
    private elementRef: ElementRef,
    private gestureCtrl: GestureController
  ) {  }

  ngOnInit() {
    this.ionicGesture = this.gestureCtrl.create({
      el: this.elementRef.nativeElement,
      gestureName: 'longpress',
      threshold: 0,
      gesturePriority: 100,
      passive: false,
      canStart: () => true,
      onStart: (gestureEv: GestureDetail) => {
        this.timerId = setTimeout(() => {
          this.longPressed.emit(gestureEv.event);
        }, this.delay);
      },
      onEnd: () => {
        clearTimeout(this.timerId);
      }
    });
    this.ionicGesture.enable();
  }

  ngOnDestroy() {
    this.ionicGesture.destroy();
  }
}