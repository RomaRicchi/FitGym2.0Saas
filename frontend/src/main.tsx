import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import './styles/swal-card.css';
import './styles/swal-theme.css';
import 'select2/dist/css/select2.min.css';
import './styles/main.css';
import './styles/Layout.css';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// jQuery global (requerido por Select2)
import $ from "jquery";
;(window as any).$ = $;
;(window as any).jQuery = $;

import "select2/dist/js/select2.full.min.js";
import "select2";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
