; Custom NSIS hooks for the VC-Inmotions installer.
;  - customInit: when a version is already installed, tell the user this is an UPDATE and ask first.
;  - customCheckAppRunning: stop the app AND its background server processes (node.exe) so the
;    installer never shows "VC-Inmotions cannot be closed".
; The database lives in the user's AppData folder (not the install folder) and is never touched here.

!macro customInit
  ReadRegStr $R8 SHELL_CONTEXT "${UNINSTALL_REGISTRY_KEY}" "DisplayVersion"
  ${If} $R8 != ""
  ${AndIfNot} ${Silent}
    MessageBox MB_YESNO|MB_ICONQUESTION "VC-Inmotions $R8 is already installed.$\r$\n$\r$\nUpdate to version ${VERSION}?$\r$\n$\r$\nYour data and database will be kept. The application will be closed during the update." IDYES +2
    Abort
  ${EndIf}
!macroend

!macro customCheckAppRunning
  ; 1. the desktop app (and everything it started)
  nsExec::Exec `"$SYSDIR\taskkill.exe" /F /T /IM "${APP_EXECUTABLE_FILENAME}"`
  Pop $R9
  ; 2. background backend/frontend (node.exe) that run from the install folder
  nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $$_.Path -like '$INSTDIR\*' } | Stop-Process -Force"`
  Pop $R9
  Sleep 1500
!macroend
