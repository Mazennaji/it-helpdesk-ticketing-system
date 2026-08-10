import axiosClient from "./axiosClient";

export async function fetchMyProfile() {
  const { data } = await axiosClient.get("/users/me");
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await axiosClient.put("/users/me", payload);
  return data;
}

export async function changeMyPassword(payload) {
  const { data } = await axiosClient.put("/users/me/password", payload);
  return data;
}

export async function updateMyPreferences(payload) {
  const { data } = await axiosClient.put("/users/me/preferences", payload);
  return data;
}