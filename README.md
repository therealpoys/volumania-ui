# Volumania - Frontend Demo

Eine frontend-only Demo-Anwendung für Kubernetes PVC (Persistent Volume Claim) Management und Autoscaling.

## Überblick

Volumania zeigt eine moderne Benutzeroberfläche für die Verwaltung von Kubernetes-Speicherressourcen. Die Anwendung läuft vollständig im Browser mit Mock-Daten und benötigt keine Backend-Infrastruktur.

## Features

- 📊 **Dashboard**: Übersicht über PVC-Status und Speichernutzung
- 🔧 **AutoScaler Management**: Erstellen und verwalten von PVC-AutoScalern
- 🎨 **Moderne UI**: Dark/Light Mode mit shadcn/ui Komponenten
- 📱 **Responsive Design**: Funktioniert auf Desktop und Mobile
- 🔄 **Live-Updates**: Simulierte Echtzeit-Datenaktualisierungen

## Technologie-Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod Validation
- **Mock Data**: Integriertes Mock-API-System

## Schnellstart

1. **Anwendung starten**:
   ```bash
   npm run dev
   ```

2. **Im Browser öffnen**:
   ```
   http://localhost:5000
   ```

Das war's! Die Anwendung läuft vollständig mit Mock-Daten.

## Verfügbare Scripts

- `npm run dev` - Startet den Entwicklungsserver (Port 5000)
- `npm run build` - Erstellt die Produktions-Version
- `npm run start` - Startet den Produktions-Server
- `npm run check` - TypeScript-Typenprüfung

## Mock-Daten

Die Anwendung enthält vordefinierte Mock-Daten für:
- **PVCs**: Verschiedene Namespaces und Speichergrößen
- **AutoScaler**: Beispielkonfigurationen für automatische Skalierung
- **Live-Updates**: Simulierte Änderungen der Speichernutzung

## API-Spezifikation

Für zukünftige Backend-Integration ist eine vollständige API-Spezifikation verfügbar in `API_SPECIFICATION.md`.

## Projektstruktur

```
├── client/src/           # Frontend-Code
│   ├── components/       # UI-Komponenten
│   ├── pages/           # Anwendungsseiten
│   ├── services/        # API-Services und Mock-Daten
│   └── hooks/          # Custom React Hooks
├── shared/             # Geteilte TypeScript-Schemas
├── server/             # Minimaler Vite-Server
└── API_SPECIFICATION.md # Backend-API-Dokumentation
```

## Weiterentwicklung

Die Anwendung ist vorbereitet für eine einfache Backend-Integration:

1. **API-Service umschalten**: `USE_MOCK: false` in `client/src/services/apiService.ts`
2. **Backend implementieren**: Nutze die API-Spezifikation in `API_SPECIFICATION.md`
3. **WebSocket hinzufügen**: Für Echtzeit-Updates (optional)

## Support

Diese Demo-Anwendung dient als Prototyp für Kubernetes-Storage-Management-Tools.