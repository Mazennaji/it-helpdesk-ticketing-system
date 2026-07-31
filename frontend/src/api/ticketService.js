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

export async function assignTicket(id, agentId) {
  const { data } = await axiosClient.put(`/tickets/${id}/assign`, { agentId });
  return data;
}

export async function escalateTicket(id, reason) {
  const { data } = await axiosClient.post(`/tickets/${id}/escalate`, { reason });
  return data;
}

export async function fetchComments(ticketId) {
  const { data } = await axiosClient.get(`/tickets/${ticketId}/comments`);
  return data;
}

export async function addComment(ticketId, commentText, isInternal = false) {
  const { data } = await axiosClient.post(`/tickets/${ticketId}/comments`, {
    commentText,
    isInternal,
  });
  return data;
}

export async function fetchActivityLog(ticketId) {
  const { data } = await axiosClient.get(`/tickets/${ticketId}/activity`);
  return data;
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

export async function fetchAgents() {
  const { data } = await axiosClient.get("/users/agents");
  return data;
}