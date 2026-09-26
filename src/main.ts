import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { RUNTIME_CONFIG, RuntimeConfig } from './app/runtime-config';

async function bootstrap(): Promise<void> {
  const response = await fetch('/assets/config.json');
  if (!response.ok) {
    throw new Error(`Runtime-Konfiguration konnte nicht geladen werden: ${response.status}`);
  }

  const runtimeConfig = await response.json() as RuntimeConfig;
  await bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
    ],
  });
}

bootstrap().catch((err) => console.error(err));
