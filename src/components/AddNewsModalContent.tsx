import { Checkbox, Input, Select, Textarea } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

type AddNewsModalContentProps = {
	onSuccess: () => void
	onClose: () => void
}

const fileInputStyle = {
	width: '100%',
	border: '1px solid #D3E4FE',
	borderRadius: '12px',
	padding: '12px 14px',
	fontSize: '14px',
	color: '#0B1C30',
	outline: 'none',
	backgroundColor: '#fff',
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
		image: null as File | null,
	})

	const [, setErrors] = useState({ title: false })

	const imagePreview = useMemo(() => {
		if (!formData.image) return null
		return URL.createObjectURL(formData.image)
	}, [formData.image])

	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview)
		}
	}, [imagePreview])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!formData.title.trim()) {
			setErrors({ title: true })
			return
		}

		setSubmitting(true)

		try {
			const data = new FormData()
			data.append('type', formData.type)
			data.append('title', formData.title)
			data.append('content', formData.content)
			data.append('priority', formData.priority)
			if (formData.image) {
				data.append('image', formData.image)
			}

			await api.post('/api/news/', data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			onSuccess()
			onClose()
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
						onChange={value => setFormData({ ...formData, type: value || '' })}
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
							size='md'
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
					Изображение (необязательно)
				</label>
				{imagePreview && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: '10px',
							border: '1px solid #D3E4FE',
							borderRadius: '12px',
							backgroundColor: '#fff',
							marginBottom: '8px',
						}}
					>
						<img
							src={imagePreview}
							alt='Предпросмотр'
							style={{
								width: '72px',
								height: '72px',
								borderRadius: '8px',
								objectFit: 'cover',
								flex: '0 0 72px',
							}}
						/>
						<div style={{ color: '#454652', fontSize: '13px' }}>
							{formData.image?.name}
						</div>
					</div>
				)}
				<input
					key={formData.image?.name || 'empty-image'}
					type='file'
					accept='image/*'
					onChange={e =>
						setFormData({ ...formData, image: e.target.files?.[0] || null })
					}
					style={fileInputStyle}
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
