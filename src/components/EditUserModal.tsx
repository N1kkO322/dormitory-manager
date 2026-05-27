import { Modal } from '@mantine/core'
import { Save } from 'lucide-react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

type PeopleRole = 'student' | 'employee'

export type EditableUser = {
	email: string
	role: PeopleRole
	surname: string
	name: string
	middle_name?: string | null
	phone?: string | null
	photo?: string | null
	group?: string | null
	floor?: number | null
	wing?: string | null
	block?: string | null
	room_type?: number | null
	emergency_contact_name?: string | null
	emergency_contact_phone?: string | null
	emergency_contact_relation?: string | null
}

export type UpdateUserPayload = {
	email: string
	type: PeopleRole
	surname: string
	name: string
	middle_name: string
	phone: string
	photo?: File | null
	group?: string
	floor?: number
	wing?: string
	block?: string
	room_type?: number
	emergency_contact?: {
		name: string
		phone: string
		relation: string
	}
}

type UserForm = {
	email: string
	role: PeopleRole
	surname: string
	name: string
	middle_name: string
	phone: string
	photo: File | null
	removePhoto: boolean
	group: string
	floor: string
	wing: string
	block: string
	room_type: string
	emergency_contact_name: string
	emergency_contact_phone: string
	emergency_contact_relation: string
}

type EditUserModalProps = {
	opened: boolean
	onClose: () => void
	onSubmit: (payload: UpdateUserPayload) => Promise<void>
	submitting: boolean
	user: EditableUser
}

const inputStyle: CSSProperties = {
	width: '100%',
	border: '1px solid #D3E4FE',
	borderRadius: '12px',
	padding: '12px 14px',
	fontSize: '14px',
	color: '#0B1C30',
	outline: 'none',
	backgroundColor: '#fff',
}

const formLabelStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
	color: '#454652',
	fontSize: '13px',
	fontWeight: 500,
	textAlign: 'left',
}

const sectionStyle: CSSProperties = {
	gridColumn: '1 / -1',
	display: 'flex',
	flexDirection: 'column',
	gap: '14px',
	padding: '18px',
	border: '1px solid #D3E4FE',
	borderRadius: '16px',
	backgroundColor: '#F8F9FF',
}

const sectionTitleStyle: CSSProperties = {
	color: '#0B1C30',
	fontSize: '16px',
	fontWeight: 700,
}

function toOptionalNumber(value: string) {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function getInitialForm(user: EditableUser): UserForm {
	return {
		email: user.email || '',
		role: user.role,
		surname: user.surname || '',
		name: user.name || '',
		middle_name: user.middle_name || '',
		phone: user.phone || '',
		photo: null,
		removePhoto: false,
		group: user.group || '',
		floor: user.floor ? String(user.floor) : '',
		wing: user.wing || 'male',
		block: user.block || '',
		room_type: user.room_type ? String(user.room_type) : '3',
		emergency_contact_name: user.emergency_contact_name || '',
		emergency_contact_phone: user.emergency_contact_phone || '',
		emergency_contact_relation: user.emergency_contact_relation || '',
	}
}

function FormSection({
	title,
	columns,
	children,
}: {
	title: string
	columns: string
	children: ReactNode
}) {
	return (
		<section style={sectionStyle}>
			<h3 style={sectionTitleStyle}>{title}</h3>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: columns,
					gap: '14px',
					alignItems: 'end',
				}}
			>
				{children}
			</div>
		</section>
	)
}

export function EditUserModal({
	opened,
	onClose,
	onSubmit,
	submitting,
	user,
}: EditUserModalProps) {
	const [form, setForm] = useState<UserForm>(() => getInitialForm(user))
	const selectedPhotoPreview = useMemo(() => {
		if (!form.photo) return null

		return URL.createObjectURL(form.photo)
	}, [form.photo])

	useEffect(() => {
		return () => {
			if (selectedPhotoPreview) {
				URL.revokeObjectURL(selectedPhotoPreview)
			}
		}
	}, [selectedPhotoPreview])

	useEffect(() => {
		if (opened) {
			setForm(getInitialForm(user))
		}
	}, [opened, user])

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const payload: UpdateUserPayload = {
			email: form.email.trim(),
			type: form.role,
			surname: form.surname.trim(),
			name: form.name.trim(),
			middle_name: form.middle_name.trim(),
			phone: form.phone.trim(),
			photo: form.removePhoto ? null : form.photo || undefined,
		}

		if (form.role === 'student') {
			payload.group = form.group.trim()
			payload.floor = toOptionalNumber(form.floor)
			payload.wing = form.wing
			payload.block = form.block.trim()
			payload.room_type = toOptionalNumber(form.room_type)
			payload.emergency_contact = {
				name: form.emergency_contact_name.trim(),
				phone: form.emergency_contact_phone.trim(),
				relation: form.emergency_contact_relation.trim(),
			}
		}

		try {
			await onSubmit(payload)
		} catch {
			// Parent component owns the visible error state.
		}
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Редактировать пользователя'
			size='70%'
			centered
			radius='16px'
			padding='28px'
			styles={{ title: { fontWeight: 700, fontSize: '24px' } }}
		>
			<form
				onSubmit={handleSubmit}
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr',
					gap: '16px',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'minmax(360px, 0.7fr) minmax(280px, 0.3fr)',
						gap: '16px',
					}}
				>
					<FormSection title='Доступ' columns='220px'>
						<label style={formLabelStyle}>
							Роль
							<select
								value={form.role}
								onChange={event =>
									setForm(prev => ({
										...prev,
										role: event.target.value as PeopleRole,
									}))
								}
								style={inputStyle}
							>
								<option value='student'>Студент</option>
								<option value='employee'>Сотрудник</option>
							</select>
						</label>
					</FormSection>

					<FormSection title='Фото' columns='minmax(220px, 1fr)'>
						{!form.removePhoto && (selectedPhotoPreview || user.photo) && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									padding: '10px',
									border: '1px solid #D3E4FE',
									borderRadius: '12px',
									backgroundColor: '#fff',
								}}
							>
								<img
									src={selectedPhotoPreview || user.photo || ''}
									alt='Фото пользователя'
									style={{
										width: '72px',
										height: '72px',
										borderRadius: '50%',
										objectFit: 'cover',
										flex: '0 0 72px',
									}}
								/>
								<div style={{ color: '#454652', fontSize: '13px' }}>
									{selectedPhotoPreview ? 'Новое фото' : 'Текущее фото'}
								</div>
							</div>
						)}
						<label style={formLabelStyle}>
							Фото
							<input
								key={form.photo?.name || (form.removePhoto ? 'removed-photo' : 'empty-photo')}
								type='file'
								accept='image/*'
								onChange={event =>
									setForm(prev => ({
										...prev,
										photo: event.target.files?.[0] || null,
										removePhoto: false,
									}))
								}
								style={inputStyle}
							/>
						</label>
						{form.photo && (
							<div style={{ color: '#454652', fontSize: '13px' }}>
								Выбран файл: {form.photo.name}
							</div>
						)}
						{user.photo && !form.photo && !form.removePhoto && (
							<button
								type='button'
								onClick={() =>
									setForm(prev => ({
										...prev,
										photo: null,
										removePhoto: true,
									}))
								}
								style={{
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
								Удалить фото
							</button>
						)}
						{form.removePhoto && (
							<div style={{ color: '#e74c3c', fontSize: '13px' }}>
								Фото будет удалено после сохранения
							</div>
						)}
					</FormSection>
				</div>

				<FormSection title='ФИО' columns='repeat(3, minmax(180px, 1fr))'>
					<label style={formLabelStyle}>
						Фамилия
						<input
							required
							value={form.surname}
							onChange={event =>
								setForm(prev => ({ ...prev, surname: event.target.value }))
							}
							style={inputStyle}
						/>
					</label>
					<label style={formLabelStyle}>
						Имя
						<input
							required
							value={form.name}
							onChange={event =>
								setForm(prev => ({ ...prev, name: event.target.value }))
							}
							style={inputStyle}
						/>
					</label>
					<label style={formLabelStyle}>
						Отчество
						<input
							value={form.middle_name}
							onChange={event =>
								setForm(prev => ({ ...prev, middle_name: event.target.value }))
							}
							style={inputStyle}
						/>
					</label>
				</FormSection>

				<FormSection title='Контакты' columns='minmax(260px, 1fr) minmax(220px, 320px)'>
					<label style={formLabelStyle}>
						Почта
						<input
							required
							type='email'
							value={form.email}
							onChange={event =>
								setForm(prev => ({ ...prev, email: event.target.value }))
							}
							style={inputStyle}
						/>
					</label>
					<label style={formLabelStyle}>
						Телефон
						<input
							required
							value={form.phone}
							onChange={event =>
								setForm(prev => ({ ...prev, phone: event.target.value }))
							}
							style={inputStyle}
						/>
					</label>
				</FormSection>

				{form.role === 'student' && (
					<>
						<FormSection
							title='Размещение'
							columns='minmax(160px, 220px) 90px 150px 110px 150px'
						>
							<label style={formLabelStyle}>
								Группа
								<input
									value={form.group}
									onChange={event =>
										setForm(prev => ({ ...prev, group: event.target.value }))
									}
									style={inputStyle}
								/>
							</label>
							<label style={formLabelStyle}>
								Этаж
								<input
									type='number'
									value={form.floor}
									onChange={event =>
										setForm(prev => ({ ...prev, floor: event.target.value }))
									}
									style={inputStyle}
								/>
							</label>
							<label style={formLabelStyle}>
								Крыло
								<select
									value={form.wing}
									onChange={event =>
										setForm(prev => ({ ...prev, wing: event.target.value }))
									}
									style={inputStyle}
								>
									<option value='male'>Мужское</option>
									<option value='female'>Женское</option>
								</select>
							</label>
							<label style={formLabelStyle}>
								Блок
								<input
									maxLength={3}
									value={form.block}
									onChange={event =>
										setForm(prev => ({ ...prev, block: event.target.value }))
									}
									style={inputStyle}
								/>
							</label>
							<label style={formLabelStyle}>
								Тип комнаты
								<select
									value={form.room_type}
									onChange={event =>
										setForm(prev => ({
											...prev,
											room_type: event.target.value,
										}))
									}
									style={inputStyle}
								>
									<option value='2'>2 человека</option>
									<option value='3'>3 человека</option>
								</select>
							</label>
						</FormSection>

						<FormSection
							title='Экстренный контакт'
							columns='minmax(240px, 1fr) minmax(220px, 280px) minmax(180px, 240px)'
						>
							<label style={formLabelStyle}>
								ФИО экстренного контакта
								<input
									value={form.emergency_contact_name}
									onChange={event =>
										setForm(prev => ({
											...prev,
											emergency_contact_name: event.target.value,
										}))
									}
									style={inputStyle}
								/>
							</label>
							<label style={formLabelStyle}>
								Телефон экстренного контакта
								<input
									value={form.emergency_contact_phone}
									onChange={event =>
										setForm(prev => ({
											...prev,
											emergency_contact_phone: event.target.value,
										}))
									}
									style={inputStyle}
								/>
							</label>
							<label style={formLabelStyle}>
								Кем приходится
								<input
									value={form.emergency_contact_relation}
									onChange={event =>
										setForm(prev => ({
											...prev,
											emergency_contact_relation: event.target.value,
										}))
									}
									style={inputStyle}
								/>
							</label>
						</FormSection>
					</>
				)}

				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '12px',
						marginTop: '8px',
					}}
				>
					<button
						type='button'
						onClick={onClose}
						disabled={submitting}
						style={{
							padding: '12px 20px',
							borderRadius: '12px',
							border: '1px solid #D3E4FE',
							backgroundColor: 'transparent',
							color: '#454652',
							cursor: submitting ? 'not-allowed' : 'pointer',
							fontSize: '14px',
							fontWeight: 500,
							opacity: submitting ? 0.7 : 1,
						}}
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={submitting}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '12px 20px',
							borderRadius: '12px',
							border: 'none',
							backgroundColor: '#6060f0',
							color: '#fff',
							cursor: submitting ? 'not-allowed' : 'pointer',
							fontSize: '14px',
							fontWeight: 500,
							opacity: submitting ? 0.7 : 1,
						}}
					>
						<Save size={18} />
						{submitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
