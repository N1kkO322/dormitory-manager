import { Modal, Textarea } from '@mantine/core'
import { useState } from 'react'

type ReportIncorrectModalProps = {
	opened: boolean
	onClose: () => void
	infoType?: string // Например: 'дежурство', 'комната', 'телефон' и т.д.
}

export function ReportIncorrectModal({
	opened,
	onClose,
	infoType = 'информации',
}: ReportIncorrectModalProps) {
	const [submitting, setSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		description: '',
		isUrgent: false,
	})

	const [errors, setErrors] = useState({
		description: false,
	})

	const handleClose = () => {
		setFormData({ description: '', isUrgent: false })
		setErrors({ description: false })
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.description.trim()) {
			setErrors({ description: true })
			return
		}

		setSubmitting(true)

		// Имитация отправки
		setTimeout(() => {
			console.log('Сообщение о некорректности:', {
				infoType,
				description: formData.description,
				isUrgent: formData.isUrgent,
				date: new Date().toLocaleString('ru-RU'),
			})

			alert(
				'Сообщение отправлено! Спасибо за обратную связь. Мы проверим информацию.',
			)

			handleClose()
			setSubmitting(false)
		}, 1000)
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
						value={formData.description}
						onChange={e => {
							setFormData({ ...formData, description: e.target.value })
							if (errors.description) {
								setErrors({ description: false })
							}
						}}
						required
						rows={6}
						placeholder='Например: неверный номер комнаты'
						error={errors.description ? 'Поле не может быть пустым' : false}
						styles={{
							input: {
								fontSize: '16px',
							},
						}}
						style={{
							width: '100%',
							borderRadius: '12px',
							// fontSize: '14px',
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
