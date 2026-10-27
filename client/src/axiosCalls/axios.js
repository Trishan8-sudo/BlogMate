import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8068'
const baseURL = rawApiUrl.replace(/\/+$/, '')

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance