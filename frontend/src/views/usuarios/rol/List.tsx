import { useEffect, useState } from "react";
import gymApi from "@/api/gymApi";

interface Rol {
  id: number;
  nombre: string;
}

/**
 * Vista de solo lectura para listar los roles del sistema
 * Los roles son fijos y no se pueden crear, editar ni eliminar
 */
export default function RolesList() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get("/roles");
      setRoles(res.data.items || res.data);
      setError(null);
    } catch {
      setError("Error al cargar los roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) return <p>Cargando roles...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        ROLES DEL SISTEMA
      </h1>

      <div className="alert alert-info mb-3">
        <strong><i class="fa-solid fa-circle-info"></i> Información:</strong> Los roles del sistema son fijos y no se pueden modificar.
      </div>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nombre}</td>
              <td>
                {r.id === 1 && "Administrador del sistema"}
                {r.id === 2 && "Profesor/Entrenador"}
                {r.id === 3 && "Recepcion"}
                {r.id === 4 && "Socio/Cliente"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


