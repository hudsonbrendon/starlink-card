# Starlink Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/hudsonbrendon/starlink-card.svg)](https://github.com/hudsonbrendon/starlink-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An animated Lovelace card for Home Assistant's **native [Starlink integration](https://www.home-assistant.io/integrations/starlink/)**, in the spirit of [vacuum-card](https://github.com/denysdovhan/vacuum-card). It shows your dish with a real product photo and reacts to the dish's live status — animated signal waves when online, an obstruction warning, snow-melt, sleep, stow and offline states.

![Starlink Card states](images/screenshot.png)

## Features

- 📡 Real Starlink Standard dish artwork with **state-driven animations**
- 🟢 Online (animated signal), ⚠️ Obstructed, ❄️ Melting snow, 🔥 Overheating, 💤 Sleeping, 📦 Stowed, ⚪ Offline
- 📊 Live Download / Upload / Ping stats
- 🌐 English + Português (pt-BR), follows your HA language
- 🎛️ Visual (GUI) editor
- 🎨 Theme-aware (uses your HA theme colors)

## Installation

### HACS (recommended)

1. Open **HACS → Frontend**.
2. If not yet in the default store: **⋮ → Custom repositories**, add `https://github.com/hudsonbrendon/starlink-card`, category **Lovelace/Dashboard**.
3. Install **Starlink Card** and refresh.

### Manual

1. Download `starlink-card.js` from the [latest release](https://github.com/hudsonbrendon/starlink-card/releases).
2. Copy it to `config/www/`.
3. Add the resource under **Settings → Dashboards → Resources**:
   - URL `/local/starlink-card.js`, type **JavaScript Module**.

## Usage

Add the card via the dashboard UI (it appears as **Starlink Card**). The
minimal YAML is just:

```yaml
type: custom:starlink-card
name: Starlink
```

**Works in any Home Assistant language.** The card resolves its entities through
the entity registry using each entity's stable integration key (`translation_key`
/ `device_class`) — **not** its display name — so it works the same whether your
HA is in English, Português, Deutsch, etc. By default it auto-discovers the
Starlink device. If you have more than one, point it at any one Starlink entity:

```yaml
type: custom:starlink-card
name: Starlink
entity: binary_sensor.starlink_connectivity # any entity of the target device
show_stats: true
show_buttons: false
```

You normally **don't** need to list entities. Only override if auto-resolution
misses something — use _your_ actual entity ids (they are localized, so pick
them from the entity picker in the GUI editor):

```yaml
type: custom:starlink-card
name: Starlink
entities:
  connected: binary_sensor.starlink_conectividade
  obstructed: binary_sensor.starlink_obstruido_no_momento
  download: sensor.starlink_taxa_de_transferencia_de_download
  upload: sensor.starlink_taxa_de_transferencia_de_upload
  ping: sensor.starlink_ping
  ping_drop_rate: sensor.starlink_taxa_de_perda_de_ping
  stowed: switch.starlink_recolhido
  restart: button.starlink_reiniciar
```

## Options

| Name           | Type    | Default      | Description                                              |
| -------------- | ------- | ------------ | -------------------------------------------------------- |
| `type`         | string  | **required** | `custom:starlink-card`                                   |
| `name`         | string  | `Starlink`   | Card title                                               |
| `entity`       | string  | _optional_   | Primary entity; anchors more-info and entity derivation  |
| `entities`     | object  | _optional_   | Explicit entity ids per role (see above)                 |
| `show_stats`   | boolean | `true`       | Show the Download / Upload / Ping footer                 |
| `show_buttons` | boolean | `false`      | Show the reboot button                                   |

### Status mapping

The displayed status is derived from the integration's entities (first match wins):
`unavailable → stowed → sleeping → offline → obstructed → overheating → melting snow → online`.

## Development

```bash
npm install
npm test        # unit tests (vitest)
npm run build   # bundles to starlink-card.js (artwork inlined)
npm start       # watch build
```

## License

MIT © [Hudson Brendon](https://github.com/hudsonbrendon)
