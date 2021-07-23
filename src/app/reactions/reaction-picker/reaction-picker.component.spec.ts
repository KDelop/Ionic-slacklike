import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReactionPickerComponent } from './reaction-picker.component';

describe('ReactionPickerComponent', () => {
  let component: ReactionPickerComponent;
  let fixture: ComponentFixture<ReactionPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactionPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
