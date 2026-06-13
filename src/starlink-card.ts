import { LitElement, html, svg, nothing, type TemplateResult } from 'lit';
import type { HassEntity } from 'home-assistant-js-websocket';
import {
  type HomeAssistant,
  type LovelaceCard,
  type LovelaceCardEditor,
  fireEvent,
} from 'custom-card-helpers';

import type { StarlinkCardConfig, StarlinkStatus } from './types';
import { CARD_VERSION, DEFAULT_SUFFIX, STATUS_META } from './const';
import { computeStatus } from './state';
import { formatSpeed, formatPing, formatPercent } from './format';
import { localize } from './localize/localize';
import { styles } from './styles';
import dishImg from './images/starlink.png';

/* eslint-disable no-console */
console.info(
  `%c STARLINK-CARD %c v${CARD_VERSION} `,
  'color:#fff;background:#2f6bff;font-weight:700;border-radius:3px 0 0 3px;padding:2px 4px',
  'color:#2f6bff;background:#1a1a2e;border-radius:0 3px 3px 0;padding:2px 4px',
);

const ROLE_DOMAIN: Record<string, string> = {
  connected: 'binary_sensor',
  obstructed: 'binary_sensor',
  heating: 'binary_sensor',
  thermal_throttle: 'binary_sensor',
  sleep: 'binary_sensor',
  stowed: 'switch',
  download: 'sensor',
  upload: 'sensor',
  ping: 'sensor',
  ping_drop_rate: 'sensor',
  restart: 'button',
};

export class StarlinkCard extends LitElement implements LovelaceCard {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  public hass!: HomeAssistant;
  private _config!: StarlinkCardConfig;

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('starlink-card-editor') as LovelaceCardEditor;
  }

  static getStubConfig(): Partial<StarlinkCardConfig> {
    return { name: 'Starlink', entities: {} };
  }

  public setConfig(config: StarlinkCardConfig): void {
    if (!config) throw new Error('Invalid configuration');
    this._config = { show_stats: true, show_buttons: false, ...config };
  }

  public getCardSize(): number {
    return 3;
  }

  /** Base device slug, derived from the primary entity (strip known suffix). */
  private _base(): string {
    const obj = this._config.entity?.split('.')[1];
    if (!obj) return 'starlink';
    const suffixes = Object.values(DEFAULT_SUFFIX).sort((a, b) => b.length - a.length);
    for (const s of suffixes) {
      if (obj.endsWith(`_${s}`)) return obj.slice(0, obj.length - s.length - 1);
    }
    return obj;
  }

  private _entityId(role: keyof typeof ROLE_DOMAIN): string | undefined {
    const explicit = this._config.entities?.[role as keyof StarlinkCardConfig['entities']];
    if (explicit) return explicit as string;
    const suffix = DEFAULT_SUFFIX[role];
    if (!suffix) return undefined;
    return `${ROLE_DOMAIN[role]}.${this._base()}_${suffix}`;
  }

  private _stateObj(role: keyof typeof ROLE_DOMAIN): HassEntity | undefined {
    const id = this._entityId(role);
    return id ? this.hass?.states[id] : undefined;
  }

  private _stateStr(role: keyof typeof ROLE_DOMAIN): string | undefined {
    return this._stateObj(role)?.state;
  }

  private _num(role: keyof typeof ROLE_DOMAIN): number | null {
    const v = this._stateObj(role)?.state;
    if (v === undefined || v === 'unavailable' || v === 'unknown') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  private _status(): StarlinkStatus {
    return computeStatus({
      connected: this._stateStr('connected'),
      obstructed: this._stateStr('obstructed'),
      heating: this._stateStr('heating'),
      thermal: this._stateStr('thermal_throttle'),
      sleep: this._stateStr('sleep'),
      stowed: this._stateStr('stowed'),
    });
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;

    const status = this._status();
    const meta = STATUS_META[status];
    const name = this._config.name ?? 'Starlink';
    const moreInfoId = this._config.entity ?? this._entityId('connected');

    return html`
      <ha-card>
        <div class="header clickable" @click=${() => this._moreInfo(moreInfoId)}>
          <div class="name">${name}</div>
          <div class="status" style="color:${meta.color}">
            <span class="dot"></span>${localize(meta.labelKey, this.hass)}
          </div>
        </div>

        <div class="stage is-${meta.effect}">
          <div class="dish" style="background-image:url(${dishImg})"></div>
          ${this._overlay(status, meta.color)}
        </div>

        ${this._config.show_stats ? this._stats(status) : nothing}
        ${this._config.show_buttons ? this._buttons() : nothing}
      </ha-card>
    `;
  }

  private _overlay(status: StarlinkStatus, color: string): TemplateResult | typeof nothing {
    const effect = STATUS_META[status].effect;

    if (effect === 'online') {
      return html`<svg class="overlay" viewBox="0 0 340 156" preserveAspectRatio="xMidYMid meet">
        ${svg`
          <g stroke="${color}">
            <path class="wave" d="M236 46 q16 -12 32 -4" />
            <path class="wave w2" d="M234 36 q24 -20 50 -8" />
            <path class="wave w3" d="M232 26 q34 -28 68 -10" />
          </g>
          <circle cx="262" cy="22" r="3.4" fill="${color}" />
        `}
      </svg>`;
    }

    if (effect === 'warn') {
      return html`<svg class="overlay" viewBox="0 0 340 156" preserveAspectRatio="xMidYMid meet">
        ${svg`
          <g stroke="${color}" stroke-dasharray="3 7">
            <path class="wave" d="M236 46 q16 -12 32 -4" />
            <path class="wave w2" d="M234 36 q24 -20 50 -8" />
          </g>
          <path d="M256 16 l10 18 h-20 z" fill="${color}" />
          <rect x="260" y="23" width="2.4" height="6" fill="#fff" />
          <rect x="260" y="31" width="2.4" height="2.4" fill="#fff" />
        `}
      </svg>`;
    }

    if (effect === 'snow') {
      const flakes = [
        [120, 0],
        [165, 0.7],
        [205, 0.3],
        [240, 1.1],
      ];
      return html`<svg class="overlay" viewBox="0 0 340 156" preserveAspectRatio="xMidYMid meet">
        ${flakes.map(
          ([x, d]) =>
            svg`<circle class="snow" cx="${x}" cy="40" r="2.6" style="animation-delay:${d}s" />`,
        )}
      </svg>`;
    }

    if (effect === 'heat') {
      return html`<svg
        class="overlay heat"
        viewBox="0 0 340 156"
        preserveAspectRatio="xMidYMid meet"
      >
        ${svg`
          <g stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8">
            <path d="M205 60 q6 -8 0 -16 q-6 -8 0 -16" />
            <path d="M225 58 q6 -8 0 -16 q-6 -8 0 -16" />
            <path d="M245 60 q6 -8 0 -16 q-6 -8 0 -16" />
          </g>
        `}
      </svg>`;
    }

    return nothing;
  }

  private _statCell(labelKey: string, value: string, cls = ''): TemplateResult {
    const [v, u] = value.split(' ');
    return html`<div class="stat ${cls}">
      <div class="v">${v}${u ? html`<span class="u"> ${u}</span>` : nothing}</div>
      <div class="l">${localize(labelKey, this.hass)}</div>
    </div>`;
  }

  private _stats(status: StarlinkStatus): TemplateResult {
    const dead = status === 'offline' || status === 'unavailable' || status === 'stowed';
    if (status === 'obstructed') {
      return html`<div class="footer">
        ${this._statCell('stats.download', formatSpeed(this._num('download')), 'dl muted')}
        ${this._statCell('stats.obstruction', formatPercent(this._num('ping_drop_rate')))}
        ${this._statCell('stats.ping', formatPing(this._num('ping')))}
      </div>`;
    }
    return html`<div class="footer">
      ${this._statCell('stats.download', dead ? '—' : formatSpeed(this._num('download')), 'dl')}
      ${this._statCell('stats.upload', dead ? '—' : formatSpeed(this._num('upload')))}
      ${this._statCell('stats.ping', dead ? '—' : formatPing(this._num('ping')))}
    </div>`;
  }

  private _buttons(): TemplateResult {
    return html`<div class="buttons">
      <ha-icon-button .label=${localize('actions.reboot', this.hass)} @click=${this._restart}>
        <ha-icon icon="mdi:restart"></ha-icon>
      </ha-icon-button>
    </div>`;
  }

  private _moreInfo(entityId?: string): void {
    if (!entityId) return;
    fireEvent(this, 'hass-more-info', { entityId });
  }

  private _restart(): void {
    const id = this._entityId('restart');
    if (id && this.hass) this.hass.callService('button', 'press', { entity_id: id });
  }
}

if (!customElements.get('starlink-card')) {
  customElements.define('starlink-card', StarlinkCard);
}

(window as unknown as { customCards: unknown[] }).customCards =
  (window as unknown as { customCards: unknown[] }).customCards || [];
(window as unknown as { customCards: unknown[] }).customCards.push({
  type: 'starlink-card',
  name: 'Starlink Card',
  description: 'Animated card for the native Starlink integration.',
  preview: true,
  documentationURL: 'https://github.com/hudsonbrendon/starlink-card',
});
