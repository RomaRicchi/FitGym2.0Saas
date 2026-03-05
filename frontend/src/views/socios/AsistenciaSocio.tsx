import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";

interface Usuario {
  id: number;
  alias: string;
  email: string;
  avatarUrl?: string;
}

interface Socio {
  id: number;
  nombre: string;
  dni: string;
  telefono?: string;
  fechaNacimiento?: string;
  activo: boolean;
  planActual?: string;
  usuario?: Usuario;
}

export default function AsistenciaSocio() {
  const [perfil, setPerfil] = useState<Socio | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState(180);

  // Ajustar tamaño del QR según la pantalla
  useEffect(() => {
    const updateQrSize = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setQrSize(140);
      } else if (width < 480) {
        setQrSize(160);
      } else {
        setQrSize(200);
      }
    };

    updateQrSize();
    window.addEventListener("resize", updateQrSize);
    return () => window.removeEventListener("resize", updateQrSize);
  }, []);

  // Obtener perfil del socio
  const fetchPerfil = async () => {
    try {
      const res = await gymApi.get("/perfil/socio");
      setPerfil(res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el perfil del socio",
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

  useEffect(() => {
    fetchPerfil();
  }, []);

  // Imprimir QR Code
  const handleImprimirQR = async () => {
    if (!perfil) return;

    try {
      // Generar QR como imagen data URL
      const qrDataUrl = await QRCode.toDataURL(perfil.dni, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${perfil.nombre}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              border: 3px solid var(--tenant-primary-color);
              padding: 30px;
              border-radius: 15px;
            }
            h1 { color: var(--tenant-secondary-color); }
            .dni { font-size: 24px; font-weight: bold; margin: 20px 0; }
            .nombre { font-size: 18px; color: #666; }
            .qr-image {
              margin: 20px 0;
              border: 4px solid #000;
              border-radius: 8px;
            }
            button {
              margin-top: 20px;
              padding: 10px 20px;
              font-size: 16px;
              background: var(--tenant-primary-color);
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            }
            @media print {
              button { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1><i class="fa-solid fa-dumbbell"></i> ${perfil.nombre}</h1>
            <p class="dni">DNI: ${perfil.dni}</p>
            <img src="${qrDataUrl}" class="qr-image" alt="QR Code" />
            <p class="nombre">Escanea este código en recepción</p>
            <button onclick="window.print()">Imprimir</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el código QR para imprimir",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  if (loading) return <p className="text-center mt-5">Cargando...</p>;
  if (!perfil) return <p className="text-center mt-5">No se encontró el perfil.</p>;

  return (
    <div className="container mt-2 mt-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div
            className="card shadow-lg text-white"
            style={{
              backgroundColor: "var(--tenant-primary-color)",
              border: "none",
              borderRadius: "1rem",
            }}
          >
            <div className="card-body p-3 p-md-4">
              <h2 className="card-title text-center mb-3 mb-md-4 fw-bold fs-4 fs-md-3">
                <i className="fa-solid fa-qrcode"></i> Mi Código QR
              </h2>

              <div className="text-start text-dark rounded p-3 bg-light bg-opacity-25">
                <p className="text-center text-light mb-3 small">
                  Escanea este código cuando entres al gimnasio para registrar tu asistencia.
                </p>

                <div className="d-flex flex-column align-items-center gap-2 gap-md-3">
                  <div
                    className="bg-white p-2 p-md-3 rounded"
                    style={{
                      display: "inline-block",
                      border: "4px solid var(--tenant-primary-color)",
                    }}
                  >
                    <QRCodeSVG
                      value={perfil.dni}
                      size={qrSize}
                      level={"M"}
                      includeMargin={true}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  <div className="text-center text-light w-100">
                    <h5 className="fw-bold mb-1 fs-5">{perfil.nombre}</h5>
                    <p className="mb-1 mb-md-2 small"><strong>DNI:</strong> {perfil.dni}</p>
                    <p className="mb-0 small">
                      <strong>Plan:</strong> {perfil.planActual || "Sin plan activo"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 mt-3 mt-md-4">
                <button
                  onClick={handleImprimirQR}
                  className="btn btn-warning text-black fw-semibold py-2 py-md-2"
                >
                  <i className="fa-solid fa-print"></i> Imprimir QR
                </button>
              </div>

              <div className="mt-2 mt-md-3 text-center">
                <small className="text-light opacity-75" style={{ fontSize: "0.75rem" }}>
                  <i className="fa-solid fa-lightbulb"></i> Presenta este código QR en recepción
                </small>
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="card mt-3 shadow-sm text-white" style={{ backgroundColor: "#2c2c2c" }}>
            <div className="card-body p-3">
              <h6 className="fw-bold mb-2"><i className="fa-solid fa-circle-info"></i> ¿Cómo funciona?</h6>
              <ul className="mb-0 ps-3 small" style={{ fontSize: "0.85rem" }}>
                <li className="mb-1">Muestra este código QR en recepción</li>
                <li className="mb-1">El personal escaneará tu código</li>
                <li className="mb-1">Puedes imprimirlo y llevarlo contigo</li>
                <li className="mb-0">Asegúrate de tener una suscripción activa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


