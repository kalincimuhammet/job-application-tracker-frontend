import { InjectionToken } from '@angular/core';

export interface RuntimeConfig {
  authority: string;
  client_id: string;
  apiUrl: string;
}

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('runtime.config');