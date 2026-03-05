import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import gymApi from "@/api/gymApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCamera, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Html5QrcodeScanner } from "html5-qrcode";

interface TurnoDelDia {
  id: number;
  turnoPlantillaId: number;
  turnoPlantilla: {
    id: number;
    horaInicio: string;
    duracionMin: number;
    diaSemana: { nombre: string; id?: number };
    sala: { nombre: string };
    personal: { nombre: string; id?: number };
  };
  suscripcion: {
    socio: {
      id: number;
      nombre: string;
      email: string;
    };
  };
}

export default function CheckinQR() {
  const location = useLocation();
  const [codigoSocio, setCodigoSocio] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnosDisponibles, setTurnosDisponibles] = useState<TurnoDelDia[]>([]);
  const [scannerMode, setScannerMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("camara") === "true") {
      setScannerMode(true);
    }
  }, [location.search]);
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scannerMode && !scannerRef.current) {
      // Verificar si estamos en contexto seguro
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setCameraError("La cámara solo funciona en HTTPS o localhost");
        setScannerMode(false);
        return;
      }

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Tu navegador no soporta acceso a la cámara");
        setScannerMode(false);
        return;
      }

      // Solicitar permisos antes de inicializar el scanner
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(() => {
          setPermissionDenied(false);

          // Inicializar el scanner
          try {
            scanner = new Html5QrcodeScanner(
              "qr-reader",
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              false
            );

            scanner.render(
              (decodedText: string) => {
                if (decodedText) {
                  procesarCodigo(decodedText);
                  scanner?.clear().catch(() => {});
                  scannerRef.current = null;
                  setScannerMode(false);
                }
              },
              (_errorMessage: string) => {
                // Ignorar errores de escaneo normales
                console.log('Error de escaneo:', _errorMessage);
              }
            );

            scannerRef.current = scanner;
          } catch (error) {
            console.error("Error inicializando scanner:", error);
            setCameraError("No se pudo inicializar la cámara. Asegúrate de dar permisos.");
            setScannerMode(false);
          }
        })
        .catch((error) => {
          console.error("Permiso de cámara denegado:", error);
          setPermissionDenied(true);
          setCameraError("Permiso de cámara denegado. Acepta los permisos para usar el escáner QR.");
          setScannerMode(false);
        });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerMode]);

  // Detener scanner
  const detenerScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScannerMode(false);
    setCameraError(null);
    setPermissionDenied(false);
  };

  // Reiniciar scanner
  const reiniciarScanner = () => {
    setCameraError(null);
    setPermissionDenied(false);
    // Forzar recarga del componente
    setTimeout(() => setScannerMode(true), 100);
  };

  const buscarTurnosDelDia = async (socioId: number) => {
    try {
      setLoading(true);
      const { data } = await gymApi.get(`/checkins/turnos-hoy/${socioId}`);
      const turnos = data?.data || [];

      if (!turnos || turnos.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "Sin turnos hoy",
          text: "El socio no tiene turnos asignados para hoy",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      setTurnosDisponibles(turnos);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "No se pudieron buscar los turnos",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const procesarCodigo = async (codigo: string) => {
    if (!codigo || codigo.trim() === "") return;

    const codigoLimpio = codigo.trim();

    try {
      setLoading(true);

      const { data: qRes } = await gymApi.get(`/socios?q=${encodeURIComponent(codigoLimpio)}&pageSize=1`);
      const socio = qRes?.items?.[0] || qRes?.data?.items?.[0] || qRes?.data?.[0];

      if (socio) {
        await buscarTurnosDelDia(socio.id);
      } else {
        throw new Error("Socio no encontrado");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Socio no encontrado",
        text: `No se encontró un socio con el DNI: ${codigo}`,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const hacerCheckin = async (turno: TurnoDelDia) => {
    try {
      await gymApi.post("/checkins", {
        socioId: turno.suscripcion.socio.id,
        turnoPlantillaId: turno.turnoPlantilla.id,
        profesorId: turno.turnoPlantilla.personal?.id,
      });

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Check-in registrado',
        html: DOMPurify.sanitize(`
          <p><strong>Socio:</strong> ${turno.suscripcion.socio.nombre}</p>
          <p><strong>Turno:</strong> ${turno.turnoPlantilla.horaInicio} - ${turno.turnoPlantilla.sala.nombre}</p>
          <p><strong>Profesor:</strong> ${turno.turnoPlantilla.personal?.nombre}</p>
        `),
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });

      // Resetear
      setTurnosDisponibles([]);
      setCodigoSocio("");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo registrar el check-in",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // Submit manual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    procesarCodigo(codigoSocio);
  };

  // Formatear hora
  const formatHora = (hora: string) => {
    const [horas, minutos] = hora.split(":");
    return `${horas}:${minutos}`;
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "100%", padding: isMobile ? "0 10px" : "0 15px 15px 15px" }}>
      <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          background: rgba(255, 102, 0, 0.1);
          border-radius: 8px;
        }
        #qr-reader__dashboard {
          padding: 10px !important;
          background-color: #2d2d2d !important;
        }
      `}</style>
      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.5rem" : "2.5rem",
          letterSpacing: isMobile ? "0.5px" : "1px"
        }}
      >
        CHECK-IN MANUAL
      </h1>

      {loading ? (
        <div className="text-center mt-5">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: "var(--tenant-primary-color)" }} />
          <p className="mt-3" style={{ color: "#fff" }}>Procesando...</p>
        </div>
      ) : turnosDisponibles.length > 0 ? (
        <div className="row justify-content-center">
          <div className={isMobile ? "col-12" : "col-md-8"}>
            <div className="card shadow-lg" style={{ backgroundColor: "#2d2d2d", border: "2px solid var(--tenant-primary-color)" }}>
              <div className="card-header" style={{ backgroundColor: "var(--tenant-primary-color)", borderBottom: "2px solid var(--tenant-primary-color)" }}>
                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
                  <i className="fa-solid fa-calendar-days"></i> Turnos de hoy - {turnosDisponibles[0].suscripcion.socio.nombre}
                </h5>
              </div>
              <div className="card-body" style={{ backgroundColor: "#2d2d2d" }}>
                <p className="mb-3" style={{ fontSize: isMobile ? "0.9rem" : "1rem", color: "#aaa" }}>Selecciona un turno para registrar el check-in:</p>

                {turnosDisponibles.map((turno) => (
                  <div
                    key={turno.id}
                    className="card mb-3"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#1a1a1a",
                      border: "2px solid var(--tenant-primary-color)",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => hacerCheckin(turno)}
                    >
                    <div className="card-body">
                      <div className={`d-flex justify-content-between align-items-center ${isMobile ? 'flex-column' : ''} gap-2`}>
                        <div style={{ flex: 1 }}>
                          <h6 className="fw-bold" style={{ fontSize: isMobile ? "1rem" : "1.25rem", color: "var(--tenant-primary-color)" }}>
                            <i className="fa-solid fa-clock"></i> {formatHora(turno.turnoPlantilla.horaInicio)}
                          </h6>
                          <p className="mb-1" style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#fff" }}>
                            <strong style={{ color: "var(--tenant-primary-color)" }}>Sala:</strong> {turno.turnoPlantilla.sala.nombre}
                          </p>
                          <p className="mb-0" style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#fff" }}>
                            <strong style={{ color: "var(--tenant-primary-color)" }}>Profesor:</strong> {turno.turnoPlantilla.personal?.nombre}
                          </p>
                        </div>
                        <button
                          className={`btn ${isMobile ? 'btn-sm w-100 mt-2' : 'btn-lg'}`}
                          style={{
                            backgroundColor: "var(--tenant-primary-color)",
                            color: "#fff",
                            border: "none",
                            fontWeight: "600"
                          }}
                          >
                          <i className="fa-solid fa-circle-check"></i> Check-in
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                className="btn w-100 mt-2"
                style={{
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  backgroundColor: "#444",
                  color: "#fff",
                  border: "1px solid #666"
                }}
                onClick={() => {
                  setTurnosDisponibles([]);
                  setCodigoSocio("");
                  setScannerMode(false);
                  if (scannerRef.current) {
                      scannerRef.current.clear().catch(() => {});
                      scannerRef.current = null;
                    }
                  }}
                >
                  ← Buscar otro socio
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className={isMobile ? "col-12" : "col-md-8"}>
            <div className="card shadow-lg" style={{ backgroundColor: "#2d2d2d", border: "2px solid var(--tenant-primary-color)" }}>
              <div className="card-header" style={{ backgroundColor: "var(--tenant-primary-color)", borderBottom: "2px solid var(--tenant-primary-color)" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-white fw-bold" style={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
                    {scannerMode ? <><i className="fa-solid fa-camera"></i> Escanear QR</> : "Ingresar DNI del socio"}
                  </h5>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: scannerMode ? "#dc3545" : "#28a745",
                      color: "#fff",
                      border: "none",
                      fontWeight: "600"
                    }}
                    onClick={() => scannerMode ? detenerScanner() : setScannerMode(true)}
                  >
                    <FontAwesomeIcon icon={scannerMode ? faTimes : faCamera} className="me-1" />
                    {scannerMode ? "Cancelar" : "Usar Cámara"}
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ backgroundColor: "#2d2d2d" }}>
                {scannerMode ? (
                  <div className="text-center">
                    {cameraError ? (
                      <div className="alert alert-danger mt-3">
                        <strong><i className="fa-solid fa-circle-xmark"></i> Error de cámara:</strong> {cameraError}
                      </div>
                    ) : permissionDenied ? (
                      <div className="alert alert-warning mt-3">
                        <strong><i className="fa-solid fa-triangle-exclamation"></i> Permisos requeridos:</strong>
                        <p className="mb-2">Para usar el escáner QR, necesitas dar permisos de cámara.</p>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={reiniciarScanner}
                        >
                          <i className="fa-solid fa-rotate-right"></i> Reintentar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          id="qr-reader"
                          style={{
                            maxWidth: "400px",
                            margin: "0 auto",
                            borderRadius: "8px",
                            overflow: "hidden"
                          }}
                        ></div>
                        <p className="mt-3" style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#aaa" }}>
                          Apunta la cámara al código QR del socio
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ fontSize: isMobile ? "0.9rem" : "1rem", color: "var(--tenant-primary-color)" }}>
                        DNI del socio
                      </label>
                      <input
                        ref={inputRef}
                        type="text"
                        className="form-control form-control-lg"
                        style={{
                          fontSize: isMobile ? "1rem" : "1.25rem",
                          backgroundColor: "#1a1a1a",
                          color: "#fff",
                          border: "2px solid var(--tenant-primary-color)"
                        }}
                        placeholder="Ej: 12345678"
                        value={codigoSocio}
                        onChange={(e) => setCodigoSocio(e.target.value)}
                        autoFocus
                      />
                      <small style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", color: "#888" }}>
                        Ingresa el DNI del socio
                      </small>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-lg w-100"
                      style={{
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        backgroundColor: "var(--tenant-primary-color)",
                        color: "#fff",
                        border: "none",
                        fontWeight: "600"
                      }}
                      >
                      <i className="fa-solid fa-magnifying-glass"></i> Buscar turnos
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de ayuda - Solo visible cuando hay error de cámara */}
      {scannerMode && cameraError && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="fw-bold mb-3"><i className="fa-solid fa-camera"></i> Solucionar problemas de cámara</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="small"><strong>1. Verifica los permisos:</strong></p>
                    <ul className="small">
                      <li>Haz clic en el icono de cámara en la barra de direcciones</li>
                      <li>Asegúrate que el permiso esté "Permitido"</li>
                    </ul>

                    <p className="small mt-2"><strong>2. Usa HTTPS o Localhost:</strong></p>
                    <p className="small text-muted">La cámara solo funciona en conexiones seguras</p>

                    <p className="small mt-2"><strong>3. Prueba otro navegador:</strong></p>
                    <p className="small text-muted">Chrome, Firefox y Edge son compatibles</p>
                  </div>
                  <div className="col-md-6">
                    <p className="small"><strong>Si no funciona:</strong></p>
                    <ul className="small">
                      <li>Usa el ingreso manual por DNI</li>
                      <li>Verifica que tu dispositivo tenga cámara</li>
                      <li>Cierra otras apps que estén usando la cámara</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


