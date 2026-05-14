import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { User } from '../../lib/auth'
import { auth } from '../../lib/auth'

export const Route = createFileRoute('/auth/login')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault()
		if (email == 'q' && password == 'q') {
			const adminUser: User = {
				id: 'admin-1',
				email: 'admin@dorm.ru',
				role: 'employee',
				isAdmin: true,
				name: 'Администратор',
			}
			// const studentUser: User = {
			// 	id: 'student-1',
			// 	email: 'student@dorm.ru',
			// 	role: 'student',
			// 	isAdmin: false,
			// 	name: 'Глеб',
			// }
			auth.login('admin-token', adminUser)
			// auth.login('admin-token', studentUser)
			navigate({ to: '/announcements' })
		} else {
			alert('Неверный email или пароль')
		}
	}
	return (
		<>
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					margin: '0 auto',
					width: '100dvw',
				}}
			>
				<form
					onSubmit={handleLogin}
					style={{
						backgroundColor: '#fff',
						borderRadius: '32px',
						padding: '56px',
						width: '30dvw',
						// width: '60%', Laptop
						// width: '90%', Mobile
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: '24px',
						boxShadow: '#c3c3c3 0px 0px 20px 1px',
					}}
				>
					<h1>С возвращением!</h1>
					<p
						style={{
							letterSpacing: '1px',
							margin: '12px 0px',
							fontSize: '20px',
							fontWeight: '300',
						}}
					>
						Вход в профиль
					</p>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
							width: '100%',
						}}
					>
						<input
							type='text'
							placeholder='Электронная почта'
							className='auth-inputs'
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
						<input
							type='text'
							placeholder='Пароль'
							className='auth-inputs'
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					</div>

					<button type='submit' className='auth-btns'>
						Войти
					</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '16px',
							letterSpacing: '1px',
						}}
					>
						<Link to='/auth/forgotpass' style={{ color: '#6060f0' }}>
							Не помню пароль
						</Link>
					</div>
				</form>
			</div>
		</>
	)
}
