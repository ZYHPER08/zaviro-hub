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
      'Die Schaltzentrale: alle Tools, ihre Versionen, Updates und Changelogs – ein Klick, um zu installieren oder zu starten. Der ZAVIRO Store ist zentraler Ort für alle Produkte.',
    icon: '◈',
    accent: '#7c5cff',
    homepage: 'https://zaviro-dusky.vercel.app',
    state: 'released',
    self: true,
    category: 'hub',
    badge: 'empfohlen',
    screenshot: 'store-hub-overview.png',
    features: [
      'ZAVIRO Store mit Suche und Kategorien',
      'Updates & Changelogs aller Produkte',
      'Installer direkt aus der Oberfläche',
      'Eigenes Auto-Update'
    ],
    tags: ['store', 'update', 'zentrale', 'installer'],
    changelog: [
      {
        version: '1.1.9',
        date: '2026-11-19',
        notes: [
          '🐛 Installer startet jetzt zuverlässig – Fallback über die Windows-Shell bei NSIS-Absturz',
          '🔧 Fehlerhafte Meldung „Installer wurde geschlossen" bei sofortigem Installer-Exit behoben'
        ]
      },
      {
        version: '1.1.8',
        date: '2026-11-19',
        notes: [
          '🛒 Neuer ZAVIRO Store: Suche, Kategorien und Produkt-Vorschauen',
          '🖼️ Echte Screenshots für Hub, Launcher und Cleaner',
          '⬇️ Download-Integrität: temporäre Datei, Hash-Strom und atomic rename',
          '🐛 Behebt NSIS-Fehler „Installer integrity check has failed" beim Update'
        ]
      },
      {
        version: '1.1.3',
        date: '2026-10-23',
        notes: [
          '🌐 Cleaner- und Launcher-Feed liegen jetzt ebenfalls auf GitHub Pages',
          '📦 Katalog kennt die neuen Download- und Update-Adressen'
        ]
      },
      {
        version: '1.1.2',
        date: '2026-10-22',
        notes: [
          '📦 Veröffentlichung läuft jetzt automatisch über GitHub Releases + Pages',
          '🧾 Release-Skript prüft beide Feeds inkl. Prüfsumme'
        ]
      },
      {
        version: '1.1.0',
        date: '2026-10-22',
        notes: [
          '🌐 Update-Feed jetzt über GitHub Pages',
          '🔁 Automatischer Fallback auf den zweiten Feed',
          '🐛 Umlaute in Fehlermeldungen korrekt dargestellt'
        ]
      },
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
    homepage: 'https://zaviro-launcher.vercel.app',
    feedUrl: 'https://zyhper08.github.io/zaviro-launcher-feed/',
    registryName: 'ZAVIRO Gaming Launcher',
    programFolder: 'ZAVIRO',
    exeName: 'ZAVIRO.exe',
    state: 'released',
    category: 'gaming',
    badge: 'beliebt',
    screenshot: 'store-launcher-dashboard.png',
    features: [
      'Steam-, Epic-, EA- & Ubisoft-Scan',
      'Performance-Overlay mit FPS',
      'Auto-Clicker & Makro-Studio',
      'KI-Assistent & Preis-Deals',
      'Freunde-Chat & Cloud-Sync'
    ],
    tags: ['spiele', 'gaming', 'steam', 'epic', 'auto-clicker', 'makros', 'overlay', 'freunde'],
    changelog: [
      {
        version: '1.5.4',
        date: '2026-11-17',
        notes: [
          '🐛 Update-Overlay zeigt jetzt immer die korrekte Versionsnummer',
          '⬇️ Stabilerer Installer-Download mit Integritätsprüfung'
        ]
      },
      {
        version: '1.5.2',
        date: '2026-10-23',
        notes: [
          '🌐 Auto-Update läuft jetzt über GitHub Pages',
          '🔁 Netlify bleibt als zweiter Feed im Hintergrund'
        ]
      },
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
        version: '1.4.0',
        date: '2026-10-19',
        notes: [
          '🖼️ SteamGridDB-Schlüssel wird automatisch mitgeliefert',
          '🏷️ Versionsnummer zeigt jetzt immer die echte App-Version',
          '⚡ Schnellerer Start durch gespeicherten Titel-Cache'
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
    homepage: 'https://zaviro-cleaner.vercel.app',
    feedUrl: 'https://zyhper08.github.io/zaviro-cleaner-feed/',
    registryName: 'ZAVIRO Cleaner',
    programFolder: 'ZAVIRO Cleaner',
    exeName: 'ZAVIRO Cleaner.exe',
    state: 'released',
    category: 'system',
    badge: 'empfohlen',
    screenshot: 'store-cleaner-dashboard.png',
    features: [
      '12 Reinigungs-Kategorien mit Vorschau',
      'Speicher-Übersicht für alle Laufwerke',
      'Autostart- & Prozess-Manager',
      'Duplikat- und Datei-Suche (SHA-256)',
      'Registry-Check ohne Auto-Löschen',
      'Treiber-Prüfung & Selbst-Update'
    ],
    tags: ['pc', 'reinigung', 'system', 'speicher', 'caches', 'treiber', 'autostart', 'duplikate'],
    changelog: [
      {
        version: '1.2.1',
        date: '2026-10-23',
        notes: [
          '🌐 Auto-Update läuft jetzt über GitHub Pages',
          '⬇️ Website-Download zeigt direkt auf das GitHub-Release'
        ]
      },
      {
        version: '1.2.0',
        date: '2026-10-22',
        notes: [
          '💾 Neue Speicher-Ansicht mit Gesamt-, freiem und belegtem Platz pro Laufwerk',
          '🔍 Automatische Erkennung von SSD, HDD, NVMe und USB-Laufwerken',
          '🔄 Selbst-Update: automatische Prüfung beim Start, Download und Installation',
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
    id: 'security-bot',
    name: 'ZAVIRO Security Bot',
    tagline: 'Discord-Schutz mit eigenem Dashboard',
    description:
      'Ein Multi-Tenant-Discord-Schutzbot mit eigenem Dashboard: moderiert automatisch, schützt vor Spam und Raubzügen, sichert Backups und liefert ein Audit-Log – alles pro Server konfigurierbar.',
    icon: '🛡️',
    accent: '#f43f5e',
    homepage: 'https://zaviro-dusky.vercel.app',
    state: 'in-development',
    category: 'bot',
    features: [
      'Automatischer Schutz gegen Spam & Raubzüge',
      'Dashboard pro Server mit Rollen- & Teamverwaltung',
      'Backups, Logs und Lockdown per Klick',
      'Abo- & Abrechnungssystem integriert'
    ],
    tags: ['discord', 'bot', 'moderation', 'spam', 'security', 'server'],
    changelog: []
  },
  {
    id: 'citybuild',
    name: 'ZAVIRO CityBuild Server',
    tagline: 'Minecraft-CityBuild mit eigenem Plugin',
    description:
      'Ein vollständiger CityBuild-Minecraft-Server mit eigenem Plugin ZaviroCore: Plot-Welt, Farmwelt, Spawn mit AdminShop und Crates, Rangsystem, Wirtschaft, Discord-Anbindung und Webshop.',
    icon: '🏗️',
    accent: '#f59e0b',
    homepage: 'https://zaviro-dusky.vercel.app',
    state: 'in-development',
    category: 'server',
    features: [
      'PlotSquared, Farmwelt/Nether/End mit Reset',
      'Eigenes Plugin ZaviroCore & fertige Konfigurationen',
      'Doppel-Rangsystem, Vault-Wirtschaft, Crates & Voucher',
      'DiscordSRV, Tickets & Tebex-Webshop'
    ],
    tags: ['minecraft', 'server', 'citybuild', 'paper', 'plugin', 'zavirocore', 'webshop'],
    changelog: []
  },
  {
    id: 'backup',
    name: 'ZAVIRO Backup',
    tagline: 'Automatische Backups, ohne Cloud-Zwang',
    description:
      'Geplante Sicherungslösung: geplante Backups wichtiger Ordner, Wiederherstellung per Zeitstempel und lokale Archive. Work in progress.',
    icon: '💾',
    accent: '#0ea5e9',
    homepage: 'https://zaviro-dusky.vercel.app',
    state: 'in-development',
    category: 'system',
    features: [
      'Geplante Ordner-Backups',
      'Wiederherstellung per Zeitstempel',
      'Lokale Archive ohne Cloud-Zwang'
    ],
    tags: ['backup', 'sicherung', 'dateien', 'lokal'],
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
    homepage: 'https://zaviro-dusky.vercel.app',
    state: 'planned',
    category: 'system',
    features: [
      'CPU-, RAM- & GPU-Monitoring',
      'Immer sichtbares Overlay',
      'Alarme bei Temperaturspitzen'
    ],
    tags: ['performance', 'monitoring', 'cpu', 'gpu', 'ram', 'overlay'],
    changelog: []
  }
]

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export const CATEGORY_ORDER = ['hub', 'system', 'gaming', 'bot', 'server'] as const
