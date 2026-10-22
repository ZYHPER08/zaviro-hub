import type { ProductDefinition } from './types'

/**
 * Produktkatalog des ZAVIRO Hub.
 *
 * Der Katalog liegt bewusst fest im Code: die Hub-App kennt damit immer alle
 * ZAVIRO-Tools und kann deren Changelogs anzeigen. Die Verfügbarkeit und die
 * neueste Version kommen zur Laufzeit aus den Update-Feeds der Produkte.
 */
export const PRODUCTS: ProductDefinition[] = [
  {
    id: 'hub',
    name: 'ZAVIRO Hub',
    tagline: 'Alles von ZAVIRO an einem Ort',
    description:
      'Diese Übersicht: alle Tools, ihre Versionen, Updates und Changelogs – und ein Klick, um zu installieren oder zu starten.',
    icon: '◈',
    accent: '#7c5cff',
    homepage: 'https://zaviro-cleaner.netlify.app',
    state: 'released',
    self: true,
    features: [
      'Übersicht über alle ZAVIRO-Tools',
      'Updates & Changelogs aller Produkte',
      'Installer direkt aus der Oberfläche',
      'Eigenes Auto-Update'
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-10-22',
        notes: [
          '🆕 Erste Version des ZAVIRO Hub',
          '📦 Produkt-Übersicht mit Installationsstatus',
          '🔄 Update-Prüfung für alle ZAVIRO-Tools',
          '📜 Changelogs je Produkt',
          '⬇️ Installer-Download mit SHA-512-Prüfung'
        ]
      }
    ]
  },
  {
    id: 'gaming-launcher',
    name: 'ZAVIRO Gaming Launcher',
    tagline: 'Game Hub, Performance und Automation',
    description:
      'Der Komplett-Hub für Gamer: Game-Hub mit automatischen Covern, Performance-Overlay, Auto-Clicker, Makro-Studio, KI-Assistent, Statistiken, Screenshots, Preis-Deals, Freunde-Chat und stille Auto-Updates.',
    icon: '🎮',
    accent: '#22d3ee',
    homepage: 'https://zaviro-478.netlify.app',
    feedUrl: 'https://zaviro-update.netlify.app/',
    registryName: 'ZAVIRO Gaming Launcher',
    programFolder: 'ZAVIRO',
    exeName: 'ZAVIRO.exe',
    state: 'released',
    features: [
      'Steam-, Epic-, EA- & Ubisoft-Scan',
      'Performance-Overlay mit FPS',
      'Auto-Clicker & Makro-Studio',
      'KI-Assistent & Preis-Deals',
      'Freunde-Chat & Cloud-Sync'
    ],
    changelog: [
      {
        version: '1.5.1',
        date: '2026-10-21',
        notes: [
          '✨ Animiertes Update-Overlay mit rotierenden Ringen',
          '🔇 Stille Installation ohne Rückfragen',
          '🔄 Automatischer Neustart mit der neuen Version'
        ]
      },
      {
        version: '1.5.0',
        date: '2026-10-21',
        notes: [
          '👥 Online-Konten, Freunde & Cloud-Sync repariert',
          '🔄 Automatische Update-Prüfung beim Start',
          '🤖 KI-Assistent steuert jetzt den Auto-Clicker',
          '🌍 Vollständige englische Übersetzung'
        ]
      },
      {
        version: '1.4.3',
        date: '2026-10-19',
        notes: [
          '🔇 Updates laufen still – keine „für alle Benutzer"-Abfrage mehr',
          '👤 ZAVIRO wird pro Benutzer installiert (kein Admin nötig)'
        ]
      },
      {
        version: '1.4.0',
        date: '2026-10-19',
        notes: [
          '🖼️ SteamGridDB-Schlüssel wird automatisch mitgeliefert',
          '🏷️ Versionsnummer zeigt jetzt immer die echte App-Version',
          '⚡ Schnellerer Start durch gespeicherten Titel-Cache'
        ]
      },
      {
        version: '1.3.0',
        date: '2026-10-18',
        notes: [
          '👥 Freundesliste mit Anfragen & Präsenz-Status',
          '💬 Echtzeit-Chat mit JPEG-Bildversand',
          '🔑 API-Schlüssel verschlüsselt + Integrations-Panel',
          '📦 NSIS-Installer mit sauberer Deinstallation'
        ]
      },
      {
        version: '1.0.0',
        date: '2026-10-15',
        notes: [
          'Game Hub mit Steam/Epic/EA/Ubisoft-Scan',
          'Auto-Clicker, Makro-Studio und Performance-Monitoring'
        ]
      }
    ]
  },
  {
    id: 'cleaner',
    name: 'ZAVIRO Cleaner',
    tagline: 'Systembereinigung ohne Bloatware',
    description:
      'Der schlanke PC-Reiniger: 12 Reinigungs-Kategorien mit Vorschau, Speicher-Übersicht über alle Laufwerke, Autostart- und Prozess-Manager, Duplikat-Suche, Registry-Check ohne Auto-Löschen, Treiber-Prüfung und Selbst-Update.',
    icon: '🧹',
    accent: '#3ddc97',
    homepage: 'https://zaviro-cleaner.netlify.app',
    feedUrl: 'https://zaviro-cleaner-update.netlify.app/',
    registryName: 'ZAVIRO Cleaner',
    programFolder: 'ZAVIRO Cleaner',
    exeName: 'ZAVIRO Cleaner.exe',
    state: 'released',
    features: [
      '12 Reinigungs-Kategorien mit Vorschau',
      'Speicher-Übersicht für alle Laufwerke',
      'Autostart- & Prozess-Manager',
      'Duplikat- und Datei-Suche (SHA-256)',
      'Registry-Check ohne Auto-Löschen',
      'Treiber-Prüfung & Selbst-Update'
    ],
    changelog: [
      {
        version: '1.2.0',
        date: '2026-10-22',
        notes: [
          '💾 Neue Speicher-Ansicht mit Gesamt-, freiem und belegtem Platz pro Laufwerk',
          '🔍 Automatische Erkennung von SSD, HDD, NVMe und USB-Laufwerken',
          '🔄 Selbst-Update: automatische Prüfung beim Start, Download und Installation aus der App',
          '🧩 Überarbeitete Treiber-Prüfung mit Windows-Update-Installation',
          '🔐 Neustart als Administrator funktioniert jetzt zuverlässig (UAC)'
        ]
      },
      {
        version: '1.1.0',
        date: '2026-10-21',
        notes: [
          '📦 Installer läuft ohne Hänger durch (CurrentUser-Modus)',
          '🧩 Gerätetreiber prüfen und über Windows Update aktualisieren',
          '🔗 Direktlink zur offiziellen Herstellerseite je Gerät'
        ]
      },
      {
        version: '1.0.0',
        date: '2026-10-18',
        notes: [
          '🧹 Erste Version: Systembereinigung, Autostart, Prozesse',
          '🔁 Duplikate, große Dateien und Registry-Check'
        ]
      }
    ]
  },
  {
    id: 'backup',
    name: 'ZAVIRO Backup',
    tagline: 'Automatische Backups, ohne Cloud-Zwang',
    description:
      'Geplante Sicherungslösung: geplante Backups wichtiger Ordner, Wiederherstellung per Zeitstempel und lokale Archive. Work in progress.',
    icon: '💾',
    accent: '#f59e0b',
    homepage: 'https://zaviro-cleaner.netlify.app',
    state: 'in-development',
    features: [
      'Geplante Ordner-Backups',
      'Wiederherstellung per Zeitstempel',
      'Lokale Archive ohne Cloud-Zwang'
    ],
    changelog: []
  },
  {
    id: 'performance',
    name: 'ZAVIRO Performance',
    tagline: 'System-Monitoring für den Desktop',
    description:
      'Geplantes Standalone-Tool für CPU-, RAM- und GPU-Monitoring mit Overlay und Alarmen – geplant nach dem Gaming Launcher.',
    icon: '📈',
    accent: '#ec4899',
    homepage: 'https://zaviro-478.netlify.app',
    state: 'planned',
    features: [
      'CPU-, RAM- & GPU-Monitoring',
      'Immer sichtbares Overlay',
      'Alarme bei Temperaturspitzen'
    ],
    changelog: []
  }
]

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCTS.find((product) => product.id === id)
}
