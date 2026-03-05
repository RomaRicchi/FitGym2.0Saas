-- Script para limpiar la base de datos manteniendo solo los datos iniciales del sistema
-- Se eliminan todos los datos de prueba pero se mantiene la estructura y datos seed

-- Eliminar en orden correcto (respetando foreign keys)
DELETE FROM renovacion_suscripcion;
DELETE FROM configuracion_renovacion;
DELETE FROM suscripcion_turno;
DELETE FROM checkin;
DELETE FROM evolucion_fisica;
DELETE FROM rutinas_plantilla_ejercicios;
DELETE FROM rutinas_plantilla;
DELETE FROM turno_plantilla;
DELETE FROM comprobante;
DELETE FROM orden_pago;
DELETE FROM suscripcion;
DELETE FROM metodo_pago;
DELETE FROM historial_pagos_saas;
DELETE FROM plan_sala;
DELETE FROM ejercicios;
DELETE FROM grupo_muscular;
DELETE FROM plan;
DELETE FROM socio;
DELETE FROM personal;
DELETE FROM password_reset_token;
DELETE FROM usuario;

-- Resetear sequences
ALTER SEQUENCE socio_id_seq RESTART WITH 1;
ALTER SEQUENCE personal_id_seq RESTART WITH 1;
ALTER SEQUENCE usuario_id_seq RESTART WITH 1;
ALTER SEQUENCE plan_id_seq RESTART WITH 1;
ALTER SEQUENCE sala_id_seq RESTART WITH 1;
ALTER SEQUENCE turno_plantilla_id_seq RESTART WITH 1;
ALTER SEQUENCE suscripcion_id_seq RESTART WITH 1;
ALTER SEQUENCE orden_pago_id_seq RESTART WITH 1;
ALTER SEQUENCE comprobante_id_seq RESTART WITH 1;
ALTER SEQUENCE checkin_id_seq RESTART WITH 1;
ALTER SEQUENCE rutinas_plantilla_id_seq RESTART WITH 1;
ALTER SEQUENCE rutinas_plantilla_ejercicios_id_seq RESTART WITH 1;
ALTER SEQUENCE evolucion_fisica_id_seq RESTART WITH 1;
ALTER SEQUENCE grupo_muscular_id_seq RESTART WITH 1;
ALTER SEQUENCE ejercicio_id_seq RESTART WITH 1;
