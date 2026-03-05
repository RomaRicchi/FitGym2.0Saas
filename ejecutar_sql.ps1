$env:PGPASSWORD = "admin"

Write-Host "Ejecutando SQL para agregar fecha_nacimiento a personal..." -ForegroundColor Green

& psql -U postgres -d Fitgym -c "ALTER TABLE personal ADD COLUMN IF NOT EXISTS fecha_nacimiento timestamp with time zone;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Columna agregada exitosamente!" -ForegroundColor Green

    & psql -U postgres -d Fitgym -c "INSERT INTO ""__EFMigrationsHistory"" (migration_id, product_version) VALUES ('20260302021220_AddFechaNacimientoToPersonal', '9.0.0');"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migración registrada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "Error al registrar migración (puede que ya exista)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Error al ejecutar SQL" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona Enter para salir..."
$null = Read-Host
