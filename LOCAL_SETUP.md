# Lokale Entwicklung - Volumania

## Voraussetzungen

- **Node.js**: Version 18 oder höher
- **npm**: Normalerweise mit Node.js installiert

## Installation und Setup

### 1. Repository klonen/herunterladen

```bash
# Falls von Git
git clone <repository-url>
cd volumania

# Oder ZIP-Datei entpacken und in Ordner wechseln
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Anwendung starten

```bash
npm run dev
```

Die Anwendung öffnet sich automatisch unter: **http://localhost:5000**

## Entwicklung

### Verfügbare Kommandos

```bash
# Entwicklungsserver starten (Hot Reload)
npm run dev

# Produktions-Build erstellen
npm run build

# Produktions-Build testen
npm run start

# TypeScript-Typen prüfen
npm run check
```

### Projektstruktur

```
volumania/
├── client/src/           # Frontend React-Code
│   ├── components/       # Wiederverwendbare UI-Komponenten
│   ├── pages/           # Anwendungsseiten
│   ├── services/        # API-Services und Mock-Daten
│   ├── hooks/          # Custom React Hooks
│   └── lib/            # Utility-Funktionen
├── shared/             # TypeScript-Schemas (Frontend/Backend geteilt)
├── server/             # Minimaler Vite-Server
└── *.md               # Dokumentation
```

### Mock-Daten bearbeiten

Mock-Daten befinden sich in `client/src/services/mockData.ts`:

```typescript
// PVC-Daten hinzufügen/bearbeiten
export const mockPVCs: PVC[] = [
  {
    id: "pvc-1",
    name: "app-data",
    namespace: "production",
    // ... weitere Eigenschaften
  }
];

// AutoScaler-Daten hinzufügen/bearbeiten  
export const mockAutoScalers: AutoScaler[] = [
  // ...
];
```

### UI-Komponenten anpassen

- **Design-System**: Datei `client/src/index.css` für Farben/Themes
- **Komponenten**: Ordner `client/src/components/ui/` (shadcn/ui)
- **Seiten**: Ordner `client/src/pages/`

### Mock zu Real API wechseln

In `client/src/services/apiService.ts`:

```typescript
export const API_CONFIG = {
  USE_MOCK: false,  // Auf false setzen
  BASE_URL: 'http://your-backend:3001'  // Backend-URL
};
```

## Troubleshooting

### Port 5000 bereits belegt

```bash
# Anderen Port verwenden
npm run dev -- --port 3000
```

### Node.js Version zu alt

```bash
# Node.js Version prüfen
node --version

# Mindestens v18 erforderlich
```

### TypeScript-Fehler

```bash
# Typen prüfen
npm run check

# Falls Fehler in node_modules
npm install
```

### Hot Reload funktioniert nicht

- Browser-Cache leeren (Strg+F5)
- Dev-Server neu starten
- Browser-Entwicklertools öffnen und Console prüfen

## Backend-Integration

Für echte Kubernetes-Integration siehe `API_SPECIFICATION.md`.

### Benötigte Backend-Endpoints:

- `GET /api/pvcs` - Alle PVCs abrufen
- `GET /api/pvcs/:namespace/:name` - Einzelne PVC
- `GET /api/autoscalers` - Alle AutoScaler
- `POST /api/autoscalers` - AutoScaler erstellen
- `DELETE /api/autoscalers/:id` - AutoScaler löschen

### WebSocket (optional):

```
ws://localhost:3001/ws
```

Für Echtzeit-Updates der PVC-Daten.

## Produktions-Build

```bash
# Build erstellen
npm run build

# Statische Dateien im dist/ Ordner
# Mit jedem Webserver auslieferbar (nginx, Apache, etc.)
```

## Support

Bei Problemen:
1. Console-Fehler in Browser-Entwicklertools prüfen
2. Terminal-Output des Dev-Servers prüfen
3. `npm run check` für TypeScript-Fehler ausführen