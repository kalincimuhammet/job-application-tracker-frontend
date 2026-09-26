import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ApplicationApiService } from '../services/application-api.service';
import { AuthService } from '../services/auth.services';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ApplicationApiService, useValue: { load: async () => [] } },
        {
          provide: AuthService,
          useValue: {
            initialize: async () => undefined,
            isAuthenticated: () => false,
            login: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Willkommen bei Bewerbungsübersicht');
  });
});
