import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { nowIso } from '../ids';
import type { CalculatorProfile, CalculatorProfiles } from '../../domain/calculatorProfile';
import type { LifeStage } from '../../domain/calculators/types';
import type { ErrorEntry } from '../../lib/errorLog';
import type { Profile } from '../models';
import type { AppLockConfig } from '../services/appLock';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  profile: Profile;
  onboarding_done: boolean;
  privacy_accepted_version: string | null;
  theme: ThemePreference;
  last_backup_at: string | null;
  /** Perfil (faixa etária + sexo) escolhido em cada calculadora, por slug. */
  calculator_profiles: CalculatorProfiles;
  /** Público escolhido na aba Calculadoras (criança, adulto ou idoso). */
  calculator_audience: LifeStage;
  /** Bloqueio por PIN/digital (null = desligado). */
  app_lock: AppLockConfig | null;
  /** Erros inesperados recentes, só neste aparelho (fora do backup), para o "Relatar um problema". */
  error_log: ErrorEntry[];
}

const DEFAULTS: AppSettings = {
  profile: { name: '', crn_number: '', crn_state: '', specialty: '' },
  onboarding_done: false,
  privacy_accepted_version: null,
  theme: 'system',
  last_backup_at: null,
  calculator_profiles: {},
  calculator_audience: 'adulto',
  app_lock: null,
  error_log: [],
};

/** Preferências e perfil do profissional (chave → JSON) e calculadoras favoritas. */
export function settingsRepository(db: SqlDatabase) {
  return {
    async all(): Promise<AppSettings> {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
      const stored = Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.value)]));
      return { ...DEFAULTS, ...stored };
    },

    async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, JSON.stringify(value)],
      );
      notifyChange('settings');
    },

    /**
     * Grava o registro de erros sem avisar as telas: quem lê é só o "Relatar um problema",
     * e um erro numa tela não pode disparar novas renderizações em cadeia.
     */
    async saveErrorLog(entries: ErrorEntry[]): Promise<void> {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['error_log', JSON.stringify(entries)],
      );
    },

    /** Guarda o perfil de uma calculadora (fica salvo para as próximas vezes). */
    async setCalculatorProfile(slug: string, profile: CalculatorProfile): Promise<void> {
      const current = await this.all();
      await this.set('calculator_profiles', { ...current.calculator_profiles, [slug]: profile });
    },

    favoriteSlugs(): Promise<string[]> {
      return db
        .getAllAsync<{ calculator_slug: string }>('SELECT calculator_slug FROM favorites ORDER BY created_at ASC')
        .then((rows) => rows.map((row) => row.calculator_slug));
    },

    async toggleFavorite(slug: string): Promise<boolean> {
      const existing = await db.getFirstAsync('SELECT 1 AS found FROM favorites WHERE calculator_slug = ?', [slug]);

      if (existing) {
        await db.runAsync('DELETE FROM favorites WHERE calculator_slug = ?', [slug]);
      } else {
        await db.runAsync('INSERT INTO favorites (calculator_slug, created_at) VALUES (?, ?)', [slug, nowIso()]);
      }

      notifyChange('favorites');
      return !existing;
    },
  };
}
