import { Checkbox, Input, Modal, Select, Textarea } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useUniversalAlert } from './useUniversalAlert'

type EditNewsModalProps = {
	opened: boolean
	onClose: () => void
	onSuccess: () => void
	news: NewsItem | null
}

type NewsItem = {
	id: number
	type: string
	title: string
	content: string
	priority: string
	author: string
	created: string
	image_url?: string
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

export function EditNewsModal({
	opened,
	onClose,
	onSuccess,
	news,
}: EditNewsModalProps) {
	const [submitting, setSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		type: 'Уведомление',
		title: '',
		content: '',
		priority: 'medium',
		author: 'Администрация',
		image: null as File | null,
		removeImage: false,
	})
	const { alertModal, openAlert } = useUniversalAlert()

	const imagePreview = useMemo(() => {
		if (!formData.image) return null
		return URL.createObjectURL(formData.image)
	}, [formData.image])

	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview)
		}
	}, [imagePreview])

	useEffect(() => {
		if (news) {
			setFormData({
				type: news.type,
				title: news.title,
				content: news.content,
				priority: news.priority,
				author: news.author,
				image: null,
				removeImage: false,
			})
		}
	}, [news])

	const handleSubmit = async (e: { preventDefault(): void }) => {
		e.preventDefault()
		if (!news) return

		setSubmitting(true)

		try {
			const data = new FormData()
			data.append('type', formData.type)
			data.append('title', formData.title)
			data.append('content', formData.content)
			data.append('priority', formData.priority)
			if (formData.image) {
				data.append('image', formData.image)
			} else if (formData.removeImage) {
				data.append('image', 'null')
			}

			await api.patch(`/api/news/${news.id}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			onSuccess()
			onClose()
		} catch (error) {
			console.error('Ошибка при редактировании:', error)
			openAlert('Не удалось обновить новость', { variant: 'error' })
		} finally {
			setSubmitting(false)
		}
	}

	const currentImageUrl = !formData.removeImage
		? (imagePreview || news?.image_url || null)
		: null

	return (
		<>
			<Modal
				opened={opened}
				onClose={onClose}
				title='Редактирование новости'
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
							onChange={value =>
								setFormData({ ...formData, type: value || '' })
							}
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
						onChange={e =>
							setFormData({ ...formData, content: e.target.value })
						}
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
					{currentImageUrl && (
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
								src={currentImageUrl}
								alt='Изображение новости'
								style={{
									width: '72px',
									height: '72px',
									borderRadius: '8px',
									objectFit: 'cover',
									flex: '0 0 72px',
								}}
							/>
							<div style={{ color: '#454652', fontSize: '13px' }}>
								{imagePreview ? formData.image?.name : 'Текущее изображение'}
							</div>
						</div>
					)}
					<input
						key={formData.image?.name || (formData.removeImage ? 'removed-image' : 'empty-image')}
						type='file'
						accept='image/*'
						onChange={e =>
							setFormData({
								...formData,
								image: e.target.files?.[0] || null,
								removeImage: false,
							})
						}
						style={fileInputStyle}
					/>
					{news?.image_url && !formData.image && !formData.removeImage && (
						<button
							type='button'
							onClick={() =>
								setFormData(prev => ({
									...prev,
									image: null,
									removeImage: true,
								}))
							}
							style={{
								marginTop: '8px',
								width: 'fit-content',
								padding: '10px 14px',
								border: 'none',
								borderRadius: '10px',
								backgroundColor: '#FFE5E5',
								color: '#e74c3c',
								cursor: 'pointer',
								fontSize: '13px',
								fontWeight: 600,
							}}
						>
							Удалить изображение
						</button>
					)}
					{formData.removeImage && (
						<div style={{ marginTop: '8px', color: '#e74c3c', fontSize: '13px' }}>
							Изображение будет удалено после сохранения
						</div>
					)}
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
						{submitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
				</form>
			</Modal>
			{alertModal}
		</>
	)
}
