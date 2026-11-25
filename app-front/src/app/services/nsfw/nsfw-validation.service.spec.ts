import { TestBed } from '@angular/core/testing';
import { NsfwValidationService } from './nsfw-validation.service';

describe('NsfwValidationService', () => {
  let service: NsfwValidationService;

  const validPngFile = (): File => {
    const base64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new File([bytes], 'test.png', { type: 'image/png' });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NsfwValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow neutral images', async () => {
    (service as any).model = {
      classify: jasmine.createSpy('classify').and.resolveTo([
        { className: 'Neutral', probability: 0.95 },
        { className: 'Porn', probability: 0.02 },
        { className: 'Sexy', probability: 0.03 },
      ]),
    };

    const result = await service.classify(validPngFile());
    expect(result).toEqual({ blocked: false });
  });

  it('should block when Porn exceeds threshold', async () => {
    (service as any).model = {
      classify: jasmine.createSpy('classify').and.resolveTo([
        { className: 'Porn', probability: 0.72 },
        { className: 'Neutral', probability: 0.28 },
      ]),
    };

    const result = await service.classify(validPngFile());
    expect(result.blocked).toBeTrue();
    expect(result.reason).toContain('72%');
  });

  it('should block when Hentai exceeds threshold', async () => {
    (service as any).model = {
      classify: jasmine.createSpy('classify').and.resolveTo([
        { className: 'Hentai', probability: 0.8 },
      ]),
    };

    const result = await service.classify(validPngFile());
    expect(result.blocked).toBeTrue();
    expect(result.reason).toContain('Hentai');
  });

  it('should fail-open when model.classify throws', async () => {
    (service as any).model = {
      classify: jasmine.createSpy('classify').and.rejectWith(new Error('WebGL error')),
    };

    const result = await service.classify(validPngFile());
    expect(result).toEqual({ blocked: false });
  });
});
