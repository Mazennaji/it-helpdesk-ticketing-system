import axiosClient from "./axiosClient";

export async function fetchDashboardSummary() {
  const { data } = await axiosClient.get("/dashboard/summary");
  return data;
}

export async function fetchVolumeTrend(days = 30) {
  const { data } = await axiosClient.get("/dashboard/volume-trend", { params: { days } });
  return data;
}

export async function fetchByCategory() {
  const { data } = await axiosClient.get("/dashboard/by-category");
  return data;
}

export async function fetchByPriority() {
  const { data } = await axiosClient.get("/dashboard/by-priority");
  return data;
}