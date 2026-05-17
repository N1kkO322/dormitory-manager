import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
	useMatchRoute,
	useRouter,
} from '@tanstack/react-router'
import {
	Building2,
	CalendarCheck,
	LogOut,
	Rss,
	User,
	WashingMachine,
} from 'lucide-react'
import { auth } from '../lib/auth'

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
	beforeLoad: () => {
		if (!auth.isAuthenticated()) {
			throw redirect({ to: '/auth/login' })
		}
	},
})

function AuthenticatedLayout() {
	const router = useRouter()
	const matchRoute = useMatchRoute()

	const handleLogout = () => {
		auth.logout()
		router.navigate({ to: '/auth/login' })
	}

	const menuItems = [
		{ to: '/washing', icon: WashingMachine, label: 'Стиральные машины' },
		{ to: '/announcements', icon: Rss, label: 'Лента новостей' },
		{ to: '/duties', icon: CalendarCheck, label: 'Дежурства' },
		{ to: '/profile', icon: User, label: 'Профиль' },
	]

	return (
		<div style={{ display: 'flex' }}>
			<aside
				style={{
					display: 'flex',
					width: 260,
					background: '#EFF4FF',
					minHeight: '100vh',
					borderRight: '1px solid #C5C5D4',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '20px 0',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: '12px',
							padding: '0 20px',
							marginBottom: '32px',
						}}
					>
						<div
							style={{
								padding: '10px 10px 6px 10px',
								justifyContent: 'center',
								backgroundColor: '#6060f0',
								borderRadius: '8px',
								boxShadow: '#00000040 0px 4px 4px 0px',
							}}
						>
							<Building2 color='#fff' />
						</div>
						<Link
							to='/'
							style={{
								color: '#6060f0',
								textDecoration: 'none',
								fontWeight: 'bold',
								fontSize: '28px',
							}}
						>
							DorMan
						</Link>
					</div>

					<nav
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
						}}
					>
						{menuItems.map(item => {
							const isActive = matchRoute({ to: item.to })

							return (
								<Link
									key={item.to}
									to={item.to}
									activeProps={{
										style: {
											borderRight: '4px solid #6060f0',
											color: '#6060f0',
											fontWeight: 700,
										},
									}}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
										padding: '20px 20px',
										borderRadius: '0',
										textDecoration: 'none',
										color: '#2C3E50',
										fontSize: '16px',
										fontWeight: 400,
										transition: 'background 0.2s',
									}}
								>
									<item.icon
										size={20}
										color={isActive ? '#6060f0' : '#2C3E50'}
										strokeWidth={3}
									/>
									{item.label}
								</Link>
							)
						})}
					</nav>
				</div>

				<div style={{ padding: '0 20px', borderTop: '1px solid #C5C5D4' }}>
					<button
						onClick={handleLogout}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: '40px 0px 20px 0px',
							borderRadius: '8px',
							border: 'none',
							background: 'transparent',
							color: '#454652',
							fontSize: '16px',
							fontWeight: 400,
							cursor: 'pointer',
							width: '100%',
							transition: 'background 0.2s',
						}}
					>
						<LogOut size={20} />
						Выход
					</button>
				</div>
			</aside>
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
		</div>
	)
}
