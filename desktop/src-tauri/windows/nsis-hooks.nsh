; Finn NSIS hooks — Start Menu + desktop shortcuts so the app is launchable after setup.
; The installed exe starts the bundled API itself.

!macro NSIS_HOOK_PREINSTALL
!macroend

!macro NSIS_HOOK_POSTINSTALL
  SetShellVarContext current
  CreateDirectory "$SMPROGRAMS\Finn"
  CreateShortCut "$SMPROGRAMS\Finn\Finn.lnk" "$INSTDIR\Finn Pentest Harness.exe" "" "$INSTDIR\Finn Pentest Harness.exe" 0
  CreateShortCut "$DESKTOP\Finn.lnk" "$INSTDIR\Finn Pentest Harness.exe" "" "$INSTDIR\Finn Pentest Harness.exe" 0
!macroend

!macro NSIS_HOOK_PREUNINSTALL
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  SetShellVarContext current
  Delete "$DESKTOP\Finn.lnk"
  Delete "$SMPROGRAMS\Finn\Finn.lnk"
  RMDir "$SMPROGRAMS\Finn"
!macroend
