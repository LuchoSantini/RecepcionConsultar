import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Employee from "./components/Employee";
import Recepcionist from "./components/Recepcionist";

function App() {
  return (
    <Box>
      <BrowserRouter>
        <Routes>
          {/* Ruta por defecto: Employee */}
          <Route path="/" element={<Employee />} />

          {/* Ruta para Recepcionist */}
          <Route
            path="/recepcion"
            element={
              <Box>
                <Recepcionist />
              </Box>
            }
          />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
