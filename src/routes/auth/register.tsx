import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { auth } from '../../lib/auth'

export const Route = createFileRoute('/auth/register')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()

	const handleRegister = () => {
		const testUser = {
			id: '2',
			email: 'newuser@mail.com',
			fullName: 'Новый Пользователь',
			role: 'student' as const,
		}

		auth.register('new-jwt-token', testUser)

		console.log('✅ Регистрация выполнена!')
		console.log('Пользователь:', auth.getUser())

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
					<h1>Добро пожаловать!</h1>
					<p
						style={{
							letterSpacing: '1px',
							margin: '12px 0px',
							fontSize: '20px',
							fontWeight: '300',
						}}
					>
						Регистрация
					</p>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
							width: '100%',
						}}
					>
						<input type='text' placeholder='Имя' className='auth-inputs' />
						<input
							type='text'
							placeholder='Электронная почта'
							className='auth-inputs'
						/>
						<input type='text' placeholder='Пароль' className='auth-inputs' />
					</div>
					<button className='auth-btns' onClick={handleRegister}>
						Создать аккаунт
					</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '20px',
							letterSpacing: '1px',
						}}
					>
						Есть аккаунт?
						<Link
							to='/auth/login'
							style={{ color: '#6060f0', marginLeft: '8px' }}
						>
							Войти
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}
