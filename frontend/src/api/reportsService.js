import axiosClient from "./axiosClient";

export async function fetchReportSummary() {
  const { data } = await axiosClient.get("/dashboard/summary");
  return data;
}

export async function fetchReportTrend(days = 90) {
  const { data } = await axiosClient.get("/dashboard/volume-trend", {
    params: { days },
  });
  return data;
}

export async function fetchReportByCategory() {
  const { data } = await axiosClient.get("/dashboard/by-category");
  return data;
}

export async function fetchReportByPriority() {
  const { data } = await axiosClient.get("/dashboard/by-priority");
  return data;
}