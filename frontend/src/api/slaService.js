import axiosClient from "./axiosClient";

export async function fetchSlaSummary() {
  const { data } = await axiosClient.get("/sla/summary");
  return data;
}