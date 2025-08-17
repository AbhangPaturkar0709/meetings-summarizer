import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const generateSummary = (transcript, prompt) =>
  axios.post(`${API_BASE}/api/ai/generate`, { transcript, prompt });

export const saveSummary = (summaryId, edited) =>
  axios.post(`${API_BASE}/api/ai/save`, { summaryId, edited });

export const sendMail = (to, subject, body) =>
  axios.post(`${API_BASE}/api/email/send`, { to, subject, body });

export const fetchSummary = (id) =>
  axios.get(`${API_BASE}/api/ai/${id}`);
