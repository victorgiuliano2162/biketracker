import { RouteResponse } from '../../models/route.model';
import { TrackPoint } from '../../services/route/route.service';

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildGpxXml(route: RouteResponse, points: TrackPoint[]): string {
  const safeName = escapeXml(route.name ?? 'Rota');
  const descTag = route.description
    ? `\n    <desc>${escapeXml(route.description)}</desc>`
    : '';
  const trkpts = points
    .map(
      (p) =>
        `    <trkpt lat="${p.latitude}" lon="${p.longitude}">\n      <ele>${p.altitudeInMeters}</ele>\n      <time>${escapeXml(String(p.recordedAt ?? ''))}</time>\n    </trkpt>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Trakker"\n  xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>${safeName}</name>${descTag}\n    <trkseg>\n${trkpts}\n    </trkseg>\n  </trk>\n</gpx>`;
}

export function downloadGpxFile(route: RouteResponse, points: TrackPoint[]): void {
  const gpx = buildGpxXml(route, points);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/\s+/g, '_')}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
