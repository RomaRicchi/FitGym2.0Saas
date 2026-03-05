import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import Pagination from "@/components/Pagination";
import { RutinaPlantillaEjercicioCreateSwal } from "@/views/rutinas/rutina-ejercicios/RutinaPlantillaEjercicioCreateSwal";
import { RutinaPlantillaEjercicioEditSwal } from "@/views/rutinas/rutina-ejercicios/RutinaPlantillaEjercicioEditSwal";

interface RutinaPlantillaEjercicio {
  id: number;
  rutina: string;
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  descansoSeg: number;
}

export default function RutinaPlantillaEjercicioList() {
  const [items, setItems] = useState<RutinaPlantillaEjercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // 🔹 Cargar lista desde backend
  const fetchItems = async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await gymApi.get(
        `/rutinasplantillaejercicios?page=${p}&pageSize=${pageSize}&q=${q}`
      );
      const data = res.data;
      const payload = data?.data ?? data;
      const lista = payload?.items || payload?.data || payload || [];
      if (!Array.isArray(lista)) throw new Error("Formato inesperado de actividades de rutina");
      setItems(lista);
      setTotalItems(payload?.totalItems || payload?.TotalCount || lista.length);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las actividades de rutina",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length >= 3 || search.length === 0) {
        fetchItems(page, search);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };


  // Eliminar registro
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        await gymApi.delete(`/rutinasplantillaejercicios/${id}`);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Registro eliminado correctamente",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchItems(page, search);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el registro",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="titulo-modulo">RUTINAS / ACTIVIDADES</h1>

      {/* 🔍 Buscador y Botones alineados */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por rutina o actividad..."
          value={search}
          onChange={handleSearch}
          className="form-control"
          style={{
            width: "50%",
            borderColor: "var(--tenant-primary-color)",
            borderWidth: "2px",
            outline: "2px solid var(--tenant-primary-color)",
            outlineColor: "var(--tenant-primary-color)",
            boxShadow: "0 0 0 2px var(--tenant-primary-color)",
            height: "38px",
          }}
        />

        <button
          className="ms-3 fw-semibold"
          style={{
            backgroundColor: "var(--tenant-primary-color)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            transition: "all 0.2s ease",
            height: "38px",
            padding: "0 24px",
            whiteSpace: "nowrap",
          }}
          onClick={() => {
            setSearch("");
            setPage(1);
          }}
        >
          Limpiar
        </button>

        <button
          className="btn btn-success ms-3 fw-semibold"
          style={{
            height: "38px",
            padding: "0 24px",
            whiteSpace: "nowrap",
          }}
          onClick={() => RutinaPlantillaEjercicioCreateSwal(() => fetchItems(page, search))}
        >
          <i class="fas fa-plus"></i> Nuevo
        </button>
      </div>

      {/* 🔹 Tabla */}
      <div className="table-responsive">
        <table className="tabla-gestion table align-middle text-center">
          <thead>
            <tr>
              <th>RUTINA</th>
              <th>ACTIVIDAD</th>
              <th>ORDEN</th>
              <th>SERIES</th>
              <th>REPS</th>
              <th>DESCANSO (SEG)</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted py-4">
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id}>
                  <td className="fw-semibold">{r.rutina}</td>
                  <td>{r.ejercicio}</td>
                  <td>{r.orden}</td>
                  <td>{r.series}</td>
                  <td>{r.repeticiones}</td>
                  <td>{r.descansoSeg}</td>
                  <td>
                    <div className="acciones-botones">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() =>
                          RutinaPlantillaEjercicioEditSwal(r.id, () => fetchItems(page, search))
                        }
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => handleDelete(r.id)}
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}


