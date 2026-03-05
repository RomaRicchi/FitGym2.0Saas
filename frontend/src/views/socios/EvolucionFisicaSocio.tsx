import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { mostrarFormularioEvolucion } from "@/views/socios/RegistrarEvolucionFisica";
import "@/styles/EvolucionFisica.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, ChartTooltip, Legend, Filler);

interface EvolucionFisica {
  id: number;
  fecha: string;
  peso: number;
  altura: number;
  imc: number | null;
  pesoIdeal: number | null;
  pecho: number | null;
  cintura: number | null;
  cadera: number | null;
  brazo: number | null;
  pierna: number | null;
  gemelo: number | null;
  observacion?: string | null;
}

export default function EvolucionFisicaSocio() {
  const [registros, setRegistros] = useState<EvolucionFisica[]>([]);
  const [loading, setLoading] = useState(true);

  const socio = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const socioId = Number(socio?.socioId ?? sessionStorage.getItem("socioId"));

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      if (!socioId) throw new Error("socioId no encontrado");
      const { data } = await gymApi.get(`/evolucionfisica/socio/${socioId}`);
      setRegistros(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la evolución física.",
        confirmButtonColor: "var(--tenant-primary-color)",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoRegistro = async () => {
    const result = await mostrarFormularioEvolucion(socioId);
    if (result.isConfirmed) cargarRegistros();
  };

  const handleEditar = async (registro: EvolucionFisica) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar evolución física",
      html: `
        <div class="swal2-grid">
          <div class="swal2-field">
            <label class="form-label fw-bold">Peso (kg)</label>
            <input id="peso" class="form-control" placeholder="Peso (kg)" type="number" step="0.01" value="${registro.peso}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Altura (cm)</label>
            <input id="altura" class="form-control" placeholder="Altura (cm)" type="number" step="0.01" value="${registro.altura}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Pecho (cm)</label>
            <input id="pecho" class="form-control" placeholder="Pecho (cm)" type="number" step="0.01" value="${registro.pecho ?? ""}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Cintura (cm)</label>
            <input id="cintura" class="form-control" placeholder="Cintura (cm)" type="number" step="0.01" value="${registro.cintura ?? ""}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Cadera (cm)</label>
            <input id="cadera" class="form-control" placeholder="Cadera (cm)" type="number" step="0.01" value="${registro.cadera ?? ""}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Brazo (cm)</label>
            <input id="brazo" class="form-control" placeholder="Brazo (cm)" type="number" step="0.01" value="${registro.brazo ?? ""}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Pierna (cm)</label>
            <input id="pierna" class="form-control" placeholder="Pierna (cm)" type="number" step="0.01" value="${registro.pierna ?? ""}" />
          </div>
          <div class="swal2-field">
            <label class="form-label fw-bold">Gemelo (cm)</label>
            <input id="gemelo" class="form-control" placeholder="Gemelo (cm)" type="number" step="0.01" value="${registro.gemelo ?? ""}" />
          </div>
          <div class="swal2-field full-row">
            <label class="form-label fw-bold">Observaciones</label>
            <textarea id="observacion" class="form-control" placeholder="Observaciones" rows="2">${registro.observacion ?? ""}</textarea>
          </div>
        </div>
      `,
      confirmButtonText: "Guardar cambios",
      showCancelButton: true,
      confirmButtonColor: "var(--tenant-primary-color)",
      cancelButtonColor: "#6c757d",
      focusConfirm: false,
      width: "min(520px, 92vw)",
      customClass: {
        popup: "swal-evolucion-popup",
        confirmButton: "btn-evolucion-confirm",
      },
      preConfirm: () => ({
        peso: parseFloat((document.getElementById("peso") as HTMLInputElement).value),
        altura: parseFloat((document.getElementById("altura") as HTMLInputElement).value),
        pecho: parseFloat((document.getElementById("pecho") as HTMLInputElement).value) || null,
        cintura: parseFloat((document.getElementById("cintura") as HTMLInputElement).value) || null,
        cadera: parseFloat((document.getElementById("cadera") as HTMLInputElement).value) || null,
        brazo: parseFloat((document.getElementById("brazo") as HTMLInputElement).value) || null,
        pierna: parseFloat((document.getElementById("pierna") as HTMLInputElement).value) || null,
        gemelo: parseFloat((document.getElementById("gemelo") as HTMLInputElement).value) || null,
        observacion: (document.getElementById("observacion") as HTMLTextAreaElement).value || null,
      }),
    });

    if (formValues) {
      try {
        await gymApi.put(`/evolucionfisica/${registro.id}`, {
          ...registro,
          socioId,
          ...formValues,
        });
        Swal.fire('<i class="fa-solid fa-circle-check"></i> Actualizado', "Los datos se guardaron correctamente.", "success");
        cargarRegistros();
      } catch (error) {
        Swal.fire('<i class="fa-solid fa-circle-xmark"></i> Error', "No se pudo actualizar el registro.", "error");
      }
    }
  };

  const handleEliminar = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--tenant-primary-color)",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await gymApi.delete(`/evolucionfisica/${id}`);
        Swal.fire("Eliminado", "El registro fue eliminado correctamente.", "success");
        cargarRegistros();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const chartData = {
    labels: registros.map((r) => new Date(r.fecha).toLocaleDateString()),
    datasets: [
      {
        label: "Peso (kg)",
        data: registros.map((r) => r.peso),
        borderColor: "var(--tenant-primary-color)",
        backgroundColor: "rgba(255,107,0,0.3)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "var(--tenant-primary-color)" } },
    },
    scales: {
      x: { ticks: { color: "#fff" }, grid: { color: "#444" } },
      y: { ticks: { color: "#fff" }, grid: { color: "#444" } },
    },
  };

  const ultimo = registros.length > 0 ? registros[0] : null;

  return (
    <div className="evolucion-container text-center">
      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: "2.5rem",
          letterSpacing: "2px",
        }}
      >
        Evolución Física
      </h1>

      <Button
        variant="warning"
        className="btn-nuevo fw-semibold"
        style={{
          backgroundColor: "var(--tenant-primary-color)",
          border: "none",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
        }}
        onClick={handleNuevoRegistro}
      >
        <i className="fa-solid fa-plus me-2"></i> Nuevo Registro
      </Button>

      {loading ? (
        <p className="text-light mt-4">Cargando registros...</p>
      ) : registros.length === 0 ? (
        <p className="text-light mt-4">Aún no hay registros físicos cargados.</p>
      ) : (
        <>
          <div
            className="evolucion-chart"
            style={{
              backgroundColor: "#1c1c1c",
              boxShadow: "0 0 15px rgba(0,0,0,0.5)",
            }}
          >
            <Line data={chartData} options={chartOptions} />
          </div>

          <p className="peso-ideal mt-4">
            <strong>Peso Sugerido:</strong>{" "}
            {ultimo?.pesoIdeal != null ? (
              <span className="text-warning fw-bold">{ultimo.pesoIdeal.toFixed(2)} kg</span>
            ) : (
              <span className="text-info">— kg</span>
            )}
          </p>

          <div className="table-responsive mt-4">
            <table className="table table-dark table-striped align-middle text-center">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Altura (cm)</th>
                  <th>IMC</th>
                  <th>Pecho</th>
                  <th>Cintura</th>
                  <th>Cadera</th>
                  <th>Brazo</th>
                  <th>Pierna</th>
                  <th>Gemelo</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td>{r.peso.toFixed(2)}</td>
                    <td>{r.altura.toFixed(2)}</td>
                    <td>{r.imc != null ? r.imc.toFixed(2) : "--"}</td>
                    <td>{r.pecho ?? "--"}</td>
                    <td>{r.cintura ?? "--"}</td>
                    <td>{r.cadera ?? "--"}</td>
                    <td>{r.brazo ?? "--"}</td>
                    <td>{r.pierna ?? "--"}</td>
                    <td>{r.gemelo ?? "--"}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn-action btn-editar-evolucion"
                          title="Editar registro"
                          onClick={() => handleEditar(r)}
                          style={{ width: 42, height: 42, padding: 0 }}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="btn-action btn-eliminar-evolucion"
                          title="Eliminar registro"
                          onClick={() => handleEliminar(r.id)}
                          style={{ width: 42, height: 42, padding: 0 }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
