import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  public getUserLocation(): Promise<{lat: number, lng: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocalização não suportada");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (resp) => {
          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        (err) => {
          reject(err);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  }


}
