import axios from "axios";

const api = axios.create({
  baseURL: "https://recepcion-consultar.somee.com",
  // baseURL: "http://localhost:5115",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
