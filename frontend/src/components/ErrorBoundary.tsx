import { Component, ReactNode } from "react";
import Swal from "sweetalert2";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  hasShownError: boolean; // Flag para evitar mostrar el error múltiples veces
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, hasShownError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, hasShownError: false };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Solo mostrar el error si no se ha mostrado aún
    if (!this.state.hasShownError) {
      this.setState({ hasShownError: true });

      // Usar setTimeout para evitar bloqueos durante el renderizado
      setTimeout(() => {
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: "Ha ocurrido un error. Por favor recarga la página.",
          confirmButtonText: "Recargar",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        }).then(() => {
          window.location.reload();
        });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderizar un fallback UI sin llamar a Swal ni reload aquí
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'var(--tenant-primary-color)', marginBottom: '20px' }}>Oops! Algo salió mal</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
            Ha ocurrido un error inesperado. Por favor recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'var(--tenant-primary-color)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
