import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/rutina-cards.css";

interface Rutina {
  id: number;
  nombre: string;
  objetivo?: string;
  dia?: string;
  imagenUrl?: string;
  profesorNombre?: string;
  observacion?: {
    profesor: string;
    texto: string;
    fecha: string;
  };
  ejercicios?: Ejercicio[];
}

interface Ejercicio {
  id: number;
  nombre: string;
  mediaUrl?: string;
  tips?: string;
  series: number;
  repeticiones: number;
  descansoSeg: number;
}

export default function RutinasSocio() {
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //  Función auxiliar para obtener imágenes absolutas seguras
  const getImagen = (url: string | null | undefined): string => {
    if (!url || url === "null" || url.trim() === "") return "/images/empty.png";
    if (!url.startsWith("http")) {
      const base =
        import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
        "http://localhost:5144/api";
      return `${base}/${url.replace(/^\/+/, "")}`;
    }
    return url;
  };

  const cargarRutina = async (): Promise<void> => {
    try {
      const { data } = await gymApi.get("/suscripcionturno/rutina/socio");
      setRutina(data || null);
      setEjercicios(data?.ejercicios || []);
    } catch (error: any) {
      // Si es 404, significa que el socio no tiene rutina asignada para el turno de hoy
      if (error.response?.status === 404) {
        setRutina(null);
        setEjercicios([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la rutina de hoy.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRutina();
  }, []);

  const verImagen = (imgUrl: string, nombre: string, tips?: string): void => {
    Swal.fire({
      title: nombre,
      text: tips || "Sin descripción",
      imageUrl: getImagen(imgUrl),
      imageWidth: 420,
      imageHeight: 320,
      background: "#1e1e1e",
      color: "#fff",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  if (loading) return <p style={{ color: "#fff" }}>Cargando rutina...</p>;
  if (!rutina)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-300">
        <p className="text-xl"><i class="fa-solid fa-dumbbell"></i> No hay rutina asignada para el turno de hoy.</p>
        <p className="text-sm mt-2">Si tenés turno hoy, consultá con tu profesor para que te asigne una rutina.</p>
      </div>
    );

  return (
    <div className="rutina-container">
      <h2 className="titulo-principal">Rutina de Hoy <i class="fa-solid fa-heart"></i></h2>

      <div className="rutina-card-grande">
        {/* LADO IZQUIERDO */}
        <div className="rutina-izquierda">
          <img
            src={getImagen(rutina.imagenUrl)}
            alt={rutina.nombre}
            className="rutina-imagen-grande"
            onError={(e) => (e.currentTarget.src = "/images/empty.png")}
            onClick={() =>
              verImagen(rutina.imagenUrl || "", rutina.nombre, rutina.objetivo)
            }
          />
          <div className="rutina-detalle">
            <h3>{rutina.nombre}</h3>
            <p>{rutina.objetivo}</p>
            <p>
              <strong>Día:</strong> {rutina.dia}
            </p>
            {rutina.profesorNombre && (
              <p>
                <strong>Profesor:</strong> {rutina.profesorNombre}
              </p>
            )}
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="rutina-derecha">
          <h4>Actividades</h4>
          {ejercicios.length === 0 ? (
            <p>Esta rutina todavía no tiene actividades cargadas.</p>
          ) : (
            <div className="lista-ejercicios">
              {ejercicios.map((e) => (
                <div key={e.id} className="ejercicio-fila">
                  <img
                    src={getImagen(e.mediaUrl || "")}
                    alt={e.nombre}
                    className="img-ejercicio-mini"
                    onClick={() => verImagen(e.mediaUrl || "", e.nombre, e.tips)}
                    onError={(ev) =>
                      (ev.currentTarget.src = "/images/empty.png")
                    }
                  />
                  <div className="info-ejercicio">
                    <h5>{e.nombre}</h5>
                    <p>
                      {e.series}x{e.repeticiones} | Descanso: {e.descansoSeg}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OBSERVACIONES DEL PROFESOR */}
      {rutina.observacion && (
        <div className="observacion-box">
          <h4>Observaciones del profesor</h4>
          <p>
            <strong>{rutina.observacion.profesor}</strong>:{" "}
            {rutina.observacion.texto || "Sin comentarios."}
          </p>
          <small style={{ color: "#aaa" }}>
            {new Date(rutina.observacion.fecha).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </small>
        </div>
      )}
    </div>
  );
}


