import axiosClient from "./axiosClient";

export async function fetchAttachments(ticketId) {
  const { data } = await axiosClient.get(`/tickets/${ticketId}/attachments`);
  return data;
}

export async function uploadAttachment(ticketId, file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosClient.post(
    `/tickets/${ticketId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    }
  );
  return data;
}

export async function downloadAttachment(ticketId, attachmentId, fileName) {
  const response = await axiosClient.get(
    `/tickets/${ticketId}/attachments/${attachmentId}/download`,
    { responseType: "blob" }
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}