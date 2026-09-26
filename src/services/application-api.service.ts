// application-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RUNTIME_CONFIG } from '../app/runtime-config';

export interface Application {
  id: number;
  address: string;
  channel: string;
  applicationDate: string;
  salaryExpectation: string;
  rejectionDate: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = inject(RUNTIME_CONFIG).apiUrl;
  
  async load(): Promise<Application[]> {
    return firstValueFrom(this.http.get<Application[]>(this.apiUrl));
  }

  async save(applications: Application[]): Promise<void> {
    await firstValueFrom(
      this.http.post<{ success: boolean }>(this.apiUrl, applications)
    );
  }
  async update(id: number, changes: Partial<Application>): Promise<void> {
  await firstValueFrom(
    this.http.patch<{ success: boolean }>(`${this.apiUrl}?id=${id}`, changes)
  );
}
  async delete(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.apiUrl}?id=${id}`)
    );
  }
}