export type Language = 'de' | 'en'

const DICT: Record<Language, Record<string, string>> = {
  de: {
    'nav.overview': 'Übersicht',
    'nav.updates': 'Updates',
    'nav.settings': 'Einstellungen',
    'brand.sub': 'HUB',

    'overview.title': 'Alles von ZAVIRO. An einem Ort.',
    'overview.subtitle':
      'Alle Tools, ihre Versionen und Changelogs – Installation und Start inklusive.',
    'overview.refresh': 'Neu prüfen',
    'overview.refreshing': 'Wird geprüft …',
    'overview.lastCheck': 'Zuletzt geprüft',
    'overview.installed': 'Tools installiert',
    'overview.updates': 'Updates verfügbar',
    'overview.products': 'Tools',
    'overview.noUpdates': 'Alle Tools sind aktuell.',
    'overview.noUpdatesHint': 'Es wurden keine Updates gefunden.',
    'overview.selfUpdate': 'Update für den ZAVIRO Hub',
    'overview.selfUpdateAvailable': 'Version {version} ist verfügbar.',
    'overview.selfUpdateCurrent': 'Der ZAVIRO Hub ist aktuell.',
    'overview.selfUpdateDownload': 'Update laden',
    'overview.selfUpdateInstall': 'Update installieren',
    'overview.selfUpdateRestart': 'Wird installiert …',

    'state.installed': 'Installiert',
    'state.notInstalled': 'Nicht installiert',
    'state.update': 'Update verfügbar',
    'state.current': 'Aktuell',
    'state.development': 'In Entwicklung',
    'state.planned': 'Geplant',
    'state.running': 'Läuft …',
    'state.downloading': 'Wird geladen',
    'state.verifying': 'Wird geprüft',
    'state.installing': 'Wird installiert',
    'state.done': 'Fertig',

    'action.install': 'Installieren',
    'action.update': 'Update',
    'action.launch': 'Starten',
    'action.website': 'Website',
    'action.retry': 'Erneut versuchen',
    'action.changelog': 'Changelog',

    'updates.title': 'Updates & Changelogs',
    'updates.subtitle': 'Was sich in den ZAVIRO-Tools geändert hat.',
    'updates.released': 'Veröffentlicht',
    'updates.noEntries': 'Noch keine Changelog-Einträge.',
    'updates.self': 'ZAVIRO Hub',
    'updates.check': 'Nach Updates suchen',
    'updates.checking': 'Wird gesucht …',
    'updates.downloaded': 'Update geladen – Installation startet nach dem Neustart.',
    'updates.current': 'Du verwendest bereits die neueste Version.',
    'updates.error': 'Update-Prüfung fehlgeschlagen.',

    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Sprache, Erscheinungsbild und Updates.',
    'settings.appearance': 'Erscheinungsbild',
    'settings.language': 'Sprache',
    'settings.theme': 'Design',
    'settings.themeDark': 'Dunkel',
    'settings.themeLight': 'Hell',
    'settings.accent': 'Akzentfarbe',
    'settings.updates': 'Updates',
    'settings.autoCheck': 'Beim Start nach Updates suchen',
    'settings.autoCheckHint': 'Der Hub prüft im Hintergrund, ob eine neue Version verfügbar ist.',
    'settings.about': 'Über',
    'settings.appVersion': 'Version',
    'settings.os': 'System',
    'settings.admin': 'Administratorrechte',
    'settings.adminYes': 'Ja',
    'settings.adminNo': 'Nein',
    'settings.relaunch': 'Als Administrator neu starten',
    'settings.contact': 'Kontakt',
    'settings.affiliation': 'Projektseite',

    'toast.refreshDone': 'Status aktualisiert.',
    'toast.launched': '{name} wurde gestartet.',
    'toast.installed': '{name} wurde installiert.',
    'toast.installerStarted': 'Installer gestartet – bitte im Fenster bestätigen.',
    'toast.updateDone': 'Update geladen. Die App startet neu.',
    'toast.error': 'Fehler: {message}'
  },
  en: {
    'nav.overview': 'Overview',
    'nav.updates': 'Updates',
    'nav.settings': 'Settings',
    'brand.sub': 'HUB',

    'overview.title': 'Everything by ZAVIRO. In one place.',
    'overview.subtitle':
      'All tools, their versions and changelogs – including installation and launch.',
    'overview.refresh': 'Refresh',
    'overview.refreshing': 'Checking …',
    'overview.lastCheck': 'Last checked',
    'overview.installed': 'Tools installed',
    'overview.updates': 'Updates available',
    'overview.products': 'Tools',
    'overview.noUpdates': 'All tools are up to date.',
    'overview.noUpdatesHint': 'No updates were found.',
    'overview.selfUpdate': 'Update for ZAVIRO Hub',
    'overview.selfUpdateAvailable': 'Version {version} is available.',
    'overview.selfUpdateCurrent': 'ZAVIRO Hub is up to date.',
    'overview.selfUpdateDownload': 'Download update',
    'overview.selfUpdateInstall': 'Install update',
    'overview.selfUpdateRestart': 'Installing …',

    'state.installed': 'Installed',
    'state.notInstalled': 'Not installed',
    'state.update': 'Update available',
    'state.current': 'Up to date',
    'state.development': 'In development',
    'state.planned': 'Planned',
    'state.running': 'Running …',
    'state.downloading': 'Downloading',
    'state.verifying': 'Verifying',
    'state.installing': 'Installing',
    'state.done': 'Done',

    'action.install': 'Install',
    'action.update': 'Update',
    'action.launch': 'Launch',
    'action.website': 'Website',
    'action.retry': 'Try again',
    'action.changelog': 'Changelog',

    'updates.title': 'Updates & Changelogs',
    'updates.subtitle': 'What changed in the ZAVIRO tools.',
    'updates.released': 'Released',
    'updates.noEntries': 'No changelog entries yet.',
    'updates.self': 'ZAVIRO Hub',
    'updates.check': 'Check for updates',
    'updates.checking': 'Checking …',
    'updates.downloaded': 'Update downloaded – installation starts after the restart.',
    'updates.current': 'You are already using the latest version.',
    'updates.error': 'Update check failed.',

    'settings.title': 'Settings',
    'settings.subtitle': 'Language, appearance and updates.',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.themeDark': 'Dark',
    'settings.themeLight': 'Light',
    'settings.accent': 'Accent color',
    'settings.updates': 'Updates',
    'settings.autoCheck': 'Check for updates on start',
    'settings.autoCheckHint': 'The hub checks in the background whether a new version is available.',
    'settings.about': 'About',
    'settings.appVersion': 'Version',
    'settings.os': 'System',
    'settings.admin': 'Administrator rights',
    'settings.adminYes': 'Yes',
    'settings.adminNo': 'No',
    'settings.relaunch': 'Restart as administrator',
    'settings.contact': 'Contact',
    'settings.affiliation': 'Project page',

    'toast.refreshDone': 'Status updated.',
    'toast.launched': '{name} was launched.',
    'toast.installed': '{name} was installed.',
    'toast.installerStarted': 'Installer started – please confirm in the window.',
    'toast.updateDone': 'Update downloaded. The app will restart.',
    'toast.error': 'Error: {message}'
  }
}

let current: Language = 'de'

export function setLanguage(language: Language): void {
  current = language
}

export function getLanguage(): Language {
  return current
}

/** Übersetzt einen Schlüssel; {platzhalter} werden ersetzt. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const template = DICT[current][key] ?? DICT.de[key] ?? key
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  )
}
