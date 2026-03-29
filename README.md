<p align="center">
  <img src="src/assets/images/AquaVolt.png" alt="AquaVolt Logo" width="400"/>
</p>

<h1 align="center">AquaVolt</h1>

<p align="center">
  A desktop application for monitoring and controlling electrochemical water treatment cells — powered by Faraday's Law.
</p>

<p align="center">
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64-setup.exe">⬇️ Download for Windows</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_aarch64.dmg">⬇️ Download for macOS (Apple Silicon)</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64.dmg">⬇️ Download for macOS (Intel)</a>
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
   - [Dashboard](#dashboard)
   - [Live Stats](#live-stats)
   - [Charts](#charts)
   - [Session Log](#session-log)
   - [Electrode Health](#electrode-health)
   - [Settings](#settings)
   - [Documentation Viewer](#documentation-viewer)
3. [How It Works — Faraday's Law](#how-it-works--faradays-law)
   - [NaOCl Production](#naocl-production)
   - [ETA Calculation](#eta-calculation)
   - [Electrode Degradation](#electrode-degradation)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [License](#license)

---

## Overview

AquaVolt is a native desktop application for Raspberry Pi-connected electrochemical cells that generate sodium hypochlorite (NaOCl) for water treatment. It reads real-time sensor data from an INA219 current/voltage sensor over USB or Bluetooth, calculates chlorine production using Faraday's Law, and provides a clean interface for monitoring, controlling, and logging sessions.

Built with **Tauri 2** + **React** + **TypeScript**.

---

## Features

### Dashboard

The main view provides a real-time overview of the entire treatment session. The left sidebar contains all controls — concentration target, jar size, duty cycle, and session start/stop. The right panel displays live stats, progress, and charts.

### Live Stats

Eight live stat cards show:

- **Voltage** (V), **Current** (A), **Power** (W), **Coulombs** (C) — raw sensor readings
- **NaOCl Produced** (g), **Est. Concentration** (ppm), **ETA**, **Water Treatable** (L) — derived from Faraday's Law
- **Energy Used** (Wh), **Energy Cost** (Wh/g) — session efficiency metrics

### Charts

Three real-time scrolling charts display the last 120 seconds of session history:

- **Current (A)** — live amperage draw
- **Power (W)** — wattage over time
- **NaOCl Accumulated (g)** — cumulative chlorine production

### Session Log

Every completed or interrupted session is saved with: start time, duration, grams produced, estimated PPM, efficiency, energy used (Wh), and status. Sessions can be exported as CSV.

### Electrode Health

Tracks cumulative operating hours per electrode type and displays a health percentage bar. Supported materials:

| Electrode | Rated Lifespan |
|-----------|---------------|
| Graphite | ~100 hours |
| Titanium MMO (DSA) | ~5,000 hours |
| Platinum | No wear |

### Settings

- Connection management (USB / Bluetooth)
- Language selection (14 languages)
- Electrode type and health tracking
- Advanced controls: efficiency override, max current, max runtime, auto-stop
- All advanced settings include individual reset-to-default buttons and risk warnings

### Documentation Viewer

Offline PDF viewer for assembly guide, chemistry reference, and wiring diagram — available without an internet connection.

---

## How It Works — Faraday's Law

### NaOCl Production

Chlorine production is calculated directly from accumulated charge (coulombs):

```
grams = (charge × M_NaOCl × η) / (n × F)
```

Where:
- `charge` = coulombs accumulated (∫ I dt)
- `M_NaOCl` = 74.44 g/mol (molar mass of sodium hypochlorite)
- `η` = efficiency factor (default 70%)
- `n` = 2 (electrons transferred per molecule)
- `F` = 96,485 C/mol (Faraday's constant)

Concentration in ppm is then: `ppm = (grams / volumeLiters) × 1000`

### ETA Calculation

```
coulombsNeeded = (targetPpm × volumeL × n × F) / (M_NaOCl × η × 1000)
etaSeconds = (coulombsRemaining) / current
```

### Electrode Degradation

Graphite electrodes oxidize continuously during electrolysis. Degradation is tracked by cumulative operating seconds, converted to hours, and compared against material-specific rated lifespans to produce a health percentage.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2 (Rust backend) |
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| State management | Zustand (persisted) |
| Charts | Recharts |
| Icons | Lucide React |
| Hardware comms | INA219 sensor over I²C, serial over USB/BT |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (for Tauri)
- Raspberry Pi with INA219 sensor and AquaVolt firmware

### Install & Run

```bash
git clone https://github.com/ashwinpatri/AquaVolt.git
cd AquaVolt
npm install
npm run dev
```

### Build

```bash
npm run build
```

---

## License

MIT License © 2026 [Ashwin Patri](https://github.com/ashwinpatri) & [Dwalker1000](https://github.com/Dwalker1000)
