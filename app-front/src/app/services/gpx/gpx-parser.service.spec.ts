import { TestBed } from '@angular/core/testing';
import { GpxParserService } from './gpx-parser.service';

describe('GpxParserService', () => {
  let service: GpxParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpxParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse trkpt coordinates and elevations from GPX XML', () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="-8.05" lon="-34.87"><ele>12.5</ele></trkpt>
          <trkpt lat="-8.06" lon="-34.88"><ele>25.0</ele></trkpt>
        </trkseg></trk>
      </gpx>`;

    const parsed = service.parse(gpx);
    expect(parsed.coords).toEqual([[-8.05, -34.87], [-8.06, -34.88]]);
    expect(parsed.elevations).toEqual([12.5, 25.0]);
  });

  it('should ignore points with invalid coordinates and support rtept', () => {
    const gpx = `<gpx><rte>
      <rtept lat="invalid" lon="-34.87"><ele>10</ele></rtept>
      <rtept lat="-8.10" lon="-34.90"></rtept>
    </rte></gpx>`;

    const parsed = service.parse(gpx);
    expect(parsed.coords).toEqual([[-8.10, -34.90]]);
    expect(parsed.elevations).toEqual([]);
  });
});
