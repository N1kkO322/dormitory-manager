import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/forgotpass')({
	component: RouteComponent,
})

function RouteComponent() {
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
						borderRadius: '32px',
						padding: '56px',
						width: '30dvw',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: '24px',
						boxShadow: '#c3c3c3 0px 0px 20px 1px',
					}}
				>
					<h1>Восстановление пароля</h1>
					<p
						style={{
							letterSpacing: '1px',
							margin: '12px 0px',
							fontSize: '20px',
							fontWeight: '300',
						}}
					>
						Введите адрес электронной почты, для получения ссылки на
						восстановление пароля
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
					</div>

					<button className='auth-btns'>Отправить</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '20px',
							letterSpacing: '1px',
						}}
					>
						Всомнили пароль?
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
