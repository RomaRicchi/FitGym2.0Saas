import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import Pagination from "@/components/Pagination";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import { GrupoMuscularCreateSwal } from "@/views/rutinas/grupoMuscular/GrupoMuscularCreateSwal";
import { GrupoMuscularEditSwal } from "@/views/rutinas/grupoMuscular/GrupoMuscularEditSwal";

interface GrupoMuscular {
  id: number;
  nombre: string;
}

export default function GruposMuscularesList() {
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchGrupos = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await gymApi.get(`/gruposmusculares?page=${page}&pageSize=${pageSize}`);
      const data = res.data;
      const payload = data?.data ?? data;
      const lista = payload?.items || payload || [];
      if (!Array.isArray(lista)) throw new Error("Formato inesperado de categorías");
      setGrupos(lista);
      setTotalItems(payload?.totalItems || lista.length);
    } catch (err) {
      setError("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, [page]);

  const handleDelete = async (id: number, nombre: string): Promise<void> => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await gymApi.delete(`/gruposmusculares/${id}`);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Categoría eliminada correctamente.",
          timer: 1200,
          showConfirmButton: false,
        });
        fetchGrupos();
      } catch {
        Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
      }
    }
  };

  if (loading)
    return <p className="text-center mt-5 text-light">Cargando categorías...</p>;
  if (error)
    return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="titulo-modulo">CATEGORÍAS</h1>

      {/* Botón superior */}
      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn btn-success fw-semibold"
          onClick={() => GrupoMuscularCreateSwal(fetchGrupos)}
        >
          <i class="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-striped align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>Nombre de la Categoría</th>
              <th style={{ width: "140px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-muted py-4">
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              grupos.map((g) => (
                <tr key={g.id}>
                  <td className="fw-semibold text-start ps-4">{g.nombre}</td>
                  <td>
                    <ActionGroup className="justify-content-center">
                      <ActionButton
                        action="edit"
                        tooltip="Editar categoría"
                        variant="warning"
                        onClick={() => GrupoMuscularEditSwal(g.id.toString(), () => fetchGrupos())}
                      >
                        <i class="fas fa-edit"></i>
                      </ActionButton>
                      <ActionButton
                        action="delete"
                        tooltip="Eliminar categoría"
                        variant="danger"
                        onClick={() => handleDelete(g.id, g.nombre)}
                      >
                        <i class="fas fa-trash"></i>
                      </ActionButton>
                    </ActionGroup>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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


