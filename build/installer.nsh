!macro customInstallMode
  ; Installationsmodus fest auf "nur aktueller Benutzer" setzen.
  ; Dadurch wird die Seite "Fuer alle Benutzer / Nur fuer mich" uebersprungen
  ; und ZAVIRO Hub landet immer in %LOCALAPPDATA%\Programs\ZAVIRO Hub
  ; (kein Admin, keine Benutzerfrage).
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro preInit
  SetRegView 64
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallMode "CurrentUser"
  SetRegView 32
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallMode "CurrentUser"
!macroend

