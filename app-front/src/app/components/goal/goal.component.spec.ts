import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { GoalComponent } from './goal.component';
import { GoalService } from '../../services/goal/goal.service';

describe('GoalComponent', () => {
  let component: GoalComponent;
  let fixture: ComponentFixture<GoalComponent>;
  let goalServiceSpy: jasmine.SpyObj<GoalService>;
  let router: Router;

  beforeEach(async () => {
    goalServiceSpy = jasmine.createSpyObj('GoalService', ['create']);

    await TestBed.configureTestingModule({
      imports: [GoalComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: GoalService, useValue: goalServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(GoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add and remove goal form groups', () => {
    expect(component.goalForms.length).toBe(1);
    component.addGoal();
    expect(component.goalForms.length).toBe(2);
    component.removeGoal(1);
    expect(component.goalForms.length).toBe(1);
  });

  it('should format deadline and submit valid goals', () => {
    goalServiceSpy.create.and.returnValue(of([]));
    component.goalForms.at(0).patchValue({
      name: '150 km no mês',
      description: 'Treino de base',
      targetValue: 150,
      unit: 'km',
      deadLine: new Date(2026, 11, 31),
    });

    component.submit();

    expect(goalServiceSpy.create).toHaveBeenCalledWith([
      jasmine.objectContaining({
        name: '150 km no mês',
        targetValue: 150,
        unit: 'km',
        deadLine: '2026-12-31',
      }),
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['/goals']);
  });

  it('should reset saving flag when submit fails', () => {
    goalServiceSpy.create.and.returnValue(throwError(() => new Error('500')));
    component.goalForms.at(0).patchValue({
      name: 'Meta',
      description: 'Desc',
      targetValue: 10,
      unit: 'rides',
      deadLine: '2026-12-31',
    });

    component.submit();

    expect(component.saving).toBeFalse();
  });
});
