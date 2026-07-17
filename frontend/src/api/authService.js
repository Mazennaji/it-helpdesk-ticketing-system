import axiosClient from "./axiosClient";

export async function registerUser({ fullName, email, password }) {
  const { data } = await axiosClient.post("/auth/register", {
    fullName,
    email,
    password,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await axiosClient.post("/auth/login", { email, password });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await axiosClient.get("/auth/me");
  return data;
}
