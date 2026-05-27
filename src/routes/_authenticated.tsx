import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useMatchRoute,
	useRouter,
} from '@tanstack/react-router'
import {
	AlertCircle,
	Building2,
	CalendarCheck,
	LogOut,
	Menu,
	Rss,
	User,
	Users,
	WashingMachine,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import api from '../lib/api'
import { auth } from '../lib/auth'
import type { User as UserType } from '../lib/auth'

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
	const [todayDuty, setTodayDuty] = useState<UserType | null>(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const isMobile = useMediaQuery('(max-width: 768px)') ?? false

	const currentUser = auth.getUser()
	const isEmployee = currentUser?.role === 'employee'
	const isMyDutyToday = todayDuty?.id === currentUser?.id

	useEffect(() => {
		api.get('/api/users/').then(response => {
			const data = Array.isArray(response.data)
				? response.data
				: response.data?.results ?? []
			const students = data.filter(
				(u: UserType) => u.role === 'student',
			)
			if (students.length === 0) return

			const twoRoom = students.filter((s: UserType) => s.room_type === 2)
			const threeRoom = students.filter((s: UserType) => s.room_type === 3)

			const sortFn = (a: UserType, b: UserType) => {
				const blockA = parseInt(a.block || '0')
				const blockB = parseInt(b.block || '0')
				if (blockA !== blockB) return blockA - blockB
				return (a.room || '').localeCompare(b.room || '')
			}

			twoRoom.sort(sortFn)
			threeRoom.sort(sortFn)

			const queue = [...twoRoom, ...threeRoom]
			const today = new Date()
			const startOfYear = new Date(today.getFullYear(), 0, 0)
			const dayOfYear = Math.floor(
				(today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
			)
			const index = dayOfYear % queue.length

			setTodayDuty(queue[index])
		})
	}, [])

	useEffect(() => {
		setMenuOpen(false)
	}, [router.state.location.pathname])

	const handleLogout = () => {
		auth.logout()
		router.navigate({ to: '/auth/login' })
	}

	const menuItems = [
		{ to: '/washing', icon: WashingMachine, label: 'Стиральные машины' },
		{ to: '/announcements', icon: Rss, label: 'Лента новостей' },
		...(isEmployee
			? [{ to: '/users', icon: Users, label: 'Студенты и персонал' }]
			: []),
		{ to: '/duties', icon: CalendarCheck, label: 'Дежурства' },
		{ to: '/profile', icon: User, label: 'Профиль' },
	]

	const navLinks = (
		<nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			{menuItems.map(item => {
				const isActive = matchRoute({ to: item.to })
				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={() => setMenuOpen(false)}
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
	)

	const dutySection = todayDuty && (isEmployee || isMyDutyToday) && (
		<div
			style={{
				padding: '12px 16px',
				margin: '0 16px 40px 16px',
				borderRadius: '12px',
				backgroundColor: isEmployee
					? '#E5EEFF'
					: isMyDutyToday
						? '#FFE5E5'
						: '#F8F9FF',
				border: isEmployee
					? '1px solid #D3E4FE'
					: isMyDutyToday
						? '2px solid #e74c3c'
						: '1px solid #D3E4FE',
			}}
		>
			{isEmployee ? (
				<div>
					<div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
						Сегодня дежурит
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						{todayDuty.photo ? (
							<img
								src={todayDuty.photo}
								alt=''
								style={{
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									objectFit: 'cover',
								}}
							/>
						) : (
							<User />
						)}
						<div>
							<div style={{ fontSize: '13px', fontWeight: '600', color: '#0B1C30' }}>
								{todayDuty.name} {todayDuty.surname}
							</div>
							<div style={{ fontSize: '11px', color: '#666' }}>
								Блок {todayDuty.block} ({todayDuty.room_type})
							</div>
						</div>
					</div>
				</div>
			) : isMyDutyToday ? (
				<div
					style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c' }}
				>
					<AlertCircle size={16} />
					<span style={{ fontSize: '13px', fontWeight: '600' }}>
						Сегодня ваше дежурство
					</span>
				</div>
			) : null}
		</div>
	)

	const logoutBtn = (
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
	)

	const sidebarTopContent = (
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
					onClick={() => setMenuOpen(false)}
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
			{navLinks}
		</div>
	)

	const sidebarBottomContent = (
		<div>
			{dutySection}
			{logoutBtn}
		</div>
	)

	if (isMobile) {
		return (
			<div style={{ minHeight: '100dvh', background: '#f8f9ff' }}>
				<header
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						height: 60,
						background: '#EFF4FF',
						borderBottom: '1px solid #C5C5D4',
						zIndex: 100,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 20px',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<div
							style={{
								padding: '7px 7px 3px 7px',
								backgroundColor: '#6060f0',
								borderRadius: '8px',
								boxShadow: '#00000040 0px 2px 4px 0px',
							}}
						>
							<Building2 color='#fff' size={18} />
						</div>
						<span style={{ color: '#6060f0', fontWeight: 'bold', fontSize: '22px' }}>
							DorMan
						</span>
					</div>

					{todayDuty && (isEmployee || isMyDutyToday) && (
						<div
							style={{
								position: 'absolute',
								left: '50%',
								transform: 'translateX(-50%)',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								backgroundColor: isMyDutyToday ? '#FFE5E5' : '#E5EEFF',
								border: `1px solid ${isMyDutyToday ? '#e74c3c' : '#D3E4FE'}`,
								borderRadius: '20px',
								padding: '4px 10px 4px 8px',
								whiteSpace: 'nowrap',
							}}
						>
							<AlertCircle
								size={15}
								color={isMyDutyToday ? '#e74c3c' : '#6060f0'}
							/>
							<span
								style={{
									fontSize: '12px',
									fontWeight: '600',
									color: isMyDutyToday ? '#e74c3c' : '#6060f0',
								}}
							>
								{isMyDutyToday
									? 'Ваше дежурство'
									: `${todayDuty.name} ${todayDuty.surname}`}
							</span>
						</div>
					)}

					<button
						onClick={() => setMenuOpen(prev => !prev)}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: '8px',
							color: '#6060f0',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						{menuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</header>

				{menuOpen && (
					<div
						onClick={() => setMenuOpen(false)}
						style={{
							position: 'fixed',
							inset: 0,
							background: 'rgba(0,0,0,0.4)',
							zIndex: 200,
						}}
					/>
				)}

				<aside
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: 280,
						height: '100vh',
						background: '#EFF4FF',
						borderRight: '1px solid #C5C5D4',
						zIndex: 300,
						transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
						transition: 'transform 0.3s ease',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						padding: '20px 0',
						overflowY: 'auto',
					}}
				>
					{sidebarTopContent}
					{sidebarBottomContent}
				</aside>

				<main style={{ paddingTop: 60 }}>
					<Outlet />
				</main>
			</div>
		)
	}

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
				{sidebarTopContent}
				{sidebarBottomContent}
			</aside>
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
		</div>
	)
}
