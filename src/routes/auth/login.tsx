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

		const studentUser: User = {
			id: 1,
			email: 'gleb.nikolaev.1980@mail.ru',
			role: 'student',
			surname: 'Николаев',
			name: 'Глеб',
			middleName: 'Сергеевич',
			phone: '89115704580',
			block: '801',
			emergencyContact: {
				name: 'Екатерина Червонцева',
				phone: '89114902370',
				relation: 'Мама',
			},
			floor: 8,
			wing: 'male',
			group: 'ИСТ-212',
			photo:
				'https://i.pinimg.com/736x/fd/92/b2/fd92b2cd01e556e9463db5f378264c01.jpg',
			room: '901',
		}

		const adminUser: User = {
			id: 2,
			email: 'administratorDorm@mail.ru',
			role: 'employee',
			surname: 'Петровна',
			name: 'Анна',
			middleName: 'Олеговная',
			phone: '89113698721',
		}

		if (email === 's' && password === 's') {
			auth.login('token', studentUser)
			navigate({ to: '/announcements' })
			console.log('Студент вошёл:', studentUser)
		} else if (email === 'a' && password === 'a') {
			auth.login('token', adminUser)
			navigate({ to: '/announcements' })
			console.log('Админ вошёл:', adminUser)
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
