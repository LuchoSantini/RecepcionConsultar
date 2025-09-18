// utils/toast.js
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Asegúrate de importar los estilos

export const showToast = (message, backgroundColor = "#1565c0") => {
  Toastify({
    text: message,
    duration: 4000,
    gravity: "top",
    position: "left",
    stopOnFocus: true,
    style: {
      background: backgroundColor,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.75,
      letterSpacing: "0.02857em",
    },
  }).showToast();
};
