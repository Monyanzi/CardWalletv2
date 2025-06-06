# CardWallet Production Deployment Script
# This script prepares the application for production deployment with minimal dependencies

# Step 1: Clean up any previous build artifacts
Write-Host "Cleaning up previous build..." -ForegroundColor Cyan
if (Test-Path -Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Step 2: Use the production-optimized package.json
Write-Host "Setting up production dependencies..." -ForegroundColor Cyan
Copy-Item -Path "package.prod.json" -Destination "package.json.bak" -Force
Copy-Item -Path "package.prod.json" -Destination "package.json" -Force

# Step 3: Install only production dependencies
Write-Host "Installing production dependencies..." -ForegroundColor Cyan
npm install --production

# Step 4: Build the application
Write-Host "Building optimized production bundle..." -ForegroundColor Cyan
npm run build

# Step 5: Restore the original package.json for development
Write-Host "Restoring development configuration..." -ForegroundColor Cyan
Copy-Item -Path "package.json.bak" -Destination "package.json" -Force
Remove-Item -Path "package.json.bak" -Force

# Step 6: Report the final build size
Write-Host "Build complete! Calculating final size..." -ForegroundColor Green
$size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB
Write-Host "Total build size: $([math]::Round($size, 2)) KB" -ForegroundColor Green
Write-Host "The optimized build is ready for deployment in the 'dist' folder" -ForegroundColor Green
