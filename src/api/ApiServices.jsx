import api from "./Api";

export const getPendingAccess = () => {
  return api.get("api/Access/pending");
};

export const getAccessStatusByDNI = (dni) => {
  return api.get(`api/Access/status/${dni}`);
};

export const postAccess = (dni) => {
  return api.post(`api/Access/${dni}`);
};

export const postApproveAcccess = (id) => {
  return api.post(`api/Access/approve/${id}`);
};

export const postDenyAcccess = (id) => {
  return api.post(`api/Access/deny/${id}`);
};
