import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { type HomeAssistant, type LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import type { StarlinkCardConfig } from './types';

interface SchemaItem {
  name: string;
  selector: Record<string, unknown>;
}

const SCHEMA: SchemaItem[] = [
  { name: 'name', selector: { text: {} } },
  { name: 'entity', selector: { entity: { integration: 'starlink' } } },
  { name: 'show_stats', selector: { boolean: {} } },
  { name: 'show_buttons', selector: { boolean: {} } },
];

const LABELS: Record<string, string> = {
  name: 'Name',
  entity: 'Primary entity (Starlink device)',
  show_stats: 'Show throughput stats',
  show_buttons: 'Show reboot button',
};

export class StarlinkCardEditor extends LitElement implements LovelaceCardEditor {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  public hass!: HomeAssistant;
  private _config!: StarlinkCardConfig;

  public setConfig(config: StarlinkCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s: SchemaItem) => LABELS[s.name] ?? s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }
}

if (!customElements.get('starlink-card-editor')) {
  customElements.define('starlink-card-editor', StarlinkCardEditor);
}
