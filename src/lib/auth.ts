export interface User {
	id: number
	email: string
	role: 'student' | 'employee'
	name: string
	surname: string
	middle_name?: string
	phone: string
	photo?: string
	group?: string
	floor?: number
	wing?: 'male' | 'female'
	block?: string
	room?: string
	room_type: 2 | 3
	emergency_contact_name?: string
	emergency_contact_phone?: string
	emergency_contact_relation?: string
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
	const publicRoutes = ['/auth/login', '/auth/forgotpass', '/reset-password']

	return publicRoutes.some(route => pathname.startsWith(route))
}

export const isAuthRoute = (pathname: string): boolean => {
	const authRoutes = ['/auth/login', '/auth/forgotpass']

	return authRoutes.some(route => pathname.startsWith(route))
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
