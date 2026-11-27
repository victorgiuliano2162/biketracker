import { buildGpxXml, escapeXml } from './gpx-builder.util';

describe('gpx-builder.util', () => {
  it('should escape XML special characters', () => {
    expect(escapeXml(`A & B <C> "D" 'E'`)).toBe(
      'A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos;',
    );
  });

  it('should build valid GPX XML with route name, description and trackpoints', () => {
    const xml = buildGpxXml(
      {
        id: '1',
        name: 'Serra & Mar',
        description: 'Trecho <duro>',
      } as any,
      [
        {
          latitude: -8.05,
          longitude: -34.87,
          altitudeInMeters: 120,
          recordedAt: '2026-11-01T08:00:00Z',
        },
      ],
    );

    expect(xml).toContain('<name>Serra &amp; Mar</name>');
    expect(xml).toContain('<desc>Trecho &lt;duro&gt;</desc>');
    expect(xml).toContain('<trkpt lat="-8.05" lon="-34.87">');
    expect(xml).toContain('<ele>120</ele>');
  });
});
