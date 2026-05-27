import { createFileRoute, Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import api from '../../lib/api'

export const Route = createFileRoute('/auth/forgotpass')({
	component: RouteComponent,
})

function RouteComponent() {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handlePasswordResetRequest = async (e: { preventDefault(): void }) => {
		e.preventDefault()
		setMessage('')
		setErrorMessage('')
		setIsSubmitting(true)

		try {
			const response = await api.post('/api/auth/password-reset/request', {
				email: email.trim(),
			})

			setMessage(response.data.message)
		} catch (error: unknown) {
			const message = isAxiosError<{ detail?: string }>(error)
				? error.response?.data?.detail || 'Не удалось отправить письмо'
				: 'Не удалось отправить письмо'
			setErrorMessage(message)
		} finally {
			setIsSubmitting(false)
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
					width: '100%',
				}}
			>
				<form
					onSubmit={handlePasswordResetRequest}
					className='auth-card'
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
							type='email'
							placeholder='Электронная почта'
							className='auth-inputs'
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							disabled={isSubmitting}
						/>
					</div>

					{message && (
						<p className='auth-message auth-message-success'>{message}</p>
					)}
					{errorMessage && (
						<p className='auth-message auth-message-error'>{errorMessage}</p>
					)}

					<button type='submit' className='auth-btns' disabled={isSubmitting}>
						{isSubmitting ? 'Отправляем...' : 'Отправить'}
					</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '20px',
							letterSpacing: '1px',
						}}
					>
						Вспомнили пароль?
						<Link
							to='/auth/login'
							style={{ color: '#6060f0', marginLeft: '8px' }}
						>
							Войти
						</Link>
					</div>
				</form>
			</div>
		</>
	)
}
