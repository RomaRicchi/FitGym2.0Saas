
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function EstadosList() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);

  //  Cargar estados desde el backend
  const fetchEstados = async () => {
    try {
      const res = await gymApi.get("/estadoOrdenPago");
      setEstados(res.data.items || res.data);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los estados",
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
    fetchEstados();
  }, []);

  // Crear nuevo estado
  const crearEstado = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-plus me-1"></i> Nuevo Estado de Pago',
      html: `
        <div class="text-start" style="font-size: 0.95rem;">
          <label class="fw-bold">Nombre</label>
          <input id="nombreInput" type="text" class="form-control mb-3" placeholder="Ej: Pendiente, Pagado..." />

          <label class="fw-bold">Descripción</label>
          <textarea id="descripcionInput" class="form-control" rows="3" placeholder="Descripción opcional..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar',
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      width: "500px",
      preConfirm: () => {
        const nombre = (document.getElementById("nombreInput") as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById("descripcionInput") as HTMLTextAreaElement).value.trim();
        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation me-2"></i>El nombre es obligatorio');
          return false;
        }
        return { nombre, descripcion };
      },
    });

    if (!formValues) return;

    try {
      const res = await gymApi.post("/estadoOrdenPago", formValues);
      setEstados((prev) => [...prev, res.data]);
      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check me-2"></i>Guardado',
        text: "Estado creado correctamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
        text: "No se pudo crear el estado",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // <i className="fa-solid fa-diamond"></i> Editar estado existente
  const editarEstado = async (estado: Estado) => {
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square me-1"></i> Editar Estado de Pago',
      html: `
        <div class="text-start" style="font-size: 0.95rem;">
          <label class="fw-bold">Nombre</label>
          <input id="nombreInput" type="text" class="form-control mb-3" value="${estado.nombre}" />

          <label class="fw-bold">Descripción</label>
          <textarea id="descripcionInput" class="form-control" rows="3">${estado.descripcion || ""}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar cambios',
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      width: "500px",
      preConfirm: () => {
        const nombre = (document.getElementById("nombreInput") as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById("descripcionInput") as HTMLTextAreaElement).value.trim();
        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation me-2"></i>El nombre es obligatorio');
          return false;
        }
        return { nombre, descripcion };
      },
    });

    if (!formValues) return;

    try {
      await gymApi.put(`/estadoOrdenPago/${estado.id}`, formValues);
      setEstados((prev) =>
        prev.map((e) => (e.id === estado.id ? { ...e, ...formValues } : e))
      );
      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check me-2"></i>Actualizado',
        text: "Estado modificado correctamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
        text: "No se pudo actualizar el estado",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // Eliminar estado
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar estado?",
      text: "Esto puede afectar órdenes existentes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      try {
        await gymApi.delete(`/estadoOrdenPago/${id}`);
        setEstados((prev) => prev.filter((e) => e.id !== id));
        await Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-circle-check me-2"></i>Eliminado',
          text: "Estado eliminado correctamente",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
          text: "No se pudo eliminar el estado",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Cargando estados...</p>
      </div>
    );

  return (
    <div className="mt-4 container">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        ESTADOS DEL PAGO
      </h1>

      {/* Botón de crear */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success fw-bold"
          onClick={crearEstado}
        >
          <i className="fa-solid fa-plus me-1"></i> Nuevo Estado
        </button>
      </div>

      {/*Tabla */}
      <table className="table table-striped table-hover align-middle text-center">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estados.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-muted">
                No hay estados registrados
              </td>
            </tr>
          ) : (
            estados.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.descripcion || "—"}</td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-warning btn-sm fw-bold"
                      onClick={() => editarEstado(e)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm fw-bold"
                      onClick={() => handleDelete(e.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

