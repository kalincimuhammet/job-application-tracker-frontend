import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Application, ApplicationApiService } from '../services/application-api.service';
import { AuthService } from '../services/auth.services';

type EditableField = 'address' | 'applicationDate' | 'salaryExpectation' | 'rejectionDate' | 'notes';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  constructor(
    private api: ApplicationApiService,
    protected readonly authService: AuthService) {}

  protected readonly applications = signal<Application[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly onlyOpen = signal(false);
  protected readonly onlyToApply = signal(false);
  protected readonly filteredApplications = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('de-DE');
    return this.applications().filter((application) => {
      const matchesSearch = !query || [
        application.address,
        application.channel,
        application.salaryExpectation,
        application.notes,
      ].some((value) => value.toLocaleLowerCase('de-DE').includes(query));
      const matchesOpen = !this.onlyOpen() || !application.rejectionDate;
      const matchesToApply = !this.onlyToApply() || !application.applicationDate;
      return matchesSearch && matchesOpen && matchesToApply;
    });
  });
  protected readonly editingCell = signal<{ id: number; field: EditableField } | null>(null);
  protected readonly editValue = signal('');
  protected readonly form = signal({
    address: '', channel: '', applicationDate: '', salaryExpectation: '', rejectionDate: '', notes: '',
  });

async ngOnInit(): Promise<void> {
  await this.authService.initialize();
  try {
    const data = await this.api.load();
    this.applications.set(this.sortApplications(data));
  } catch (err) {
    console.error('Fehler beim Laden der Bewerbungen', err);
  }
}

  protected addApplication(): void {
    const entry = this.form();
    if (!entry.address.trim() || !entry.channel.trim()) return;
    const updated = this.sortApplications([{ id: Date.now(), ...entry }, ...this.applications()]);
    this.applications.set(updated);
    
    this.api.save(updated).catch((err) => console.error('Fehler beim Speichern der Bewerbungen', err));
    this.form.set({ address: '', channel: '', applicationDate: '', salaryExpectation: '', rejectionDate: '', notes: '' });
  }

  protected removeApplication(id: number): void {
    const updated = this.applications().filter((application) => application.id !== id);
    this.applications.set(updated);
    this.api.delete(id).catch((err) => console.error('Fehler beim Löschen der Bewerbung', err));
  }

  protected updateFormField(field: keyof ReturnType<typeof this.form>, value: string): void {
    this.form.update((current) => ({ ...current, [field]: value }));
  }

  protected beginEdit(application: Application, field: EditableField): void {
    this.editingCell.set({ id: application.id, field });
    this.editValue.set(application[field]);
  }

  protected cancelEdit(): void {
    this.editingCell.set(null);
    this.editValue.set('');
  }

  protected async updateField(application: Application, field: EditableField, value: string): Promise<void> {
    const previousValue = application[field];
    if (value === previousValue) {
      this.cancelEdit();
      return;
    }

    try {
      await this.api.update(application.id, { [field]: value });
      this.applications.update((applications) => this.sortApplications(applications.map((item) =>
        item.id === application.id ? { ...item, [field]: value } : item,
      )));
      this.cancelEdit();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Bewerbung', err);
    }
  }

  protected getAddressUrl(address: string): string | null {
    const value = address.trim();
    if (!value || (!/^https?:\/\//i.test(value) && !/^(?:www\.)?[\w.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(value))) {
      return null;
    }

    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  }

  protected formatAddress(address: string): string {
    const url = this.getAddressUrl(address);
    if (!url) return address;

    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname.replace(/^www\./i, '')}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  protected formatDate(date: string): string {
    if (!date) return 'Noch nicht beworben';
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
  }

  private sortApplications(applications: Application[]): Application[] {
    return [...applications].sort((left, right) => {
      const leftGroup = !left.applicationDate ? 0 : left.rejectionDate ? 2 : 1;
      const rightGroup = !right.applicationDate ? 0 : right.rejectionDate ? 2 : 1;

      if (leftGroup !== rightGroup) return leftGroup - rightGroup;

      const leftDate = leftGroup === 2 ? left.rejectionDate : left.applicationDate;
      const rightDate = rightGroup === 2 ? right.rejectionDate : right.applicationDate;
      return rightDate.localeCompare(leftDate) || right.id - left.id;
    });
  }
}
