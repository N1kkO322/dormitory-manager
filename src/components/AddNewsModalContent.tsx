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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
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

			console.log('Новость добавлена:', response.data)

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
			alert('Не удалось добавить новость. Проверьте соединение с интернетом.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<div style={{ marginBottom: '16px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					Тип новости
				</label>
				<select
					value={formData.type}
					onChange={e => setFormData({ ...formData, type: e.target.value })}
					style={{
						width: '100%',
						padding: '12px',
						borderRadius: '12px',
						border: '1px solid #D3E4FE',
						fontSize: '14px',
					}}
				>
					<option value='Уведомление'>Уведомление</option>
					<option value='Событие'>Событие</option>
				</select>
			</div>

			<div style={{ marginBottom: '16px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					Заголовок
				</label>
				<input
					type='text'
					value={formData.title}
					onChange={e => setFormData({ ...formData, title: e.target.value })}
					required
					style={{
						width: '100%',
						padding: '12px',
						borderRadius: '12px',
						border: '1px solid #D3E4FE',
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
				<textarea
					value={formData.content}
					onChange={e => setFormData({ ...formData, content: e.target.value })}
					required
					rows={6}
					style={{
						width: '100%',
						padding: '12px',
						borderRadius: '12px',
						border: '1px solid #D3E4FE',
						fontSize: '14px',
						resize: 'vertical',
					}}
				/>
			</div>

			<div style={{ marginBottom: '16px' }}>
				<label
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						cursor: 'pointer',
					}}
				>
					<span style={{ fontWeight: '500' }}>Высокий приоритет</span>
					<input
						type='checkbox'
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
							cursor: 'pointer',
							accentColor: '#e74c3c',
						}}
					/>
				</label>
			</div>

			<div style={{ marginBottom: '24px' }}>
				<label
					style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
				>
					URL картинки (необязательно)
				</label>
				<input
					type='text'
					value={formData.imageUrl}
					onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
					placeholder='https://example.com/image.jpg'
					style={{
						width: '100%',
						padding: '12px',
						borderRadius: '12px',
						border: '1px solid #D3E4FE',
						fontSize: '14px',
					}}
				/>
			</div>

			<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
					}}
				>
					{submitting ? 'Добавление...' : 'Добавить'}
				</button>
			</div>
		</form>
	)
}
