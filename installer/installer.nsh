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
  ; 3. The screen server (Next.js) writes a route cache into the program folder while the app runs, with paths
  ;    longer than 260 characters. The OLD version's uninstaller cannot delete those, so an update stopped with
  ;    "Failed to uninstall old application files ... 2". Remove the program's frontend folder first with a
  ;    long-path aware command ("\\?\" prefix). Program files only: the data lives in AppData and is not touched.
  ${If} ${FileExists} "$INSTDIR\resources\frontend\*.*"
    nsExec::Exec `"$SYSDIR\cmd.exe" /c rd /s /q "\\?\$INSTDIR\resources\frontend"`
    Pop $R9
  ${EndIf}
!macroend

; Uninstall (also run during every future update): delete with long-path support first, then the normal way.
!macro customRemoveFiles
  nsExec::Exec `"$SYSDIR\cmd.exe" /c rd /s /q "\\?\$INSTDIR\resources"`
  Pop $R9
  RMDir /r $INSTDIR
!macroend
