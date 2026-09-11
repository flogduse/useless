# deploy-gh.ps1 — build single-file bundle and publish to GitHub Pages (gh-pages branch)
$root = $PSScriptRoot
Push-Location $root
try {
  & "$root\build.ps1"
  if (-not $?) { throw "build failed" }

  $bundle = Get-Content -Raw "$root\dist\index.html"

  # does origin have a gh-pages branch yet?
  git ls-remote --heads origin gh-pages 2>&1 | Out-Null
  $remoteRef = ((git ls-remote --heads origin gh-pages 2>$null) | Out-String).Trim()
  $hasBranch = $remoteRef.Length -gt 0

  $wt = Join-Path $env:TEMP "uselessos-ghpages-$PID"
  git worktree remove $wt --force 2>&1 | Out-Null
  if ($hasBranch) {
    git fetch origin gh-pages 2>&1 | Out-Null
    git worktree add --detach $wt origin/gh-pages 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "worktree add failed" }
    Remove-Item "$wt\*" -Recurse -Force -Exclude ".git" -ErrorAction SilentlyContinue
  } else {
    New-Item -ItemType Directory -Force -Path $wt | Out-Null
    Remove-Item "$wt\*" -Recurse -Force -ErrorAction SilentlyContinue
    git -C $wt init -q 2>&1 | Out-Null
    git -C $wt remote add origin https://github.com/flogduse/useless.git 2>&1 | Out-Null
  }
  Set-Content -Encoding utf8 "$wt\index.html" $bundle
  Set-Content -Encoding utf8 "$wt\.nojekyll" ""
  if (Test-Path "$root\dist\assets") { Copy-Item -Path "$root\dist\assets" -Destination $wt -Recurse -Force }
  Push-Location $wt
  git add -A
  git -c user.name="flogduse" -c user.email="flogduse@users.noreply.github.com" commit -m "deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
  git checkout -B gh-pages
  git push origin gh-pages --force
  if ($LASTEXITCODE -ne 0) { throw "push to gh-pages failed" }
  Pop-Location
  git worktree remove $wt --force 2>&1 | Out-Null

  # ensure Pages serves the gh-pages branch
  $pages = gh api repos/flogduse/useless/pages --jq '.source.branch // ""' 2>$null
  if (-not $pages) {
    gh api -X POST repos/flogduse/useless/pages -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1 | Out-Null
    Start-Sleep -Milliseconds 800
    $pages = gh api repos/flogduse/useless/pages --jq '.source.branch // ""' 2>$null
    Write-Output "GitHub Pages now serving: $pages"
  } elseif ($pages -ne "gh-pages") {
    gh api -X PUT repos/flogduse/useless/pages -f "source[branch]=gh-pages" -f "source[path]=/" | Out-Null
    Write-Output "Switched GitHub Pages to gh-pages branch."
  } else {
    Write-Output "GitHub Pages already on gh-pages."
  }
  Write-Output "Live URL: https://flogduse.github.io/useless/"
} finally {
  Pop-Location
}