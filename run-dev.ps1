Param(
  [switch]$Watch = $true,
  [int]$ApiPort = 5144,
  [int]$WebPort = 5173
)

$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "No se encontró el comando '$name' en PATH. Instalalo y reintentá."
  }
}

Write-Host "🔧 Chequeando herramientas..." -ForegroundColor Cyan
Require-Cmd dotnet
Require-Cmd npm

# Ubicaciones relativas al script (asumimos que lo guardás en la raíz del repo)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot  = $scriptDir
$apiDir    = Join-Path $repoRoot "src/Gym.API"
$webDir    = Join-Path $repoRoot "frontend"

if (-not (Test-Path $apiDir)) { throw "No se encontró carpeta '$apiDir'" }
if (-not (Test-Path $webDir)) { throw "No se encontró carpeta '$webDir'" }

Write-Host "📦 Restaurando dependencias backend..." -ForegroundColor Yellow
Push-Location $apiDir
dotnet restore | Write-Output
Pop-Location

Write-Host "📦 Instalando deps frontend (si faltan)..." -ForegroundColor Yellow
Push-Location $webDir
if (Test-Path "package-lock.json" -or Test-Path "node_modules") {
  Write-Host "node_modules ya existe, saltando npm install rápido..." -ForegroundColor DarkGray
} else {
  npm install | Write-Output
}
Pop-Location

# Asegurar .env.local para el front
$envFile = Join-Path $webDir ".env.local"
if (-not (Test-Path $envFile)) {
  "VITE_API_BASE_URL=http://localhost:$ApiPort" | Out-File -Encoding utf8 $envFile
  Write-Host "📝 Creado .env.local con VITE_API_BASE_URL=http://localhost:$ApiPort" -ForegroundColor DarkGray
}

# Lanzar backend
Write-Host "🚀 Iniciando API en puerto $ApiPort..." -ForegroundColor Green
$apiCmd = if ($Watch) { "dotnet watch run --no-restore --urls http://localhost:$ApiPort" } else { "dotnet run --no-restore --urls http://localhost:$ApiPort" }
$api = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command",$apiCmd -WorkingDirectory $apiDir -PassThru

Start-Sleep -Seconds 2

# Lanzar frontend
Write-Host "🚀 Iniciando Frontend (Vite) en puerto $WebPort..." -ForegroundColor Green
$webCmd = "npm run dev -- --port $WebPort"
$web = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command",$webCmd -WorkingDirectory $webDir -PassThru

Write-Host ""
Write-Host "✅ Todo lanzado." -ForegroundColor Cyan
Write-Host "API:     http://localhost:$ApiPort/swagger"
Write-Host "Frontend http://localhost:$WebPort"
Write-Host ""
Write-Host "Para detener, cerrá las ventanas o ejecutá:" -ForegroundColor DarkGray
Write-Host "Stop-Process -Id $($api.Id), $($web.Id)" -ForegroundColor DarkGray
