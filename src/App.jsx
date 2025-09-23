import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Employee from "./components/Employee";
import Recepcionist from "./components/Recepcionist";

function App() {
  return (
    <Box>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Employee />} />
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
