import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinneroverlayComponent } from './spinneroverlay.component';

describe('SpinneroverlayComponent', () => {
  let component: SpinneroverlayComponent;
  let fixture: ComponentFixture<SpinneroverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinneroverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinneroverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
