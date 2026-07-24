import axiosClient from "./axiosClient";

export async function fetchTickets(params = {}) {
  const { data } = await axiosClient.get("/tickets", { params });
  return data;
}

export async function fetchTicketById(id) {
  const { data } = await axiosClient.get(`/tickets/${id}`);
  return data;
}

export async function createTicket(payload) {
  const { data } = await axiosClient.post("/tickets", payload);
  return data;
}

export async function updateTicket(id, payload) {
  const { data } = await axiosClient.put(`/tickets/${id}`, payload);
  return data;
}

export async function deleteTicket(id) {
  await axiosClient.delete(`/tickets/${id}`);
}

export async function fetchCategories() {
  const { data } = await axiosClient.get("/categories");
  return data;
}

export async function fetchPriorities() {
  const { data } = await axiosClient.get("/priorities");
  return data;
}

export async function fetchStatuses() {
  const { data } = await axiosClient.get("/statuses");
  return data;
}