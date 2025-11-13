// app.config.ts
import { 
  ApplicationConfig, 
  provideBrowserGlobalErrorListeners, 
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // Torna a zoneless
    provideRouter(routes), 
    // provideClientHydration(withEventReplay()), // ← COMMENTA TEMPORANEAMENTE QUESTA RIGA
    provideHttpClient(withFetch())
  ]
};