import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RouteDetailComponent } from './route-detail.component';
import { AuthService } from '../../services/auth/auth.service';
import { CommentService } from '../../services/comment/comment.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('RouteDetailComponent', () => {
  let component: RouteDetailComponent;
  let fixture: ComponentFixture<RouteDetailComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    authServiceSpy.getCurrentUserId.and.returnValue('owner-1');

    commentServiceSpy = jasmine.createSpyObj('CommentService', ['list', 'create', 'delete']);
    commentServiceSpy.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RouteDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CommentService, useValue: commentServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                data: {
                  route: {
                    id: '1',
                    name: 'Trilha A & B <Serra>',
                    description: 'Subida "pesada" & técnica',
                    country: 'BR',
                    distanceInKm: 10,
                    elevationInMeters: 100,
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    startCity: 'Recife',
                    routeDifficulty: 'MODERADA',
                    isPublic: true,
                    ownerId: 'owner-1',
                    userName: 'Victor',
                  },
                  points: [
                    {
                      latitude: -8.05,
                      longitude: -34.87,
                      altitudeInMeters: 10,
                      recordedAt: '2026-11-01T08:00:00',
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and identify owner with action menu button', () => {
    expect(component).toBeTruthy();
    expect(component.isOwner).toBeTrue();
    expect(fixture.nativeElement.querySelector('.more-btn')).toBeTruthy();
  });

  it('should hide action menu button for non-owner viewing public route', () => {
    authServiceSpy.getCurrentUserId.and.returnValue('other-user');
    fixture.detectChanges();
    expect(component.isOwner).toBeFalse();
    expect(fixture.nativeElement.querySelector('.more-btn')).toBeNull();
  });

  it('should escape XML special characters when building GPX export', () => {
    const gpx = (component as any).buildGpx(component.route, component.points);
    expect(gpx).toContain('<name>Trilha A &amp; B &lt;Serra&gt;</name>');
    expect(gpx).toContain('<desc>Subida &quot;pesada&quot; &amp; técnica</desc>');
  });

  it('should publish and delete comments with permission check', () => {
    const created = {
      id: 42,
      routeId: '1',
      authorId: 'owner-1',
      authorName: 'Victor',
      content: 'Excelente pedal!',
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    commentServiceSpy.create.and.returnValue(of(created));
    commentServiceSpy.delete.and.returnValue(of(void 0));
    const notification = TestBed.inject(NotificationService);
    spyOn(notification, 'confirm').and.returnValue(of(true));

    component.newComment = 'Excelente pedal!';
    component.submitComment();

    expect(component.comments.length).toBe(1);
    expect(component.newComment).toBe('');
    expect(component.canDeleteComment(created)).toBeTrue();

    component.deleteComment(created);
    expect(commentServiceSpy.delete).toHaveBeenCalledWith('1', 42);
    expect(component.comments.length).toBe(0);
  });
});
