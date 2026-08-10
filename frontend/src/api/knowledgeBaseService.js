import axiosClient from "./axiosClient";

export async function fetchArticles(params = {}) {
  const { data } = await axiosClient.get("/knowledge-base", { params });
  return data;
}

export async function fetchArticle(id) {
  const { data } = await axiosClient.get(`/knowledge-base/${id}`);
  return data;
}

export async function fetchArticleCategories() {
  const { data } = await axiosClient.get("/knowledge-base/categories");
  return data;
}

export async function createArticle(payload) {
  const { data } = await axiosClient.post("/knowledge-base", payload);
  return data;
}

export async function updateArticle(id, payload) {
  const { data } = await axiosClient.put(`/knowledge-base/${id}`, payload);
  return data;
}

export async function deleteArticle(id) {
  await axiosClient.delete(`/knowledge-base/${id}`);
}