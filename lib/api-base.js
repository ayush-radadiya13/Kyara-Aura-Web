export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://kayraaura.up.railway.app";

export function apiUrl(path) {
  return `${API_BASE.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}
