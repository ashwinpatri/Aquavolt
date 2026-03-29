<p align="center">
  <img src="src/assets/images/AquaVolt.png" alt="AquaVolt Logo" width="400"/>
</p>

<h1 align="center">AquaVolt</h1>

<p align="center">
  Electrochemical Water Treatment Platform<br/>
  Real-time monitoring and control of NaOCl production using Faraday’s Law
</p>

---

## Downloads

<p align="center">

<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64-setup.exe">
  <img src="https://img.shields.io/badge/Windows-Download-blue?style=for-the-badge&logo=windows" />
</a>

&nbsp;&nbsp;

<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_aarch64.dmg">
  <img src="https://img.shields.io/badge/macOS%20(Apple%20Silicon)-Download-black?style=for-the-badge&logo=apple" />
</a>

&nbsp;&nbsp;

<a href="https://github.com/ashwinpatri/AquaVolt/releases/latest/download/AquaVolt_1.0.6_x64.dmg">
  <img src="https://img.shields.io/badge/macOS%20(Intel)-Download-lightgrey?style=for-the-badge&logo=apple" />
</a>

</p>

---

## Overview

AquaVolt is a native desktop application for Raspberry Pi–connected electrochemical systems that generate sodium hypochlorite (NaOCl) for water treatment.

The application streams real-time sensor data from an INA219 current/voltage sensor, computes chlorine production using Faraday’s Law, and provides a structured interface for monitoring, control, and session logging.

Built with Tauri 2, React, and TypeScript.

---

## Features

### Dashboard
Central control panel for configuring treatment sessions and monitoring system state in real time.

### Live Statistics
- Voltage (V), Current (A), Power (W), Charge (C)
- NaOCl produced (g), concentration (ppm), estimated time remaining
- Energy usage and efficiency metrics

### Charts
Time-series visualization of:
- Current
- Power
- Cumulative NaOCl production

### Session Logging
Persistent session history including:
- Duration
- Output (grams, ppm)
- Energy usage
- Export to CSV

### Electrode Health Tracking

| Material        | Estimated Lifespan |
|----------------|-------------------|
| Graphite       | ~100 hours        |
| Titanium MMO   | ~5000 hours       |
| Platinum       | Minimal wear      |

---

## How It Works

### Faraday’s Law

<p align="center">
  <img src="https://latex.codecogs.com/png.image?\dpi{120}grams%20=%20\frac{Q%20\times%20M%20\times%20\eta}{n%20\times%20F}" alt="Faraday Law Equation"/>
</p>

Where:
- Q = total charge (coulombs)
- M = molar mass of NaOCl (74.44 g/mol)
- η = efficiency factor
- n = electrons transferred (2)
- F = Faraday constant (96485 C/mol)

### Concentration

<p align="center">
  <img src="https://latex.codecogs.com/png.image?\dpi{120}ppm%20=%20\frac{grams}{volume_{L}}%20\times%201000" alt="PPM Equation"/>
</p>

### Time Estimation

<p align="center">
  <img src="https://latex.codecogs.com/png.image?\dpi{120}ETA%20=%20\frac{remaining\ charge}{current}" alt="ETA Equation"/>
</p>

---

## Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Desktop     | Tauri 2 (Rust) |
| Frontend    | React + TypeScript |
| Build       | Vite |
| State       | Zustand |
| Charts      | Recharts |
| Hardware    | INA219 over I²C (USB / Bluetooth bridge) |

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
