# Kopiert Hooks nach .git/hooks (Git for Windows / PowerShell)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$hookSrc = Join-Path $PSScriptRoot "git-hooks\post-commit"
$hookDst = Join-Path $root ".git\hooks\post-commit"
if (-not (Test-Path $hookSrc)) { Write-Error "Nicht gefunden: $hookSrc"; exit 1 }
if (-not (Test-Path (Join-Path $root ".git"))) { Write-Error "Kein Git-Repo: $root"; exit 1 }
Copy-Item -Force $hookSrc $hookDst
# Git führt sh-Hooks aus; unter Windows oft ohne chmod nötig
Write-Host "OK: post-commit -> $hookDst (Auto-Push nach jedem Commit)"
