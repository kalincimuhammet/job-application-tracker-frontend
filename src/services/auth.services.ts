import { computed, inject, Injectable, signal } from '@angular/core';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { RUNTIME_CONFIG } from '../app/runtime-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly runtimeConfig = inject(RUNTIME_CONFIG);
  private readonly redirectUri = `${window.location.origin}/auth/callback`;
  private readonly postLogoutRedirectUri = `${window.location.origin}/`;
  private readonly userManager = new UserManager({
    authority: this.runtimeConfig.authority,
    client_id: this.runtimeConfig.client_id,
    redirect_uri: this.redirectUri,
    post_logout_redirect_uri: this.postLogoutRedirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  });

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isInitializing = signal(true);
  readonly error = signal<string | null>(null);
  readonly displayName = computed(() => {
    const profile = this.user()?.profile;
    return [profile?.name, profile?.family_name, profile?.preferred_username, profile?.email, profile?.sub]
      .find(value => typeof value === 'string' && value.trim().length > 0)
      ?? '';
  });

  async initialize(): Promise<void> {
    try {
      if (window.location.pathname === '/auth/callback') {
        await this.userManager.signinRedirectCallback();
        window.history.replaceState({}, document.title, '/');
      }

      const user = await this.userManager.getUser();
      if (user && !user.expired) {
        await this.loadUserInfo(user);
      }
      this.setUser(user && !user.expired ? user : null);
      if (!this.isAuthenticated()) {
        await this.userManager.signinRedirect({
          state: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        });
      }
    } catch (error) {
      console.error('ZITADEL authentication failed:', error);
      this.error.set('Die Anmeldung bei ZITADEL ist fehlgeschlagen.');
    } finally {
      this.isInitializing.set(false);
    }
  }

  private setUser(user: User | null): void {
    this.user.set(user);
    this.isAuthenticated.set(!!user && !user.expired);
  }

  private async loadUserInfo(user: User): Promise<void> {
    const response = await fetch(`${this.userManager.settings.authority}/oidc/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`ZITADEL userinfo request failed: ${response.status}`);
    }

    const userInfo = await response.json() as Record<string, unknown>;
    Object.assign(user.profile, userInfo);
  }
    login(): void {
    this.userManager.signinRedirect({
      state: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    });
  }
    getAccessToken(): string | null {
    const user = this.user();
    return user?.access_token ?? null;
  }

  async logout(): Promise<void> {
    await this.userManager.signoutRedirect({
      post_logout_redirect_uri: this.postLogoutRedirectUri,
    });
  }
}
