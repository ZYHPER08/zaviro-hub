import { useApp } from '../context'
import { t } from '../lib/i18n'

export default function Settings(): JSX.Element {
  const { settings, setSettings, system, notify } = useApp()

  if (!settings) return <div className="empty"><span className="spin" />Laden …</div>

  const patch = (next: Partial<typeof settings>): void => {
    void window.api.settings.set(next).then((value) => setSettings(value))
  }

  const relaunchAsAdmin = async (): Promise<void> => {
    const result = await window.api.system.relaunchAsAdmin()
    if (!result.ok && result.error) notify(result.error, 'err')
  }

  return (
    <div className="view">
      <section className="view-head">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </section>

      <section className="panel">
        <h3>{t('settings.appearance')}</h3>
        <div className="settings-grid">
          <div className="field">
            <label>{t('settings.language')}</label>
            <select
              value={settings.language}
              onChange={(event) => patch({ language: event.target.value as 'de' | 'en' })}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="field">
            <label>{t('settings.theme')}</label>
            <div className="seg">
              <button
                className={settings.theme === 'dark' ? 'active' : ''}
                onClick={() => patch({ theme: 'dark' })}
              >
                {t('settings.themeDark')}
              </button>
              <button
                className={settings.theme === 'light' ? 'active' : ''}
                onClick={() => patch({ theme: 'light' })}
              >
                {t('settings.themeLight')}
              </button>
            </div>
          </div>

          <div className="field">
            <label>{t('settings.accent')}</label>
            <input
              type="color"
              value={settings.accentColor}
              onChange={(event) => patch({ accentColor: event.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>{t('settings.updates')}</h3>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.autoCheckUpdates}
            onChange={(event) => patch({ autoCheckUpdates: event.target.checked })}
          />
          {t('settings.autoCheck')}
        </label>
        <p className="muted small">{t('settings.autoCheckHint')}</p>
      </section>

      <section className="panel">
        <h3>{t('settings.about')}</h3>
        <div className="kv">
          <span>{t('settings.appVersion')}</span>
          <strong>{system?.appVersion ?? '–'}</strong>
        </div>
        <div className="kv">
          <span>{t('settings.os')}</span>
          <strong>{system?.os ?? '–'}</strong>
        </div>
        <div className="kv">
          <span>{t('settings.admin')}</span>
          <strong>{system?.isAdmin ? t('settings.adminYes') : t('settings.adminNo')}</strong>
        </div>
        {!system?.isAdmin && (
          <div>
            <button className="btn sm" onClick={() => void relaunchAsAdmin()}>
              {t('settings.relaunch')}
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h3>{t('settings.contact')}</h3>
        <div className="kv">
          <span>E-Mail</span>
          <strong>
            <a
              className="link"
              href="mailto:zaviro.official0@gmail.com"
              onClick={(event) => {
                event.preventDefault()
                void window.api.hub.openExternal('mailto:zaviro.official0@gmail.com')
              }}
            >
              zaviro.official0@gmail.com
            </a>
          </strong>
        </div>
        <div className="kv">
          <span>{t('settings.affiliation')}</span>
          <strong>
            <button
              className="link"
              onClick={() => void window.api.hub.openExternal('https://zaviro-cleaner.netlify.app')}
            >
              zaviro-cleaner.netlify.app
            </button>
          </strong>
        </div>
      </section>
    </div>
  )
}
