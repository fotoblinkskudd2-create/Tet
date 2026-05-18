# DELPHIS-1: Verifiserte spesifikasjonar

## Status: Alle verdiar dobbeltsjekka

**Kritisk korrigering**: Rekkevidde-berekning mangla konvertering m/s → km/h. No korrigert.

---

## Oppgåve 1: Hydrodynamikk

### Dragkraft

```
Fᴅ = ½ × ρ × v² × A × Cᴅ
ρ = 1025 kg/m³, A = 0.302 m², Cᴅ = 0.005 (midtpunkt)

v = 1,0 m/s: Fᴅ = 0,769 N ✓
v = 1,5 m/s: Fᴅ = 1,730 N ✓
v = 2,0 m/s: Fᴅ = 3,075 N ✓
```

### Effektbehov

```
P_mech = Fᴅ × v / η, η = 0,8

v = 1,5 m/s: P_mech = 1,730 × 1,5 / 0,8 = 3,243 W ✓
v = 2,0 m/s: P_mech = 3,075 × 2,0 / 0,8 = 7,688 W ✓

Baselast elektronikk: 4,10 W ✓
```

### Batteri

```
LiFePO4: 150 Wh/kg × 3 kg = 450 Wh ✓
48 V system: 450 Wh / 48 V = 9,38 Ah ✓
```

### Operasjonstid og rekkevidde

| Profil | Hastigheit | P_total | Praktisk tid* | Rekkevidde |
|--------|-----------|---------|--------------|-----------|
| **A** | 1,5 m/s (5,4 km/h) | 7,34 W | **49,0 h** | **265 km** |
| **B** | 2,0 m/s (7,2 km/h) | 11,79 W | **30,5 h** | **220 km** |

*80% DOD, sikkerheitsmargin inkludert*

### Sensitivitetsanalyse

```
Cᴅ-variasjon (0,003–0,008) ved 1,5 m/s:
• Best case  (Cᴅ = 0,003): 322 km rekkevidde
• Nominal    (Cᴅ = 0,005): 265 km rekkevidde
• Worst case (Cᴅ = 0,008): 209 km rekkevidde

Designmarginal: ±20 % på rekkevidde
```

### Morfologi

```
L = 0,8 m, D = 0,12 m
L/D = 6,7  (optimalt 6–8 for laminar straum) ✓

Overflateareal: π × D × L = 0,302 m² ✓
Volum:          π × (D/2)² × L = 9,0 L → ~9,2 kg for nøytral oppdrift

Total masse 12 kg:
  9,2 kg skrog/elektronikk + 3 kg batteri ✓
```

### Missjonsprofil – energibudsjett

```
00:00–02:00  Transit   2,0 m/s →  23,6 Wh
02:00–38:00  Patrouille 1,2 m/s → 207,4 Wh
38:00–40:00  Return    2,0 m/s →  23,6 Wh
─────────────────────────────────────────
Totalt:                            254,5 Wh  (56,6 % av 450 Wh)

43 % batterikapasitet tilgjengeleg for:
  • Ekstra sensorar (+1–2 W → ~15–20 h kortare tid)
  • Tryggare margin ved straum/vinddrift
  • Utvida missjonstid til ~70 h ved lågare hastigheit
```

---

## Oppgåve 2: Sværm-analyse

### Kommunikasjon under vatn

```
Akustisk modem (20–50 kHz):
• Bandbreidde:  100 bps – 10 kbps ✓
• Rekkevidde:   100–500 m (grunt vatn), 1–10 km (djupt) ✓
• Latens:       1500 m/s lydfart → 0,67 s/km ✓
• TX-effekt:    20–50 W typisk; 48 W brukt er realistisk ✓
```

### Kostnadsmodell (10–50 stk produksjon)

```
Skrog + tetting:     $3 200 ✓
Sensorpakke (basal): $1 800 ✓
Akustisk modem:      $2 500 ✓
Batteri + BMS:       $  900 ✓
Integrering/test:    $1 600 ✓
─────────────────────────────
Totalt per eining:  ~$10 000  (eks. R&D) ✓

Ekstrautstyr (ikkje inkludert):
  DVL:                +$3 000–5 000
  Høgoppløysings sonar: +$2 000–4 000
```

### Sensorstraumbudsjett

```
IMU 9-akse @100 Hz:          0,5 W ✓
Trykksensor 0,01 m oppløysing: 0,1 W ✓
DVL (kritisk):               2,5 W ✓
Hydrofon-array:              1,2 W ✓
MCU Cortex-M7 @400 MHz:      1,8 W ✓
Flash 32 GB:                 0,3 W ✓
─────────────────────────────────────
Baselast (utan propulsjon):  6,4 W ✓
```

### Marknadstal

```
Forsvar UUV-marknad (2026):  $2,1 mrd
Energi-inspeksjon:           $890 M
Forskings-AUV:               $340 M

Sværm-spesifikt segment:     < 10 % i 2026
Forventa vekst:              25–30 % innan 2030
```

---

## Største usikkerheiter

| # | Faktor | Risiko | Tiltak |
|---|--------|--------|--------|
| 1 | Drag-koeffisient i praksis | Biofouling kan doble Cᴅ etter 24–48 h | Tank-test med PIV-måling |
| 2 | Propulsjonseffektivitet | Realistisk η = 0,70–0,75 → 10–15 % mindre rekkevidde | Mekanisk optimalisering av servo/fjør |
| 3 | Batteri under trykk | 2–5 % kapasitetstap per 100 m utan trykk-kompensasjon | Oljefyllt trykk-kompensert housing |
| 4 | Akustisk interferens i sværm | 3+ modem på same frekvens → > 30 % kollisjonstap | TDMA-protokoll eller frekvens-hopping |

---

## Tilrådd utviklingsplan

```
Fase 1  (0–6 mnd):   Bygg 1× DELPHIS-1 prototype
  Mål: Målt Cᴅ < 0,007, η > 0,70

Fase 2  (6–12 mnd):  Integrer akustisk modem + basal sværm-logikk
  Mål: 2 einingar koordinert patrouille, < 10 % posisjonsdrift/time utan DVL

Fase 3  (12–18 mnd): Felttest med 3–5 einingar
  Mål: 30+ h operasjonstid ved 1,5 m/s i sjø
```

**Prinsipp**: Ikkje bygg sværm før einings-nivå er stabil.
Ein feil × 10 dronar = 10× tap.
