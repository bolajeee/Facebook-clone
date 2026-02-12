# Mobile App Reinstall Script
# Run this to clean install dependencies

Write-Host "🧹 Cleaning old dependencies..." -ForegroundColor Yellow

# Remove node_modules
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

# Remove package-lock.json
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Remove .expo folder
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo
    Write-Host "✅ Removed .expo cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now start the app with:" -ForegroundColor Cyan
    Write-Host "   npm start" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "Try running: npm install --legacy-peer-deps" -ForegroundColor Yellow
}
