import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getPendingAccess,
  postApproveAcccess,
  postDenyAcccess,
} from "../api/ApiServices";
import { showToast } from "../hooks/Toast.jsx";

const Recepcionist = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollIntervalSec] = useState(5);
  const lastPendingIds = useRef(new Set());
  const audioRef = useRef(null);
  const pollTimer = useRef(null);

  // 🔄 Estado para confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    id: null,
    title: "",
    message: "",
  });

  // ❌ Estado para errores
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    audioRef.current = new Audio("/sonido.mp3");
    startPolling();

    return () => stopPolling();
  }, []);

  const startPolling = () => {
    stopPolling();
    pollTimer.current = setInterval(loadPending, pollIntervalSec * 1000);
    loadPending();
  };

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const loadPending = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getPendingAccess();
      const data = res.data;
      handleNewItems(data);
      setPending(data);
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewItems = (items) => {
    const currentIds = new Set(items.map((it) => it.id));
    const isNew = [...currentIds].some((id) => !lastPendingIds.current.has(id));

    if (isNew && audioRef.current) {
      audioRef.current.play().catch((err) => console.log("Error sonido:", err));
    }

    lastPendingIds.current = currentIds;
  };

  // 👇 Acción cuando el usuario confirma aprobar o denegar
  const handleConfirmAction = async () => {
    const { action, id } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, open: false });

    try {
      if (action === "approve") {
        await postApproveAcccess(id);
        showToast("Acceso aprobado", "#0a8ac5ff");
      } else if (action === "deny") {
        const res = await postDenyAcccess(id);
        showToast(res.data?.message || "Acceso denegado", "#d32f2f");
      }
      loadPending();
    } catch (err) {
      setErrorDialog({
        open: true,
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const openConfirm = (action, id) => {
    const isApprove = action === "approve";
    setConfirmDialog({
      open: true,
      action,
      id,
      title: isApprove ? "Aprobar acceso" : "Denegar acceso",
      message: isApprove
        ? "¿Estás seguro de que deseas aprobar el acceso?"
        : "¿Estás seguro de que deseas denegar el acceso?",
    });
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100dvh", bgcolor: "#f6f7fb" }}>
      <Box
        component="header"
        sx={{
          background: "linear-gradient(90deg, #eef2ff, #f0f9ff)",
          padding: "10px 0",
          borderBottom: "1px solid #e6eef8",
          textAlign: "center",
        }}
      >
        <Container>
          <Box mt={1}>
            <img src="/labo.png" width="200" height="75" alt="Logo" />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Lista actualizada automáticamente. Presiona "Aprobar" para autorizar
            entrada.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography mb={1} textAlign={"center"} variant="h6">
            Recepción - Confirmación de Acceso
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Button variant="outlined" onClick={loadPending}>
              Refrescar
            </Button>
            <Typography variant="body2" color="text.secondary">
              Polling: {pollIntervalSec}s
            </Typography>
          </Stack>

          {loading ? (
            <Box textAlign="center" py={2}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Cargando...
              </Typography>
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : pending.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay solicitudes pendientes.
            </Typography>
          ) : (
            <List>
              {pending.map((item) => (
                <ListItem
                  key={item.id}
                  divider
                  sx={{
                    border: "1px solid #f0f4fb",
                    borderRadius: 2,
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      DNI: {item.dni} —{" "}
                      {new Date(item.requestedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => openConfirm("approve", item.id)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => openConfirm("deny", item.id)}
                    >
                      Denegar
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      {/* 🔒 Modal de Confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: 3, // Cambia el valor aquí, 4 = 32px (1 unidad = 8px)
            p: 1,
          },
        }}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            sx={{ borderRadius: 3 }}
            variant="outlined"
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Cancelar
          </Button>
          <Button
            sx={{ borderRadius: 3 }}
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmDialog.action === "approve" ? "primary" : "error"}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ❌ Modal de Error */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ ...errorDialog, open: false })}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setErrorDialog({ ...errorDialog, open: false })}
            autoFocus
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recepcionist;
