import emailjs from '@emailjs/browser'
import { Modal, Select, Textarea } from '@mantine/core'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { auth } from '../lib/auth'

type ReportMachineModalProps = {
	opened: boolean
	onClose: () => void
}

type Machine = {
	id: number
	name: string
}

export function ReportMachineModal({
	opened,
	onClose,
}: ReportMachineModalProps) {
	const [submitting, setSubmitting] = useState(false)
	const [description, setDescription] = useState('')
	const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
	const [machines, setMachines] = useState<Machine[]>([])
	const [error, setError] = useState(false)

	const user = auth.getUser()

	useEffect(() => {
		if (opened) {
			api.get('/api/machines/').then(res => {
				setMachines(res.data)
			})
		}
	}, [opened])

	const handleClose = () => {
		setDescription('')
		setSelectedMachine(null)
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

		const machineName =
			machines.find(m => m.id === Number(selectedMachine))?.name || 'Не указана'

		try {
			await emailjs.send(
				'service_clzsnlq',
				'template_u2oo4la',
				{
					userName:
						`${user?.surname || ''} ${user?.name || ''} ${user?.middle_name || ''}`.trim(),
					userRole: user?.role === 'student' ? 'Студент' : 'Сотрудник',
					machineName: machineName,
					description: description,
				},
				'B52GJ6Syb6iu22gEZ',
			)

			alert('Заявка принята. Спасибо за обратную связь!')
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
							marginBottom: '8px',
							fontWeight: '500',
						}}
					>
						Выберите машину
					</label>
					<Select
						value={selectedMachine}
						onChange={setSelectedMachine}
						data={machines.map(m => ({
							value: String(m.id),
							label: m.name,
						}))}
						placeholder='Выберите машину'
						styles={{
							input: {
								fontSize: '16px',
								borderRadius: '12px',
								border: '1px solid #D3E4FE',
							},
						}}
						style={{ width: '100%' }}
					/>
				</div>

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
						value={description}
						onChange={e => {
							setDescription(e.target.value)
							if (error) setError(false)
						}}
						required
						rows={9}
						placeholder='Пожалуйста, подробно опишите возникшую проблему'
						error={error ? 'Поле не может быть пустым' : false}
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
