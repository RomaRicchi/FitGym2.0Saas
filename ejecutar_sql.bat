@echo off
set PGPASSWORD=admin
echo ALTER TABLE personal ADD COLUMN IF NOT EXISTS fecha_nacimiento timestamp with time zone; | psql -U postgres -d Fitgym
echo INSERT INTO "__EFMigrationsHistory" (migration_id, product_version) VALUES ('20260302021220_AddFechaNacimientoToPersonal', '9.0.0'); | psql -U postgres -d Fitgym
echo.
echo Listo! Presiona cualquier tecla para salir...
pause >
