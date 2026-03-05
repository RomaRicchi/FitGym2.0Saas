interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number; // opcional: para mostrar "Mostrando X–Y de Z"
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
}: PaginationProps) {
  // Ya no ocultamos la paginación si totalPages <= 1, solo deshabilitamos los controles
  const hasMultiplePages = totalPages > 1;

  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Calcula el rango actual (para "Mostrando 11–20 de 53 resultados")
  const start = totalItems && totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems || 0);

  // 🎯 Calcula qué páginas mostrar (máximo 5 botones + elipses)
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      if (currentPage <= 3) {
        // Está al principio
        for (let i = 2; i <= maxVisible - 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Está al final
        pages.push("...");
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Está en el medio
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-2 p-3" style={{ backgroundColor: "#2d2d2d", borderRadius: "12px", border: "1px solid #3d3d3d" }}>
      {/* 🟠 Info: rango visible */}
      {totalItems !== undefined && totalItems > 0 ? (
        <small style={{ fontSize: "0.9rem", color: "var(--tenant-primary-color)" }}>
          📄 Mostrando <strong>{start}</strong>–<strong>{end}</strong> de <strong>{totalItems}</strong> resultados
          {hasMultiplePages && (
            <span style={{ color: "var(--tenant-primary-color)", marginLeft: "8px" }}>(Página {currentPage} de {totalPages})</span>
          )}
        </small>
      ) : (
        <small style={{ color: "var(--tenant-primary-color)" }}>
          📄 {totalItems === 0 ? "No hay resultados" : `${totalItems} resultado${totalItems === 1 ? '' : 's'}`}
        </small>
      )}

      {/* 🔸 Controles de paginación */}
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${!hasMultiplePages || currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link fw-bold"
              style={{
                borderColor: "#444",
                backgroundColor: "#2d2d2d",
                color: "var(--tenant-primary-color)"
              }}
              onClick={() => handleClick(currentPage - 1)}
              disabled={!hasMultiplePages || currentPage === 1}
            >
              «
            </button>
          </li>

          {pageNumbers.map((page, i) => {
            if (page === "...") {
              return (
                <li key={`ellipsis-${i}`} className="page-item disabled">
                  <span
                    className="page-link"
                    style={{
                      backgroundColor: "#2d2d2d",
                      borderColor: "#444",
                      color: "#666"
                    }}
                  >...</span>
                </li>
              );
            }

            return (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link fw-bold"
                  style={{
                    borderColor: "#444",
                    backgroundColor:
                      currentPage === page ? "#3d3d3d" : "#2d2d2d",
                    color: "var(--tenant-primary-color)",
                  }}
                  onClick={() => handleClick(page as number)}
                >
                  {page}
                </button>
              </li>
            );
          })}

          <li
            className={`page-item ${!hasMultiplePages || currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link fw-bold"
              style={{
                borderColor: "#444",
                backgroundColor: "#2d2d2d",
                color: "var(--tenant-primary-color)"
              }}
              onClick={() => handleClick(currentPage + 1)}
              disabled={!hasMultiplePages || currentPage === totalPages}
            >
              »
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
