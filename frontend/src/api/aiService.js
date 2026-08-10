import axiosClient from "./axiosClient";

export async function classifyTicket(payload) {
  const { data } = await axiosClient.post("/ai/classify", payload);
  return data;
}

export async function draftReply(payload) {
  const { data } = await axiosClient.post("/ai/draft-reply", payload);
  return data;
}

export async function sendChat(messages) {
  const { data } = await axiosClient.post("/ai/chat", { messages });
  return data;
}