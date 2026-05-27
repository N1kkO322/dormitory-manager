import { Modal } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { UserPlus } from 'lucide-react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useState } from 'react'

type PeopleRole = 'student' | 'employee'

export type CreateUserPayload = {
	email: string
	password: string
	role: PeopleRole
	surname: string
	name: string
	middle_name: string
	phone: string
	photo: File | null
	group: string
	floor: number
	wing: string
	block: string
	room_type: number
	emergency_contact: {
		name: string
		phone: string
		relation: string
	}
}

type NewUserForm = {
	email: string
	password: string
	role: PeopleRole
	surname: string
	name: string
	middle_name: string
	phone: string
	photo: File | null
	group: string
	floor: string
	wing: string
	block: string
	room_type: string
	emergency_contact_name: string
	emergency_contact_phone: string
	emergency_contact_relation: string
}

type AddUserModalProps = {
	opened: boolean
	onClose: () => void
	onSubmit: (payload: CreateUserPayload) => Promise<void>
	submitting: boolean
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

const emptyForm: NewUserForm = {
	email: '',
	password: '',
	role: 'student',
	surname: '',
	name: '',
	middle_name: '',
	phone: '',
	photo: null,
	group: '',
	floor: '',
	wing: 'male',
	block: '',
	room_type: '3',
	emergency_contact_name: '',
	emergency_contact_phone: '',
	emergency_contact_relation: '',
}

function toOptionalNumber(value: string) {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function FormSection({
	title,
	columns,
	mobileColumns,
	isMobile,
	children,
}: {
	title: string
	columns: string
	mobileColumns?: string
	isMobile: boolean
	children: ReactNode
}) {
	const effectiveColumns = isMobile ? (mobileColumns ?? '1fr') : columns

	return (
		<section style={sectionStyle}>
			<h3 style={sectionTitleStyle}>{title}</h3>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: effectiveColumns,
					gap: '14px',
					alignItems: 'end',
				}}
			>
				{children}
			</div>
		</section>
	)
}

export function AddUserModal({
	opened,
	onClose,
	onSubmit,
	submitting,
}: AddUserModalProps) {
	const [form, setForm] = useState<NewUserForm>(emptyForm)
	const isMobile = useMediaQuery('(max-width: 768px)') ?? false

	const handleClose = () => {
		setForm(emptyForm)
		onClose()
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			await onSubmit({
				email: form.email.trim(),
				password: form.password,
				role: form.role,
				surname: form.surname.trim(),
				name: form.name.trim(),
				middle_name: form.middle_name.trim(),
				phone: form.phone.trim(),
				photo: form.photo,
				group: form.role === 'student' ? form.group.trim() : '',
				floor: form.role === 'student' ? toOptionalNumber(form.floor) : 0,
				wing: form.role === 'student' ? form.wing : '',
				block: form.role === 'student' ? form.block.trim() : '',
				room_type:
					form.role === 'student' ? toOptionalNumber(form.room_type) : 0,
				emergency_contact: {
					name:
						form.role === 'student'
							? form.emergency_contact_name.trim()
							: '',
					phone:
						form.role === 'student'
							? form.emergency_contact_phone.trim()
							: '',
					relation:
						form.role === 'student'
							? form.emergency_contact_relation.trim()
							: '',
				},
			})
			setForm(emptyForm)
		} catch {
			// Parent component owns the visible error state.
		}
	}

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title='Добавить пользователя'
			size={isMobile ? '95%' : '70%'}
			centered
			radius='16px'
			padding={isMobile ? '16px' : '28px'}
			styles={{ title: { fontWeight: 700, fontSize: isMobile ? '20px' : '24px' } }}
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
						gridTemplateColumns: isMobile ? '1fr' : 'minmax(360px, 0.7fr) minmax(280px, 0.3fr)',
						gap: '16px',
					}}
				>
					<FormSection
						title='Доступ'
						columns='220px minmax(220px, 1fr)'
						mobileColumns='1fr 1fr'
						isMobile={isMobile}
					>
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
						<label style={formLabelStyle}>
							Пароль
							<input
								required
								type='password'
								value={form.password}
								onChange={event =>
									setForm(prev => ({ ...prev, password: event.target.value }))
								}
								style={inputStyle}
							/>
						</label>
					</FormSection>

					<FormSection
						title='Фото'
						columns='minmax(220px, 1fr)'
						isMobile={isMobile}
					>
						<label style={formLabelStyle}>
							Фото
							<input
								key={form.photo?.name || 'empty-photo'}
								type='file'
								accept='image/*'
								onChange={event =>
									setForm(prev => ({
										...prev,
										photo: event.target.files?.[0] || null,
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
					</FormSection>
				</div>

				<FormSection
					title='ФИО'
					columns='repeat(3, minmax(180px, 1fr))'
					mobileColumns='1fr'
					isMobile={isMobile}
				>
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

				<FormSection
					title='Контакты'
					columns='minmax(260px, 1fr) minmax(220px, 320px)'
					mobileColumns='1fr'
					isMobile={isMobile}
				>
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
							mobileColumns='1fr 1fr'
							isMobile={isMobile}
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
							mobileColumns='1fr'
							isMobile={isMobile}
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
						onClick={handleClose}
						disabled={submitting}
						style={{
							flex: isMobile ? 1 : undefined,
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
							flex: isMobile ? 1 : undefined,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
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
						<UserPlus size={18} />
						{submitting ? 'Добавление...' : 'Добавить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
