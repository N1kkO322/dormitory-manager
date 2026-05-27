import emailjs from '@emailjs/browser'
import { Modal, Textarea } from '@mantine/core'
import { useState } from 'react'
import { auth } from '../lib/auth'

type ReportIncorrectModalProps = {
	opened: boolean
	onClose: () => void
}

export function ReportIncorrectModal({
	opened,
	onClose,
}: ReportIncorrectModalProps) {
	const [submitting, setSubmitting] = useState(false)
	const [description, setDescription] = useState('')
	const [error, setError] = useState(false)

	const user = auth.getUser()

	const handleClose = () => {
		setDescription('')
		setError(false)
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!description.trim()) {
			setError(true)
			return
		}

		setSubmitting(true)

		try {
			await emailjs.send(
				'service_clzsnlq',
				'template_xeq7lcn',
				{
					userName:
						`${user?.surname || ''} ${user?.name || ''} ${user?.middle_name || ''}`.trim(),
					userRole: user?.role === 'student' ? 'Студент' : 'Сотрудник',
					description: description,
				},
				'B52GJ6Syb6iu22gEZ',
			)

			alert('Сообщение отправлено! Спасибо за обратную связь.')
			handleClose()
		} catch (err) {
			console.error('Ошибка:', err)
			alert('Не удалось отправить сообщение')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title='Сообщить о некорректности'
			size='xl'
			centered
			radius='16px'
			padding='28px'
			styles={{
				title: {
					fontWeight: 'bold',
					fontSize: '24px',
				},
			}}
		>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '20px' }}>
					<label
						style={{
							display: 'block',
							marginBottom: '24px',
							fontWeight: '500',
						}}
					>
						Опишите, какая информация некорректна
					</label>
					<Textarea
						value={description}
						onChange={e => {
							setDescription(e.target.value)
							if (error) setError(false)
						}}
						required
						rows={6}
						placeholder='Например: неверный номер комнаты'
						error={error ? 'Поле не может быть пустым' : false}
						styles={{
							input: {
								fontSize: '16px',
							},
						}}
						style={{
							width: '100%',
							borderRadius: '12px',
							resize: 'vertical',
						}}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						gap: '12px',
						justifyContent: 'space-between',
						marginTop: '48px',
					}}
				>
					<button
						type='button'
						onClick={handleClose}
						style={{
							padding: '12px 24px',
							borderRadius: '12px',
							border: '1px solid #D3E4FE',
							backgroundColor: 'transparent',
							color: '#454652',
							cursor: 'pointer',
							fontSize: '14px',
							width: '45%',
						}}
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={submitting}
						style={{
							padding: '12px 24px',
							borderRadius: '12px',
							border: 'none',
							backgroundColor: '#6060f0',
							color: 'white',
							cursor: 'pointer',
							fontSize: '14px',
							opacity: submitting ? 0.7 : 1,
							width: '45%',
						}}
					>
						{submitting ? 'Отправка...' : 'Отправить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
