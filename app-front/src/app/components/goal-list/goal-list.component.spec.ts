import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { GoalListComponent } from './goal-list.component';
import { GoalService, GoalResponse } from '../../services/goal/goal.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('GoalListComponent', () => {
  let component: GoalListComponent;
  let fixture: ComponentFixture<GoalListComponent>;
  let goalServiceSpy: jasmine.SpyObj<GoalService>;

  const mockGoals: GoalResponse[] = [
    {
      id: 1,
      name: '100 km no mês',
      description: 'Pedalar 100 km',
      targetValue: 100,
      currentValue: 40,
      progressPercent: 40,
      unit: 'km',
      createdAt: '2026-11-01',
      deadLine: '2099-12-31',
    },
  ];

  beforeEach(async () => {
    goalServiceSpy = jasmine.createSpyObj('GoalService', ['findAll', 'update', 'delete']);
    goalServiceSpy.findAll.and.returnValue(of(mockGoals));

    await TestBed.configureTestingModule({
      imports: [GoalListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: GoalService, useValue: goalServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load goals on init', () => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalse();
    expect(component.goals.length).toBe(1);
  });

  it('should detect expired deadlines', () => {
    expect(component.isExpired('2020-01-01')).toBeTrue();
    expect(component.isExpired('2099-12-31')).toBeFalse();
  });

  it('should delete goal only when confirmed', () => {
    const notification = TestBed.inject(NotificationService);
    const confirmSpy = spyOn(notification, 'confirm').and.returnValue(of(false));
    component.delete(mockGoals[0]);
    expect(goalServiceSpy.delete).not.toHaveBeenCalled();

    confirmSpy.and.returnValue(of(true));
    goalServiceSpy.delete.and.returnValue(of(void 0));
    component.delete(mockGoals[0]);

    expect(goalServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.goals.length).toBe(0);
  });
});
