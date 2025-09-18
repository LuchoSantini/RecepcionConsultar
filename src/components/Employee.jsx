import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { postAccess, getAccessStatusByDNI } from "../api/ApiServices";

export default function Employee({ title = "Acceso por QR" }) {
  const [dni, setDni] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const pollRef = useRef(null);

  const dniDigits = useMemo(() => dni.replace(/\D/g, "").slice(0, 4), [dni]);
  const isValid = dniDigits.length === 4;

  const stopPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const showAlert = (message, severity = "info") => {
    setAlert({ message, severity });
  };

  const clearAll = () => {
    setDni("");
    setStatus(null);
    setAlert(null);
    stopPolling();
  };

  const handleChange = (e) => {
    setDni(e.target.value.replace(/\D/g, "").slice(0, 4));
    setAlert(null);
    setStatus(null);
  };

  const checkStatus = async (dniParam) => {
    try {
      const res = await getAccessStatusByDNI(dniParam);
      const currentStatus = res.data?.status;

      if (currentStatus) {
        setStatus(currentStatus);
        const msg =
          currentStatus === "Approved"
            ? "✅ Aprobado, espera un momento."
            : currentStatus === "Denied"
            ? "❌ Acceso denegado."
            : "Pendiente...";

        showAlert(`Estado de tu solicitud: ${msg}`);

        if (currentStatus !== "Pending") stopPolling();
      } else {
        showAlert("No se encontró ninguna solicitud", "warning");
      }
    } catch (err) {
      showAlert(`Error al consultar estado: ${err.message}`, "error");
    }
  };

  const startPolling = (dniParam) => {
    stopPolling();
    pollRef.current = setInterval(() => checkStatus(dniParam), 5000);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      showAlert("Ingresa exactamente 4 dígitos.", "warning");
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await postAccess(dniDigits);
      showAlert(`Solicitud enviada: ${res.data?.empleado || "OK"}`, "success");
      startPolling(dniDigits);
      setDni("");
    } catch (err) {
      const msg = err?.response?.data || err.message || "Error desconocido";
      showAlert(`Error: ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  useEffect(() => {
    return () => stopPolling(); // Limpiar al desmontar
  }, []);

  const statusChip = useMemo(() => {
    if (!status) return null;

    const map = {
      Approved: { label: "Aprobado", color: "success" },
      Pending: { label: "Pendiente", color: "warning" },
      Denied: { label: "Denegado", color: "error" },
    };

    return (
      <Chip size="small" color={map[status].color} label={map[status].label} />
    );
  }, [status]);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f6f7fb" }}>
      <Box
        component="header"
        sx={{
          backgroundImage: "linear-gradient(90deg, #eef2ff, #f0f9ff)",
          borderBottom: "1px solid #e6eef8",
          py: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Box
            component="img"
            src="/labo.png"
            alt="Laboratorio Consultar"
            sx={{ width: 200, height: 75, objectFit: "contain", mt: 1 }}
          />

          <Typography variant="body2" color="text.secondary" mt={1}>
            Introduce los últimos cuatro dígitos de tu DNI y presiona "Solicitar
            acceso".
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ my: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography textAlign={"center"} variant="h5" fontWeight={700}>
                {title}
              </Typography>
              <TextField
                label="Últimos 4 dígitos del DNI"
                value={dni}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 4,
                }}
                helperText={
                  !isValid && dni.length > 0 ? "Deben ser 4 dígitos" : " "
                }
                error={dni.length > 0 && !isValid}
              />

              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                  sx={{ minWidth: 180, fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Enviando...
                    </>
                  ) : (
                    "Solicitar acceso"
                  )}
                </Button>
                {/* <Button variant="outlined" color="primary" onClick={clearAll}>
                  Limpiar
                </Button> */}
              </Stack>

              {alert && (
                <Alert severity={alert.severity} sx={{ width: "91.3%" }}>
                  {alert.message}
                </Alert>
              )}

              <Divider />
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Typography variant="body2" color="text.secondary">
                  Estado:
                </Typography>
                {statusChip || (
                  <Chip size="small" variant="outlined" label="Sin consulta" />
                )}
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Sistema válido solo para integrantes de Laboratorio Consultar.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
