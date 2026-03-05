import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faClipboardList,
  faCalendarAlt,
  faRunning,
} from "@fortawesome/free-solid-svg-icons";
import "@/styles/DashboardSocio.css";

const DashboardSocio: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    { title: "Planes", icon: faDumbbell, path: "/socio/planesSocio" },
    { title: "Suscripciones", icon: faClipboardList, path: "/socio/suscripcionesSocio" },
    { title: "Turnos", icon: faCalendarAlt, path: "/socio/turnosSocio" },
    { title: "Rutinas", icon: faRunning, path: "/socio/rutinasSocio" },
  ];

  return (
    
      <div className="dashboard-socio-content">
        <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
        >
        Panel del Socio
        </h1>

        <div className="dashboard-grid">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.path)}
              className="dashboard-card"
            >
              <FontAwesomeIcon icon={card.icon} size="3x" />
              <span>{card.title}</span>
            </button>
          ))}
        </div>
      </div>
   
  );
};

export default DashboardSocio;


