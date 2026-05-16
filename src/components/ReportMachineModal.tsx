// components/ReportProblemModal.tsx
import { Modal, Textarea } from '@mantine/core'
import { useState } from 'react'

type ReportMachineModalProps = {
	opened: boolean
	onClose: () => void
}

export function ReportMachineModal({
	opened,
	onClose,
}: ReportMachineModalProps) {
	const [submitting, setSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		description: '',
		isActive: false,
	})

	const [errors, setErrors] = useState({
		description: false,
	})

	const handleClose = () => {
		setFormData({ description: '', isActive: false })
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

		setTimeout(() => {
			console.log('Сообщение о проблеме:', {
				description: formData.description,
				isActive: formData.isActive,
				date: new Date().toLocaleString('ru-RU'),
			})

			alert('Заявка принята')

			onClose()
			setFormData({ description: '', isActive: false })
			setErrors({ description: false })
			setSubmitting(false)
		}, 1000)
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Сообщить о проблеме'
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
							marginBottom: '20px',
							fontWeight: '500',
						}}
					>
						Опишите проблему
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
						rows={9}
						placeholder='Пожалуйста, подробно опишите возникшую проблему'
						error={errors.description ? 'Поле не может быть пустым' : false}
						styles={{
							input: {
								fontSize: '16px',
							},
						}}
						style={{
							width: '100%',
							borderRadius: '12px',
							fontSize: '14px',
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
