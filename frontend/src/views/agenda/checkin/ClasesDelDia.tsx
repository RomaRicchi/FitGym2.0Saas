import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCheckCircle, faClock, faDoorOpen, faChalkboardTeacher, faSpinner, faExpand, faCompress, faDumbbell, faTimes, faBirthdayCake, faRulerVertical, faWeightScale as faWeight, faPlus, faCalendar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import gymApi from "@/api/gymApi";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { AsignarRutinaSwal } from "@/views/agenda/suscripcionTurno/AsignarRutinaSwal";

interface Alumno {
  socioId: number;
  socioNombre: string;
  suscripcionTurnoId: number;
  checkinHecho: boolean;
  edad?: number;
  peso?: number;
  altura?: number;
  avatarUrl: string;
}

interface RutinaAsignada {
  rutinaId: number;
  rutinaNombre: string;
  rutinaObjetivo?: string;
  profesorNombre?: string;
  turnoAsignado: {
    dia: string;
    hora: string;
  };
  fechaAsignacion: string;
}

interface Clase {
  turnoPlantillaId: number;
  horaInicio: string;
  duracionMin: number;
  sala: {
    id: number;
    nombre: string;
    cupoTotal: number;
  };
  diaSemana: {
    id: number;
    nombre: string;
  };
  personal?: {
    id: number;
    nombre: string;
  };
  totalInscriptos: number;
  totalCheckins: number;
  alumnos: Alumno[];
}

export default function ClasesDelDia() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [loadingRutinas, setLoadingRutinas] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format

  // URL base del backend para cargar imágenes
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5144";

  const fetchClases = async () => {
    try {
      setLoading(true);
      const { data } = await gymApi.get("/checkins/clases-dia", {
        params: { fecha: selectedDate }
      });
      setClases(data || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudieron cargar las clases de hoy",
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
    fetchClases();
  }, [selectedDate]);

  // Change date by days
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Get day name from date
  const getDayName = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Add T00:00:00 to avoid timezone issues
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[date.getDay()];
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Manejar check-in de un alumno
  const handleCheckin = async (socioId: number, turnoPlantillaId: number, socioNombre: string) => {
    try {
      await gymApi.post("/checkins", { socioId, turnoPlantillaId });
      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Check-in registrado',
        text: `${socioNombre} marcado como presente`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      fetchClases(); // Recargar para actualizar el estado
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

  // Calcular porcentaje de asistencia
  const getAsistenciaPorcentaje = (clase: Clase) => {
    if (clase.totalInscriptos === 0) return 0;
    return Math.round((clase.totalCheckins / clase.totalInscriptos) * 100);
  };

  // Obtener día actual
  const getDiaActual = () => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[new Date().getDay()];
  };

  // Ver detalles del alumno (edad, peso, altura, últimas 5 rutinas)
  const handleVerDetallesAlumno = async (alumno: Alumno) => {
    setLoadingRutinas(alumno.socioId);

    // Obtener últimas 5 rutinas del socio
    let rutinas: RutinaAsignada[] = [];
    try {
      const { data } = await gymApi.get(`/checkins/socio/${alumno.socioId}/rutinas`);
      rutinas = data || [];
    } catch (error) {
      // Si hay error al obtener rutinas, continuar con array vacío
      console.warn("No se pudieron cargar las rutinas del socio:", error);
      rutinas = [];
    }

    setLoadingRutinas(null);

    // Construir HTML con los datos del alumno y sus rutinas
    const avatarCompleto = `${API_BASE_URL}${alumno.avatarUrl}`;
    const isMobile = window.innerWidth < 768;

    // Sanitizar nombre del alumno
    const sanitizedName = DOMPurify.sanitize(alumno.socioNombre);

    // Sanitizar datos personales
    const sanitizarTexto = (texto: string | undefined) => texto ? DOMPurify.sanitize(texto) : '';

    // Construir HTML de rutinas de forma segura
    const rutinasHTML = rutinas.length > 0
        ?rutinas.map((r) => {
            const nombreRutina = DOMPurify.sanitize(r.rutinaNombre);
            const objetivo = r.rutinaObjetivo ? DOMPurify.sanitize(r.rutinaObjetivo) : '';
            const profesor = r.profesorNombre ? DOMPurify.sanitize(r.profesorNombre) : '';
            const dia = DOMPurify.sanitize(r.turnoAsignado.dia);
            const hora = DOMPurify.sanitize(r.turnoAsignado.hora);

            return `
              <div style="background: #2d2d2d; padding: ${isMobile ? '8px' : '10px'}; margin-bottom: 8px; border-radius: 5px; border: 1px solid #444;">
                <p style="margin: 0; color: #fff; font-size: ${isMobile ? '0.85rem' : '0.95rem'};"><strong>•</strong> ${nombreRutina}</p>
                ${objetivo ? `<p style="margin: 5px 0 0 0; color: #aaa; font-size: ${isMobile ? '10px' : '12px'};">${objetivo}</p>` : ''}
                ${profesor ? `<p style="margin: 5px 0 0 0; color: var(--tenant-primary-color); font-size: ${isMobile ? '10px' : '11px'};">
                  <i class="fas fa-chalkboard-teacher"></i> Prof: ${profesor}
                </p>` : ''}
                <p style="margin: 5px 0 0 0; color: #888; font-size: ${isMobile ? '10px' : '11px'};">
                  <i class="fas fa-clock"></i> ${dia} ${hora}
                </p>
              </div>
            `;
          }).join('')
        : '<p style="color: #888;">No tiene rutinas asignadas</p>';

    const datosFisicosHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 15px; flex-wrap: ${isMobile ? 'wrap' : 'nowrap'};">
          <img
            src="${avatarCompleto}"
            alt="${sanitizedName}"
            style="width: ${isMobile ? '60px' : '80px'}; height: ${isMobile ? '60px' : '80px'}; border-radius: 50%; object-fit: cover; border: 3px solid var(--tenant-primary-color); ${isMobile ? 'margin: 0 auto 10px auto;' : 'margin-right: 15px;'}"
            onerror="this.src='${API_BASE_URL}/images/user.png'"
          />
          <div style="flex: 1; ${isMobile ? 'text-align: center; width: 100%;' : ''}">
            <h4 style="margin: 0; color: #fff; font-size: ${isMobile ? '1.2rem' : '1.5rem'};">${sanitizedName}</h4>
            <button id="btn-asignar-rutina" class="btn btn-success btn-sm" style="margin-top: 8px; ${isMobile ? 'font-size: 0.8rem; padding: 5px 10px;' : ''}">
              <i class="fas fa-plus me-1"></i>Asignar Nueva Rutina
            </button>
          </div>
        </div>

        <div style="text-align: left; padding: ${isMobile ? '5px' : '10px'};">
          <div style="margin-bottom: ${isMobile ? '10px' : '15px'};">
            <h5 style="color: var(--tenant-primary-color); margin-bottom: 10px; font-size: ${isMobile ? '1rem' : '1.25rem'};">
              <i class="fas fa-birthday-cake me-2"></i>
              Datos Personales
            </h5>
            <p style="font-size: ${isMobile ? '0.85rem' : '1rem'};"><strong>Edad:</strong> ${alumno.edad ? `${alumno.edad} años` : "No registrada"}</p>
            <p style="font-size: ${isMobile ? '0.85rem' : '1rem'};"><strong>Peso:</strong> ${alumno.peso ? `${alumno.peso} kg` : "No registrado"}</p>
            <p style="font-size: ${isMobile ? '0.85rem' : '1rem'};"><strong>Altura:</strong> ${alumno.altura ? `${alumno.altura} cm` : "No registrada"}</p>
          </div>

          <div>
            <h5 style="color: var(--tenant-primary-color); margin-bottom: 10px; font-size: ${isMobile ? '1rem' : '1.25rem'};">
              <i class="fas fa-dumbbell me-2"></i>
              Últimas 5 Rutinas Asignadas
            </h5>
            <div style="max-height: 200px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #cc5500 #2d2d2d;" class="rutinas-scroll">
              <style>
                .rutinas-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .rutinas-scroll::-webkit-scrollbar-track {
                  background: #2d2d2d;
                  border-radius: 4px;
                }
                .rutinas-scroll::-webkit-scrollbar-thumb {
                  background: #cc5500;
                  border-radius: 4px;
                }
                .rutinas-scroll::-webkit-scrollbar-thumb:hover {
                  background: #e65c00;
                }
              </style>
              ${rutinasHTML}
            </div>
          </div>
        </div>
      `;

    await Swal.fire({
      title: "",
      html: DOMPurify.sanitize(`
        <style>
          .swal2-actions { display: none !important; }
          .swal2-footer { display: none !important; }
        </style>
        ${datosFisicosHTML}
      `, { ALLOWED_TAGS: ['style', 'div', 'p', 'h4', 'h5', 'button', 'i', 'img', 'strong'], ALLOWED_ATTR: ['style', 'class', 'id', 'src', 'alt', 'onclick', 'onerror', 'type'] }),
        width: isMobile ? '90vw' : 500,
        showConfirmButton: false,
        showCloseButton: true,
        showCancelButton: false,
        showDenyButton: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "swal2-card-style",
        },
        buttonsStyling: false,
        didOpen: () => {
          // Doble aseguro: ocultar botones con JavaScript también
          setTimeout(() => {
            const actions = document.querySelector('.swal2-actions');
            if (actions) {
              (actions as HTMLElement).style.setProperty('display', 'none', 'important');
            }
            const footer = document.querySelector('.swal2-footer');
            if (footer) {
              (footer as HTMLElement).style.setProperty('display', 'none', 'important');
            }
          }, 0);

          // Conectar el botón de asignar rutina
          const btnRutina = document.getElementById('btn-asignar-rutina');
          if (btnRutina) {
            btnRutina.onclick = async () => {
              Swal.close();
              await AsignarRutinaSwal(
                alumno.suscripcionTurnoId,
                alumno.socioNombre,
                fetchClases
              );
            };
          }
        }
      });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-warning" />
        <p className="mt-3">Cargando clases de hoy...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "100%", padding: "0 15px" }}>
      {/* Date Picker Navigation */}
      <div className="card mb-4 shadow-sm" style={{ backgroundColor: "#2d2d2d", border: "2px solid var(--tenant-primary-color)" }}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-secondary"
            onClick={() => changeDate(-1)}
            title="Día anterior"
            style={{ backgroundColor: "#1a1a1a", borderColor: "var(--tenant-primary-color)", color: "var(--tenant-primary-color)" }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div className="text-center flex-grow-1">
            <h5 className="mb-1" style={{ color: "var(--tenant-primary-color)" }}>
              <FontAwesomeIcon icon={faCalendar} className="me-2" />
              {getDayName(selectedDate).toUpperCase()}
            </h5>
            <p className="mb-0" style={{ color: "#aaa" }}>{formatDateForDisplay(selectedDate)}</p>
          </div>

          <button
            className="btn btn-outline-secondary"
            onClick={() => changeDate(1)}
            title="Día siguiente"
            style={{ backgroundColor: "#1a1a1a", borderColor: "var(--tenant-primary-color)", color: "var(--tenant-primary-color)" }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {/* Quick date picker */}
        <div className="card-footer" style={{ backgroundColor: "#1a1a1a", borderTop: "1px solid #444" }}>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ maxWidth: "200px", margin: "0 auto", backgroundColor: "#2d2d2d", color: "#fff", borderColor: "var(--tenant-primary-color)" }}
          />
        </div>
      </div>

      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: window.innerWidth < 768 ? "1.5rem" : "2.5rem",
          letterSpacing: "1px"
        }}
      >
        <i className="fa-solid fa-clipboard-check"></i> ASISTENCIAS - {getDayName(selectedDate).toUpperCase()}
      </h1>

      {clases.length === 0 ? (
        <div className="text-center mt-5">
          <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <div className="card-body">
              <h5 className="card-title text-muted">No hay clases programadas</h5>
              <p className="card-text text-muted">
                No hay clases asignadas para {getDayName(selectedDate).toLowerCase()} ({formatDateForDisplay(selectedDate)}).
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {clases.map((clase) => {
            const porcentaje = getAsistenciaPorcentaje(clase);
            const isExpanded = expandedCard === clase.turnoPlantillaId;

            return (
              <div key={clase.turnoPlantillaId} className="col-12 col-md-6 col-lg-4 mb-4">
                <div
                  className="card h-100 shadow-lg"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "2px solid var(--tenant-primary-color)",
                    transition: "transform 0.2s",
                  }}
                >
                  {/* Header de la card */}
                  <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: "var(--tenant-primary-color)",
                      borderBottom: "2px solid var(--tenant-primary-color)"
                    }}
                  >
                    <h5 className="mb-0 fw-bold" style={{ color: "#000", fontSize: window.innerWidth < 768 ? "1rem" : "1.25rem" }}>
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      {clase.horaInicio}
                    </h5>
                    <button
                      className="btn btn-sm"
                      onClick={() => setExpandedCard(isExpanded ? null : clase.turnoPlantillaId)}
                      title={isExpanded ? "Colapsar" : "Expandir"}
                      style={{
                        backgroundColor: "#000",
                        color: "var(--tenant-primary-color)",
                        border: "1px solid var(--tenant-primary-color)",
                        padding: window.innerWidth < 768 ? "4px 8px" : "6px 12px"
                      }}
                    >
                      <FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} style={{ fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem" }} />
                    </button>
                  </div>

                  <div className="card-body" style={{ color: "#fff" }}>
                    {/* Sala */}
                    <div className="mb-3">
                      <h6 className="mb-1" style={{ color: "var(--tenant-primary-color)", fontSize: window.innerWidth < 768 ? "0.85rem" : "1rem" }}>
                        <FontAwesomeIcon icon={faDoorOpen} className="me-2" />
                        Sala
                      </h6>
                      <p className="mb-0 fw-bold" style={{ fontSize: window.innerWidth < 768 ? "1rem" : "1.25rem" }}>{clase.sala.nombre}</p>
                    </div>

                    {/* Profesor */}
                    {clase.personal && (
                      <div className="mb-3">
                        <h6 className="mb-1" style={{ color: "var(--tenant-primary-color)", fontSize: window.innerWidth < 768 ? "0.85rem" : "1rem" }}>
                          <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
                          Profesor
                        </h6>
                        <p className="mb-0" style={{ fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem" }}>{clase.personal.nombre}</p>
                      </div>
                    )}

                    {/* Duración */}
                    <div className="mb-3">
                      <h6 className="mb-1" style={{ color: "var(--tenant-primary-color)", fontSize: window.innerWidth < 768 ? "0.85rem" : "1rem" }}>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        Duración
                      </h6>
                      <p className="mb-0">{clase.duracionMin} minutos</p>
                    </div>

                    {/* Estadísticas */}
                    <div className="row text-center mb-3">
                      <div className="col-6">
                        <div
                          className="card"
                          style={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #444"
                          }}
                        >
                          <div className="card-body p-2">
                            <h6 className="mb-0 small" style={{ color: "#fff", fontSize: window.innerWidth < 768 ? "0.7rem" : "0.75rem" }}>Inscriptos</h6>
                            <p className="mb-0 fw-bold" style={{ color: "#fff", fontSize: window.innerWidth < 768 ? "1.2rem" : "1.5rem" }}>
                              <FontAwesomeIcon className="me-1" style={{ color: "var(--tenant-primary-color)" }} icon={faUsers} />
                              {clase.totalInscriptos}/{clase.sala.cupoTotal}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div
                          className="card"
                          style={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #444"
                          }}
                        >
                          <div className="card-body p-2">
                            <h6 className="mb-0 small" style={{ color: "#fff", fontSize: window.innerWidth < 768 ? "0.7rem" : "0.75rem" }}>Asistencia</h6>
                            <p className="mb-0 fw-bold" style={{ color: "#fff", fontSize: window.innerWidth < 768 ? "1.2rem" : "1.5rem" }}>
                              <FontAwesomeIcon
                                className="me-1"
                                style={{ color: porcentaje >= 80 ? "#28a745" : porcentaje >= 50 ? "#ffc107" : "#dc3545" }}
                                icon={faCheckCircle}
                              />
                              {clase.totalCheckins}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de asistencia */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small style={{ color: "#aaa", fontSize: window.innerWidth < 768 ? "0.75rem" : "0.875rem" }}>Asistencia</small>
                        <small
                          className="fw-bold"
                          style={{
                            color: porcentaje >= 80 ? "#28a745" : porcentaje >= 50 ? "#ffc107" : "#dc3545",
                            fontSize: window.innerWidth < 768 ? "0.75rem" : "0.875rem"
                          }}
                        >
                          {porcentaje}%
                        </small>
                      </div>
                      <div className="progress" style={{ height: window.innerWidth < 768 ? "8px" : "10px", backgroundColor: "#2d2d2d" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${porcentaje}%`,
                            backgroundColor: porcentaje >= 80 ? "#28a745" : porcentaje >= 50 ? "#ffc107" : "#dc3545"
                          }}
                        />
                      </div>
                    </div>

                    {/* Lista de alumnos (expandible) */}
                    {isExpanded && (
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #444" }}>
                        <h6 className="fw-bold mb-3" style={{ fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem" }}>
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          Lista de Alumnos ({clase.alumnos.length})
                        </h6>
                        <div className="list-group list-group-flush">
                          {clase.alumnos.map((alumno) => (
                            <div
                              key={alumno.suscripcionTurnoId}
                              className="list-group-item d-flex justify-content-between align-items-center py-2"
                              style={{
                                backgroundColor: "#2d2d2d",
                                border: "1px solid #444",
                                color: "#fff",
                                marginBottom: "4px"
                              }}
                            >
                              <div
                                className="d-flex align-items-center"
                                style={{
                                  cursor: "pointer",
                                  flex: 1
                                }}
                                onClick={() => handleVerDetallesAlumno(alumno)}
                              >
                                <img
                                  src={`${API_BASE_URL}${alumno.avatarUrl}`}
                                  alt={alumno.socioNombre}
                                  style={{
                                    width: window.innerWidth < 768 ? "35px" : "40px",
                                    height: window.innerWidth < 768 ? "35px" : "40px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginRight: window.innerWidth < 768 ? "8px" : "12px",
                                    border: "2px solid var(--tenant-primary-color)",
                                    opacity: alumno.checkinHecho ? 1 : 0.5
                                  }}
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    // Prevenir loop solo reemplazar si no es ya la imagen por defecto
                                    if (!img.src.includes("user.png")) {
                                      img.src = `${API_BASE_URL}/images/user.png`;
                                    }
                                  }}
                                />
                                <span
                                  style={{
                                    color: alumno.checkinHecho ? "#fff" : "#666",
                                    textDecoration: alumno.checkinHecho ? "none" : "line-through",
                                    fontSize: window.innerWidth < 768 ? "0.85rem" : "1rem"
                                  }}
                                >
                                  {alumno.socioNombre}
                                </span>
                              </div>
                              <button
                                className="btn btn-sm"
                                onClick={() =>
                                  handleCheckin(alumno.socioId, clase.turnoPlantillaId, alumno.socioNombre)
                                }
                                disabled={alumno.checkinHecho}
                                title={alumno.checkinHecho ? "Ya registró asistencia" : "Registrar asistencia"}
                                style={{
                                  backgroundColor: alumno.checkinHecho ? "#28a745" : "transparent",
                                  color: alumno.checkinHecho ? "#fff" : "#28a745",
                                  border: "1px solid #28a745",
                                  padding: window.innerWidth < 768 ? "4px 8px" : "6px 12px"
                                }}
                              >
                                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem" }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


