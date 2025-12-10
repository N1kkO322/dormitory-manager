import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { auth } from '../../lib/auth'

export const Route = createFileRoute('/auth/login')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	const handleLogin = () => {
		const testUser = {
			id: '1',
			email: 'test@mail.com',
			fullName: 'Тест Пользователь',
			role: 'student' as const,
		}

		auth.login('test-jwt-token', testUser)

		console.log('✅ Login выполнен!')
		console.log('auth.isAuthenticated():', auth.isAuthenticated())
		console.log('auth.getUser():', auth.getUser())

		navigate({ to: '/' })
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
					width: '100%',
				}}
			>
				<div
					style={{
						backgroundColor: '#fff',
						borderRadius: '56px',
						padding: '56px',
						width: '30dvw',
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
						/>
						<input type='text' placeholder='Пароль' className='auth-inputs' />
					</div>
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

					<button className='auth-btns' onClick={handleLogin}>
						Войти
					</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '20px',
							letterSpacing: '1px',
						}}
					>
						Нет аккаунта?
						<Link
							to='/auth/register'
							style={{ color: '#6060f0', marginLeft: '8px' }}
						>
							Зарегистрироваться
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}
