# build.ps1 — inline all JS + CSS into a single index.html for zero-friction demos
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$html = Get-Content -Raw "$root\index.html"

# inline stylesheet
$css = Get-Content -Raw "$root\style.css"
$html = $html -replace '<link rel="stylesheet" href="style.css">', "<style>`n$css`n</style>"

# inline each script in order
$scripts = @("state.js", "ui.js", "apps.js", "browser.js", "terminal.js", "main.js")
foreach ($s in $scripts) {
  $js = Get-Content -Raw "$root\js\$s"
  $tag = "<script src=`"js/$s`"></script>"
  $html = $html.Replace($tag, "<script>`n$js`n</script>")
}

$outDir = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$html | Set-Content -Encoding utf8 "$outDir\index.html"

# copy any static assets (rickroll.mp4) alongside the bundle
if (Test-Path "$root\assets") { Copy-Item -Path "$root\assets" -Destination $outDir -Recurse -Force }

Write-Output "Built dist\index.html ($([math]::Round((Get-Item "$outDir\index.html").Length / 1kb)) KB)"