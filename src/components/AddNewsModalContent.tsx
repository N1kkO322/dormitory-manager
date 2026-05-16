import { Checkbox, Input, Select, Textarea } from '@mantine/core'
import axios from 'axios'
import { useState } from 'react'

type AddNewsModalContentProps = {
	onSuccess: () => void
	onClose: () => void
}

export function AddNewsModalContent({
	onSuccess,
	onClose,
}: AddNewsModalContentProps) {
	const [submitting, setSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		type: 'Уведомление',
		title: '',
		content: '',
		priority: 'medium',
		author: 'Администрация',
		imageUrl: '',
	})

	const [errors, setErrors] = useState({ title: false })

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title.trim()) {
			setErrors({
				title: !formData.title.trim(),
			})
			return
		}

		setSubmitting(true)

		try {
			const response = await axios.post(
				'https://f3b0cd06c4aa4730.mokky.dev/news',
				{
					type: formData.type,
					title: formData.title,
					content: formData.content,
					priority: formData.priority,
					author: formData.author,
					imageUrl: formData.imageUrl || null,
					created: new Date().toLocaleString('ru-RU', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					}),
				},
			)

			onSuccess()
			onClose()

			setFormData({
				type: 'Уведомление',
				title: '',
				content: '',
				priority: 'medium',
				author: 'Администрация',
				imageUrl: '',
			})
		} catch (err) {
			console.error('Ошибка при добавлении новости:', err)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<div
				style={{
					display: 'block',
					marginBottom: '8px',
					fontWeight: '500',
					width: '100%',
				}}
			>
				Тип новости
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					width: '100%',
					alignItems: 'center',
				}}
			>
				<div style={{ width: '45%' }}>
					<Select
						value={formData.type}
						onChange={value => setFormData({ ...formData, type: value })}
						data={[
							{ value: 'Уведомление', label: 'Уведомление' },
							{ value: 'Событие', label: 'Событие' },
						]}
						styles={{
							input: {
								width: '100%',
								padding: '4px',
								paddingLeft: '12px',
								borderRadius: '12px',
								border: '1px solid #D3E4FE',
								fontSize: '14px',
								height: 'auto',
							},
						}}
					/>
				</div>
				<div style={{ width: '45%' }}>
					<label
						style={{
							display: 'flex',
							alignItems: 'flex-start',
							gap: '16px',
							cursor: 'pointer',
							alignContent: 'center',
						}}
					>
						<Checkbox
							size={24}
							checked={formData.priority === 'high'}
							onChange={e => {
								setFormData({
									...formData,
									priority: e.target.checked ? 'high' : 'medium',
								})
							}}
							style={{
								width: '18px',
								height: '18px',
								// cursor: 'pointer',
							}}
						/>
						<span style={{ fontWeight: '500' }}>Высокий приоритет</span>
					</label>
				</div>
			</div>

			<div style={{ marginBottom: '16px', marginTop: '16px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					Заголовок
				</label>
				<Input
					value={formData.title}
					onChange={e => setFormData({ ...formData, title: e.target.value })}
					required
					style={{
						width: '100%',
						borderRadius: '12px',
						fontSize: '14px',
					}}
				/>
			</div>

			<div style={{ marginBottom: '16px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					Содержание
				</label>
				<Textarea
					value={formData.content}
					onChange={e => setFormData({ ...formData, content: e.target.value })}
					required
					rows={9}
					style={{
						width: '100%',
						borderRadius: '12px',
						fontSize: '14px',
						resize: 'vertical',
					}}
				/>
			</div>

			<div style={{ marginBottom: '24px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					URL картинки (необязательно)
				</label>
				<Input
					value={formData.imageUrl}
					onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
					placeholder='https://example.com/image.jpg'
					style={{
						width: '100%',
						borderRadius: '12px',
						fontSize: '14px',
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
					onClick={onClose}
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
					{submitting ? 'Добавление...' : 'Добавить'}
				</button>
			</div>
		</form>
	)
}
