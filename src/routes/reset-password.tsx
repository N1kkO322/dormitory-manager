import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { UniversalModal } from '../components/UniversalModal'
import api from '../lib/api'

export const Route = createFileRoute('/reset-password')({
	validateSearch: (search: Record<string, unknown>) => ({
		token: typeof search.token === 'string' ? search.token : '',
	}),
	component: RouteComponent,
})

function RouteComponent() {
	const { token } = Route.useSearch()
	const navigate = useNavigate()

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [message, setMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccessModalOpened, setIsSuccessModalOpened] = useState(false)
	const isTokenMissing = !token

	const navigateToLogin = () => {
		navigate({ to: '/auth/login' })
	}

	const handlePasswordResetConfirm = async (e: { preventDefault(): void }) => {
		e.preventDefault()
		setMessage('')
		setErrorMessage('')

		if (isTokenMissing) {
			setErrorMessage('Ссылка для восстановления недействительна')
			return
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage('Пароли не совпадают')
			return
		}

		setIsSubmitting(true)

		try {
			const response = await api.post('/api/auth/password-reset/confirm', {
				token,
				new_password: newPassword,
			})

			setMessage(response.data.message)
			setNewPassword('')
			setConfirmPassword('')
			setIsSuccessModalOpened(true)
		} catch (error: unknown) {
			const message = isAxiosError<{ detail?: string }>(error)
				? error.response?.data?.detail || 'Не удалось изменить пароль'
				: 'Не удалось изменить пароль'
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
					onSubmit={handlePasswordResetConfirm}
					className='auth-card'
				>
					<h1>Новый пароль</h1>
					<p
						style={{
							letterSpacing: '1px',
							margin: '12px 0px',
							fontSize: '20px',
							fontWeight: '300',
						}}
					>
						Введите новый пароль для входа в профиль
					</p>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
							width: '100%',
						}}
					>
						<div className='auth-password-field'>
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder='Новый пароль'
								className='auth-inputs auth-password-input'
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								required
								disabled={isTokenMissing || Boolean(message)}
							/>
							<button
								type='button'
								className='auth-password-toggle'
								aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
								aria-pressed={showPassword}
								title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
								onClick={() => setShowPassword(value => !value)}
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
						<div className='auth-password-field'>
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder='Повторите пароль'
								className='auth-inputs auth-password-input'
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								required
								disabled={isTokenMissing || Boolean(message)}
							/>
							<button
								type='button'
								className='auth-password-toggle'
								aria-label={
									showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'
								}
								aria-pressed={showConfirmPassword}
								title={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
								onClick={() => setShowConfirmPassword(value => !value)}
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{isTokenMissing && (
						<p className='auth-message auth-message-error'>
							Ссылка для восстановления недействительна
						</p>
					)}
					{message && (
						<p className='auth-message auth-message-success'>{message}</p>
					)}
					{errorMessage && (
						<p className='auth-message auth-message-error'>{errorMessage}</p>
					)}

					<button
						type='submit'
						className='auth-btns'
						disabled={isSubmitting || isTokenMissing || Boolean(message)}
					>
						{isSubmitting ? 'Сохраняем...' : 'Сохранить пароль'}
					</button>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: '20px',
							letterSpacing: '1px',
						}}
					>
						<Link to='/auth/login' style={{ color: '#6060f0' }}>
							Перейти ко входу
						</Link>
					</div>
				</form>
			</div>
			<UniversalModal
				opened={isSuccessModalOpened}
				onClose={navigateToLogin}
				title='Пароль изменен'
				message={message || 'Пароль успешно изменен'}
				icon={<CheckCircle size={48} color='#1d7a39' />}
				actions={[
					{
						label: 'ОК',
						onClick: navigateToLogin,
					},
				]}
				withCloseButton={false}
				closeOnClickOutside={false}
			/>
		</>
	)
}
