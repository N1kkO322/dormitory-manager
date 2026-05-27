import axios, {
	type AxiosAdapter,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from 'axios'
import { isPublicRoute } from './auth'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	// baseURL: 'https://x2zg0xzj-8000.euw.devtunnels.ms/',
	headers: {
		'Content-Type': 'application/json',
	},
})

const defaultAdapter = axios.getAdapter(api.defaults.adapter)
const inFlightGetRequests = new Map<string, Promise<AxiosResponse>>()

const getRequestKey = (config: InternalAxiosRequestConfig): string => {
	const authorization = config.headers.getAuthorization?.() ?? ''

	return [
		(config.method ?? 'get').toLowerCase(),
		api.getUri(config),
		String(authorization),
	].join(' ')
}

const dedupeGetAdapter: AxiosAdapter = config => {
	if ((config.method ?? 'get').toLowerCase() !== 'get') {
		return defaultAdapter(config)
	}

	const requestKey = getRequestKey(config)
	const inFlightRequest = inFlightGetRequests.get(requestKey)

	if (inFlightRequest) {
		return inFlightRequest
	}

	const request = defaultAdapter(config).finally(() => {
		inFlightGetRequests.delete(requestKey)
	})

	inFlightGetRequests.set(requestKey, request)

	return request
}

api.defaults.adapter = dedupeGetAdapter

api.interceptors.request.use(config => {
	const token = localStorage.getItem('dorm-token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	response => response,
	error => {
		if (
			error.response?.status === 401 &&
			!isPublicRoute(window.location.pathname)
		) {
			localStorage.removeItem('dorm-token')
			localStorage.removeItem('dorm-user')
			window.location.href = '/auth/login'
		}
		return Promise.reject(error)
	},
)

export default api
