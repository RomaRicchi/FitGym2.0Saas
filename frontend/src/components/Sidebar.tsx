import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUsers,
  faCreditCard,
  faMoneyBill,
  faBolt,
  faFolder,
  faCalendarDays,
  faCalendarDay,
  faUserTie,
  faFileInvoice,
  faUser,
  faListCheck,
  faCalendarCheck,
  faWeightScale,
  faChevronDown,
  faChevronUp,
  faClipboardList,
  faFileAlt,
  faChartPie,
  faKeyboard,
  faChartBar,
  faQrcode,
  faPlug,
  faGear,
  faBell,
  faPalette,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import "@/styles/Sidebar.css";
import { usePagosPendientesCounter } from "@/hooks/useSignalR";
import useTenant from "@/hooks/useTenant";

export default function Sidebar() {
  const [usuario, setUsuario] = useState<{ rol?: string; Rol?: string }>({});
  const rol = usuario?.rol || usuario?.Rol;
  const { tenant } = useTenant();

  const [open, setOpen] = useState({
    gestion: true,
    rutinas: false,
    agenda: false,
    sistema: true,  // Siempre expandido para Administradores
    pagos: false,
    superTenant: false,  // Solo visible para tenant ID 1
  });

  // Contador de pagos pendientes para admin y recepcion
  const pagosPendientesCount = usePagosPendientesCounter();

  useEffect(() => {
    const stored = sessionStorage.getItem("usuario");
    if (stored) setUsuario(JSON.parse(stored));
  }, []);

  const toggle = (section: keyof typeof open) =>
    setOpen({ ...open, [section]: !open[section] });

  return (
    <div className="sidebar" style={{ overflowY: "auto", height: "100vh" }}>
      <ul className="nav flex-column">

        {rol === "Socio" && (
          <>
            <li className="nav-item mt-3">
              <NavLink to="/dashboardSocio" className="nav-link fw-bold">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Mi Panel
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/planesSocio" className="nav-link">
                <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                Planes
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/suscripciones" className="nav-link">
                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                Mis Suscripciones
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/turnosSocio" className="nav-link">
                <FontAwesomeIcon icon={faListCheck} className="me-2" />
                Mis Turnos
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/turnos" className="nav-link">
                <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                Calendario
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/rutinasSocio" className="nav-link">
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Rutinas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/evolucionfisica" className="nav-link">
                <FontAwesomeIcon icon={faWeightScale} className="me-2" />
                Evolución Física
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/socio/asistencia" className="nav-link">
                <FontAwesomeIcon icon={faQrcode} className="me-2" />
                Asistencia
              </NavLink>
            </li>

            <hr className="sidebar-divider" />
          </>
        )}

        {rol !== "Socio" && (
          <>
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link fw-bold">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Dashboard
              </NavLink>
            </li>

            {rol !== "Profesor" && (
              <>
                <hr className="sidebar-divider" />

                <li className="nav-section" onClick={() => toggle("gestion")}>
                  <span className="sidebar-title">
                    GESTIÓN{" "}
                    <FontAwesomeIcon
                      icon={open.gestion ? faChevronUp : faChevronDown}
                      className="ms-1"
                    />
                  </span>
                </li>

                {open.gestion && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/socios" className="nav-link">
                        <FontAwesomeIcon icon={faUsers} className="me-2" /> Socios
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/suscripciones" className="nav-link" end>
                        <FontAwesomeIcon icon={faCreditCard} className="me-2" /> Suscripciones
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/planes" className="nav-link">
                        <FontAwesomeIcon icon={faMoneyBill} className="me-2" /> Planes
                      </NavLink>
                    </li>
                    {(rol === "Administrador" || rol === "Recepcion") && (
                      <li className="nav-item">
                        <NavLink to="/caja" className="nav-link">
                          <FontAwesomeIcon icon={faMoneyBill} className="me-2" /> Caja
                        </NavLink>
                      </li>
                    )}
                    <li className="nav-item">
                      <NavLink
                        to="/ordenes"
                        className="nav-link d-flex align-items-center"
                        style={{ gap: "6px" }}
                      >
                        <span className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faFileInvoice} className="me-2" /> Órdenes de Pago
                        </span>
                        {pagosPendientesCount > 0 && (
                          <span
                            className="badge rounded-pill bg-danger ms-1"
                            style={{ fontSize: "0.75rem", minWidth: "22px" }}
                          >
                            {pagosPendientesCount}
                            <span className="visually-hidden">pagos pendientes</span>
                          </span>
                        )}
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            )}


            {rol !== "Recepcion" && (
              <>
                <hr className="sidebar-divider" />
                <li className="nav-section" onClick={() => toggle("rutinas")}>
                  <span className="sidebar-title">
                    RUTINAS{" "}
                    <FontAwesomeIcon
                      icon={open.rutinas ? faChevronUp : faChevronDown}
                      className="ms-1"
                    />
                  </span>
                </li>
                {open.rutinas && (
                  <>
                    {rol === "Administrador" && (
                      <>
                        <li className="nav-item">
                          <NavLink to="/rutinas/grupoMuscular" className="nav-link">
                            <FontAwesomeIcon icon={faFolder} className="me-2" /> Categorías
                          </NavLink>
                        </li>
                      </>
                    )}
                    <li className="nav-item">
                      <NavLink to="/rutinas/ejercicios" className="nav-link">
                        <FontAwesomeIcon icon={faBolt} className="me-2" /> Actividades
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/rutinas/plantillas" className="nav-link">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Rutinas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/rutinas/cards" className="nav-link">
                        <FontAwesomeIcon icon={faListCheck} className="me-2" /> Vista Galería
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            )}

            <hr className="sidebar-divider" />
            <li className="nav-section" onClick={() => toggle("agenda")}>
              <span className="sidebar-title">
                AGENDA{" "}
                <FontAwesomeIcon
                  icon={open.agenda ? faChevronUp : faChevronDown}
                  className="ms-1"
                />
              </span>
            </li>
            {open.agenda && (
              <>
                <li className="nav-item">
                  <NavLink to="/agenda/calendario" className="nav-link">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-2" /> Calendario
                  </NavLink>
                </li>
                {(rol === "Administrador" || rol === "Recepcion") && (
                  <li className="nav-item">
                    <NavLink to="/turnos" className="nav-link">
                      <FontAwesomeIcon icon={faListCheck} className="me-2" /> Turnos de Profesores
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink to="/suscripciones/turnos" className="nav-link">
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-2" /> Turnos por Socio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/checkins/clases-dia" className="nav-link">
                    <FontAwesomeIcon icon={faCalendarDay} className="me-2" /> Asistencias
                  </NavLink>
                </li>
                {(rol === "Administrador" || rol === "Recepcion") && (
                  <li className="nav-item">
                    <NavLink to="/checkins/qr" className="nav-link">
                      <FontAwesomeIcon icon={faQrcode} className="me-2" /> Check-in
                    </NavLink>
                  </li>
                )}
                {(rol === "Administrador" || rol === "Recepcion") && (
                  <li className="nav-item">
                    <NavLink to="/checkins/estadisticas" className="nav-link">
                      <FontAwesomeIcon icon={faChartBar} className="me-2" /> Estadísticas
                    </NavLink>
                  </li>
                )}
              </>
            )}

            {rol === "Administrador" && (
              <>
                <hr className="sidebar-divider" />
                <li className="nav-section" onClick={() => toggle("sistema")}>
                  <span className="sidebar-title">
                    SISTEMA{" "}
                    <FontAwesomeIcon
                      icon={open.sistema ? faChevronUp : faChevronDown}
                      className="ms-1"
                    />
                  </span>
                </li>
                {open.sistema && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/salas" className="nav-link">
                        <FontAwesomeIcon icon={faBuilding} className="me-2" /> Salas
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/personal" className="nav-link">
                        <FontAwesomeIcon icon={faUserTie} className="me-2" /> Personal
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/usuarios" className="nav-link">
                        <FontAwesomeIcon icon={faUser} className="me-2" /> Usuarios
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/saas/configuracion" className="nav-link">
                        <FontAwesomeIcon icon={faGear} className="me-2" /> Configuración SaaS
                      </NavLink>
                    </li>
                    {tenant?.planSaas?.tieneAppPersonalizada && (
                      <li className="nav-item">
                        <NavLink to="/configuracion/branding" className="nav-link">
                          <FontAwesomeIcon icon={faPalette} className="me-2" /> Personalización
                        </NavLink>
                      </li>
                    )}
                  </>
                )}
              </>
            )}

            {rol === "Administrador" && (
              <>
                <hr className="sidebar-divider" />
                <li className="nav-section" onClick={() => toggle("pagos")}>
                <span className="sidebar-title">
                  CONTABILIDAD{" "}
                  <FontAwesomeIcon
                    icon={open.pagos ? faChevronUp : faChevronDown}
                    className="ms-1"
                  />
                </span>
              </li>

              {open.pagos && (
                <>
                  <li className="nav-item">
                    <NavLink to="/finanzas" className="nav-link">
                      <FontAwesomeIcon icon={faChartBar} className="me-2" /> Finanzas
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/auditoria" className="nav-link">
                      <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Auditoría de Cajas
                    </NavLink>
                  </li>
                </>
              )}
            </>
          )}
          </>
        )}

        {/* Sección Super Tenant - Solo visible para tenant ID 1 y rol Administrador */}
        {tenant?.id === 1 && rol === "Administrador" && (
          <>
            <hr className="sidebar-divider" />
            <li className="nav-section" onClick={() => toggle("superTenant")}>
              <span className="sidebar-title">
                SUPER TENANT{" "}
                <FontAwesomeIcon
                  icon={open.superTenant ? faChevronUp : faChevronDown}
                  className="ms-1"
                />
              </span>
            </li>

            {open.superTenant && (
              <>
                <li className="nav-item">
                  <NavLink to="/saas/admin/dashboard" className="nav-link">
                    <FontAwesomeIcon icon={faChartBar} className="me-2" /> Dashboard Admin
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/saas/admin/documentos-legales" className="nav-link">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Documentos Legales
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/integraciones/mercadopago" className="nav-link">
                    <FontAwesomeIcon icon={faPlug} className="me-2" /> Integraciones
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/payments/test" className="nav-link">
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" /> Test Pagos
                  </NavLink>
                </li>
              </>
            )}
          </>
        )}
      </ul>

      {/* Footer credit */}
      <div className="sidebar-footer text-center mt-3 mb-3" style={{ padding: "10px" }}>
        <a
          href="https://www.zinnia-code.com"
          target="_blank"
          rel="noreferrer"
          className="d-flex align-items-center justify-content-center gap-2 text-decoration-none"
          style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}
        >
          <img
            src="/zinnia.png"
            alt="Zinnia"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <span>Created by Zinnia&lt;code&gt;</span>
        </a>
      </div>
    </div>
  );
}
