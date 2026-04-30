import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElevationPanelComponent } from './elevation-panel.component';

describe('ElevationPanelComponent', () => {
  let component: ElevationPanelComponent;
  let fixture: ComponentFixture<ElevationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevationPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElevationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
