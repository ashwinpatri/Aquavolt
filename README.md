<p align="center">
  <img src="src/assets/images/AquaVolt.png" alt="AquaVolt Logo" width="400"/>
</p>

<h1 align="center">AquaVolt</h1>

<p align="center">
  A desktop application for monitoring and controlling electrochemical water treatment cells — powered by Faraday's Law.
</p>

<p align="center">
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.1.3_x64-setup.exe">⬇️ Download for Windows</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.1.3_aarch64.dmg">⬇️ Download for macOS (Apple Silicon)</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.1.3_x64.dmg">⬇️ Download for macOS (Intel)</a>
</p>

---

## Downloads

<table align="center">
<tr>
<td align="center">
<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64-setup.exe">
  <img src="https://img.shields.io/badge/Windows-Download-blue?style=for-the-badge&logo=windows" alt="Download for Windows" />
</a>
</td>
<td align="center">
<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_aarch64.dmg">
  <img src="https://img.shields.io/badge/macOS%20(Apple%20Silicon)-Download-black?style=for-the-badge&logo=apple" alt="Download for macOS Apple Silicon" />
</a>
</td>
<td align="center">
<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64.dmg">
  <img src="https://img.shields.io/badge/macOS%20(Intel)-Download-lightgrey?style=for-the-badge&logo=apple" alt="Download for macOS Intel" />
</a>
</td>
</tr>
</table>

---

## Overview

AquaVolt is a native desktop application for Raspberry Pi-connected electrochemical systems that generate sodium hypochlorite (NaOCl) for water treatment.

The application streams real-time sensor data from an INA219 current and voltage sensor, computes chlorine production using Faraday's Law, and provides an interface for monitoring, control, and session logging.

Built with Tauri 2, React, and TypeScript.

---

## Features

### Dashboard
Central control panel for configuring treatment sessions and monitoring system state in real time.

### Live Statistics
- Voltage (V), current (A), power (W), and charge (C)
- NaOCl produced (g), concentration (ppm), and estimated time remaining
- Energy usage and efficiency metrics

### Charts
Time-series visualization of:
- Current
- Power
- Cumulative NaOCl production

### Session Logging
Persistent session history including:
- Duration
- Output in grams and ppm
- Energy usage
- CSV export

### Electrode Health Tracking

| Material      | Estimated Lifespan |
|---------------|--------------------|
| Graphite      | ~100 hours         |
| Titanium MMO  | ~5000 hours        |
| Platinum      | Minimal wear       |

---

## How It Works

### Faraday's Law

<p align="center">
  <img src="https://latex.codecogs.com/svg.image?%5Ccolor%7Bwhite%7D%20grams%3D%5Cfrac%7BQ%5Ctimes%20M%5Ctimes%20%5Ceta%7D%7Bn%5Ctimes%20F%7D" alt="Faraday Law Equation" width="300" />
</p>

Where:
- Q = total charge in coulombs
- M = molar mass of NaOCl (74.44 g/mol)
- η = efficiency factor
- n = electrons transferred (2)
- F = Faraday constant (96485 C/mol)

### Concentration

<p align="center">
  <img src="https://latex.codecogs.com/svg.image?%5Ccolor%7Bwhite%7D%20ppm%3D%5Cfrac%7Bgrams%7D%7Bvolume_L%7D%5Ctimes1000" alt="PPM Equation" width="320" />
</p>

### Time Estimation

<p align="center">
  <img src="https://latex.codecogs.com/svg.image?%5Ccolor%7Bwhite%7D%20ETA%3D%5Cfrac%7BQ_%7Bremaining%7D%7D%7BI%7D" alt="ETA Equation" width="250" />
</p>

---

## Tech Stack

| Layer         | Details |
|---------------|---------|
| Desktop       | Tauri 2 with Rust backend, command-based IPC, and native packaging |
| Frontend      | React 19 + TypeScript with hooks-based UI architecture |
| State         | Zustand with persisted configuration and session state |
| Build         | Vite for fast local development and optimized production builds |
| Charts        | Recharts with rolling real-time data buffers |
| Hardware I/O  | INA219 current and voltage sensing over I²C on Raspberry Pi |
| Connectivity  | USB serial and Bluetooth transport between host app and device |
| Computation   | Charge integration, efficiency-adjusted NaOCl estimation, and runtime projection |

---

## Getting Started

### Requirements
- Node.js 18+
- Rust (for Tauri)
- Raspberry Pi with INA219 sensor

### Installation

```bash
git clone https://github.com/ashwinpatri/AquaVolt.git
cd AquaVolt
npm install
npm run dev
