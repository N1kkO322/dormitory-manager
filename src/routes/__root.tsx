import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { auth, isPublicRoute } from '../lib/auth'
import './../index.css'

const RootLayout = () => (
	<>
		<Outlet />
	</>
)

export const Route = createRootRoute({
	component: RootLayout,

	beforeLoad: ({ location }) => {
		console.log('[Root Guard] Проверяем доступ к:', location.pathname)

		const isAuthenticated = auth.isAuthenticated()

		const currentPath = location.pathname

		const isPublic = isPublicRoute(currentPath)

		if (!isAuthenticated && !isPublic) {
			console.log('Доступ запрещен. Пользователь не авторизован.')
			console.log('Перенаправляем на страницу логина...')

			throw redirect({
				to: '/auth/login',
				search: {
					redirect: currentPath,
				},
			})
		}

		if (isAuthenticated && isPublic) {
			console.log(
				'Пользователь уже авторизован. Перенаправляем с auth страниц.'
			)

			const user = auth.getUser()
			let redirectTo = '/'

			if (user?.role === 'student') {
				redirectTo = '/student'
			} else if (user?.role === 'employee') {
				redirectTo = '/employee'
			}

			throw redirect({
				to: redirectTo,
			})
		}

		console.log('🟢 Доступ разрешен к:', currentPath)
	},
})
