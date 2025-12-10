export interface User {
	id: string
	email: string
	role: 'student' | 'employee'
}

export const auth = {
	isAuthenticated: (): boolean => {
		const token = localStorage.getItem('dorm-token')
		const user = localStorage.getItem('dorm-user')
		return !!token && !!user
	},
	getUser: (): User | null => {
		const userStr = localStorage.getItem('dorm-user')
		if (!userStr) return null

		try {
			return JSON.parse(userStr)
		} catch (error) {
			console.error('Ошибка при парсинге пользователя:', error)
			return null
		}
	},

	login: (token: string, user: User): void => {
		localStorage.setItem('dorm-token', token)
		localStorage.setItem('dorm-user', JSON.stringify(user))

		console.log('Пользователь авторизован', user.email)
	},

	logout: (): void => {
		localStorage.removeItem('dorm-token')
		localStorage.removeItem('dorm-user')

		console.log('Пользователь вышел из системы')
	},

	register: (token: string, user: User): void => {
		auth.login(token, user)
		console.log('Новый пользователь зарегистрирован', user.email)
	},

	isStudent: (): boolean => {
		const user = auth.getUser()
		return user?.role === 'student'
	},

	isEmployee: (): boolean => {
		const user = auth.getUser()
		return user?.role === 'employee'
	},

	getToken: (): string | null => {
		return localStorage.getItem('dorm-token')
	},

	updateUser: (updateUser: Partial<User>): void => {
		const currentUser = auth.getUser()
		if (!currentUser) return
		const newUser = { ...currentUser, ...updateUser }
		localStorage.setItem('dorm-user', JSON.stringify(newUser))
	},
}

export const isPublicRoute = (pathname: string): boolean => {
	const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgotpass']

	return publicRoutes.some(route => pathname.startsWith(route))
}

export const getDashboardPath = (): string => {
	const user = auth.getUser()

	if (!user) return '/auth/login'

	switch (user.role) {
		case 'student':
			return '/student/dashboard'
		case 'employee':
			return '/employee/dashboard'
		default:
			return '/'
	}
}
