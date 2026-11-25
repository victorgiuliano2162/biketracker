import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GoalService } from './goal.service';

describe('GoalService', () => {
  let service: GoalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoalService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GoalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create goals via POST /api/goal', () => {
    const payload = [
      { name: '100km', description: 'Desc', targetValue: 100, unit: 'km', deadLine: '2026-12-31' },
    ];
    service.create(payload).subscribe((res) => expect(res.length).toBe(1));

    const req = httpMock.expectOne('/api/goal');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush([{ id: 1, ...payload[0], currentValue: 0, progressPercent: 0, createdAt: '2026-11-01' }]);
  });

  it('should list goals via GET /api/goal', () => {
    service.findAll().subscribe((res) => expect(res.length).toBe(1));
    const req = httpMock.expectOne('/api/goal');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('should update goal via PUT /api/goal/:id', () => {
    service.update(5, { targetValue: 200 }).subscribe((res) => expect(res.targetValue).toBe(200));
    const req = httpMock.expectOne('/api/goal/5');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 5, targetValue: 200 });
  });

  it('should delete goal via DELETE /api/goal/:id', () => {
    service.delete(5).subscribe();
    const req = httpMock.expectOne('/api/goal/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
