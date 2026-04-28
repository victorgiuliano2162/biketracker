import { Injectable } from '@angular/core';

export interface ParsedGpx {
  coords: [number, number][];
  elevations: number[];
}

@Injectable({ providedIn: 'root' })
export class GpxParserService {

  parse(content: string): ParsedGpx {
    const xml = new DOMParser().parseFromString(content, 'application/xml');
    const trkpts = xml.querySelectorAll('trkpt, rtept');
    const coords: [number, number][] = [];
    const elevations: number[] = [];

    Array.from(trkpts).forEach(pt => {
      const lat = parseFloat(pt.getAttribute('lat') ?? '');
      const lon = parseFloat(pt.getAttribute('lon') ?? '');
      if (isNaN(lat) || isNaN(lon)) return;

      coords.push([lat, lon]);

      const eleEl = pt.querySelector('ele');
      if (eleEl?.textContent) {
        const ele = parseFloat(eleEl.textContent);
        if (!isNaN(ele)) elevations.push(ele);
      }
    });

    return { coords, elevations };
  }
}
