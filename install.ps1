# 鲸宝桌宠 · 一键安装脚本
# 用法：右键「使用 PowerShell 运行」，或在本目录执行 .\install.ps1
$ErrorActionPreference = "Stop"
$HomeDsh = Join-Path $env:USERPROFILE ".dsh"

Write-Host "🐳 鲸宝桌宠安装脚本" -ForegroundColor Cyan
Write-Host "================================"

# 0. 找到 DSH 安装目录（node_modules 里的 @deepseek-ai\dsh）
$dshBase = $null
foreach ($p in @(
  (Join-Path $env:APPDATA "npm\node_modules\@deepseek-ai\dsh"),
  (Join-Path $env:USERPROFILE "AppData\Roaming\npm\node_modules\@deepseek-ai\dsh")
)) {
  if (Test-Path $p) { $dshBase = $p; break }
}
if (-not $dshBase) {
  Write-Host "❌ 未找到 DSH 安装目录（@deepseek-ai/dsh）" -ForegroundColor Red
  exit 1
}
$dist = Join-Path $dshBase "node_modules\@deepseek-ai\dsh-web-frontend\dist"
$pluginDir = Join-Path $HomeDsh "profiles\node_modules\@local\dsh-pet"
$patchFile = Join-Path $HomeDsh "profiles\web\cordis.patch.yml"

# 1. 复制插件
Write-Host "📦 [1/4] 复制插件..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force (Join-Path $pluginDir "lib") | Out-Null
Copy-Item ".\plugin\package.json" $pluginDir -Force
Copy-Item ".\plugin\lib\index.js" (Join-Path $pluginDir "lib") -Force
Copy-Item ".\plugin\lib\client.js" (Join-Path $pluginDir "lib") -Force

# 2. 部署素材
Write-Host "🎨 [2/4] 部署素材到前端 dist..." -ForegroundColor Yellow
Copy-Item ".\assets\pet_*.webp" $dist -Force
Copy-Item ".\assets\pet_*.png" $dist -Force

# 3. 注册插件
Write-Host "📝 [3/4] 注册到 cordis.patch.yml..." -ForegroundColor Yellow
$needRegister = -not (Test-Path $patchFile) -or -not (Select-String -Path $patchFile -Pattern "id: pet" -Quiet)
if ($needRegister) {
  $entry = @"

# 鲸宝桌宠
- insert:
    - id: pet
      name: '@local/dsh-pet'
"@
  Add-Content -Path $patchFile -Value $entry -Encoding UTF8
  Write-Host "   已注册 pet 插件" -ForegroundColor Green
} else {
  Write-Host "   插件已注册过，跳过" -ForegroundColor Green
}

# 4. 提示重启
Write-Host "🚀 [4/4] 完成！" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ 鲸宝桌宠安装完成！" -ForegroundColor Green
Write-Host "请重启 dsh web 并强刷页面："
Write-Host "  PowerShell: Stop-Process -Name node -Force; dsh web" -ForegroundColor Gray
Write-Host "  浏览器: http://127.0.0.1:3080  + Ctrl+F5" -ForegroundColor Gray
Write-Host ""
Write-Host "（可选）系统监控需要额外启动：node stats-server.js" -ForegroundColor Gray
