import axios from "axios";
const endpoint = 'http://127.0.0.1:9000';
let end = process.env.REACT_APP_BACKEND_ENDPOINT;

// Primary APIs
export const api = axios.create({
  baseURL: endpoint,
  timeout: 200000,
})

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    error["message"] = error?.response?.data?.message
    return Promise.reject(error)
  },
)

export function setAuthHeader(token) {
  api.defaults.headers.authorization = `Bearer ${token}`
}

export function clearAuthHeader() {
  delete api.defaults.headers.authorization
}
