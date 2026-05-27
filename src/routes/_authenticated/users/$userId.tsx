import { Modal } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
	AlertCircle,
	DoorOpen,
	GraduationCap,
	Mail,
	Phone,
	SquarePen,
	Trash2,
	User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
	EditUserModal,
	type UpdateUserPayload,
} from '../../../components/EditUserModal'
import { UniversalModal } from '../../../components/UniversalModal'
import api from '../../../lib/api'
import { auth } from '../../../lib/auth'

type PeopleRole = 'student' | 'employee'

type PeopleUser = {
	id: number
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

type ApiErrorResponse = {
	response?: {
		data?: {
			detail?: string
		}
	}
}

export const Route = createFileRoute('/_authenticated/users/$userId')({
	beforeLoad: () => {
		if (!auth.isEmployee()) {
			throw redirect({ to: '/announcements' })
		}
	},
	component: RouteComponent,
})

function normalizeRole(role: string): PeopleRole {
	return role === 'employee' ? 'employee' : 'student'
}

function formatPhone(phone: string | null | undefined) {
	if (!phone) return 'Не указан'

	let digits = phone.replace(/\D/g, '')

	if (digits.startsWith('8')) {
		digits = '7' + digits.slice(1)
	}

	if (digits.length === 11) {
		return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
	}

	return phone
}

function getFullName(user: PeopleUser) {
	return [user.surname, user.name, user.middle_name].filter(Boolean).join(' ')
}

function normalizeUser(user: PeopleUser): PeopleUser {
	return {
		...user,
		role: normalizeRole(user.role),
	}
}

function getUpdateUserErrorMessage(error: unknown) {
	const detail = (error as ApiErrorResponse).response?.data?.detail

	if (detail?.trim()) {
		return detail
	}

	return 'Не удалось сохранить изменения'
}

function appendFormDataValue(formData: FormData, key: string, value: string | number) {
	formData.append(key, String(value))
}

function buildUpdateUserFormData(payload: UpdateUserPayload) {
	const formData = new FormData()

	appendFormDataValue(formData, 'email', payload.email)
	appendFormDataValue(formData, 'type', payload.type)
	appendFormDataValue(formData, 'surname', payload.surname)
	appendFormDataValue(formData, 'name', payload.name)
	appendFormDataValue(formData, 'middle_name', payload.middle_name)
	appendFormDataValue(formData, 'phone', payload.phone)

	if (payload.photo instanceof File) {
		formData.append('photo', payload.photo)
	} else if (payload.photo === null) {
		formData.append('photo', 'null')
	}

	if (payload.group !== undefined) {
		appendFormDataValue(formData, 'group', payload.group)
	}
	if (payload.floor !== undefined) {
		appendFormDataValue(formData, 'floor', payload.floor)
	}
	if (payload.wing !== undefined) {
		appendFormDataValue(formData, 'wing', payload.wing)
	}
	if (payload.block !== undefined) {
		appendFormDataValue(formData, 'block', payload.block)
	}
	if (payload.room_type !== undefined) {
		appendFormDataValue(formData, 'room_type', payload.room_type)
	}
	if (payload.emergency_contact) {
		formData.append('emergency_contact', JSON.stringify(payload.emergency_contact))
	}

	return formData
}

function RouteComponent() {
	const { userId } = Route.useParams()
	const router = useRouter()
	const [user, setUser] = useState<PeopleUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deleteError, setDeleteError] = useState<string | null>(null)
	const [deleting, setDeleting] = useState(false)
	const [editError, setEditError] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false)
	const [deleteOpened, { open: openDelete, close: closeDelete }] =
		useDisclosure(false)
	const isMobile = useMediaQuery('(max-width: 768px)') ?? false

	useEffect(() => {
		setLoading(true)
		setError(null)

		api
			.get<PeopleUser>(`/api/users/${userId}`)
			.then(response => {
				setUser(normalizeUser(response.data))
			})
			.catch(requestError => {
				console.error('Ошибка загрузки профиля пользователя:', requestError)
				setError('Не удалось загрузить профиль пользователя')
			})
			.finally(() => setLoading(false))
	}, [userId])

	const handleDelete = async () => {
		if (!user) return

		setDeleting(true)
		setDeleteError(null)

		try {
			await api.delete(`/api/users/${user.id}`)
			closeDelete()
			router.navigate({ to: '/users' })
		} catch (requestError) {
			console.error('Ошибка удаления пользователя:', requestError)
			setDeleteError('Не удалось удалить пользователя')
		} finally {
			setDeleting(false)
		}
	}

	const handleUpdate = async (payload: UpdateUserPayload) => {
		if (!user) return

		setSaving(true)
		setEditError(null)

		try {
			const response = await api.patch<PeopleUser>(
				`/api/users/${user.id}`,
				buildUpdateUserFormData(payload),
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				},
			)
			setUser(normalizeUser(response.data))
			closeEdit()
		} catch (requestError) {
			console.error('Ошибка редактирования пользователя:', requestError)
			setEditError(getUpdateUserErrorMessage(requestError))
			throw requestError
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100dvh',
				}}
			>
				<div className='load'></div>
			</div>
		)
	}

	if (error || !user) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100dvh',
					color: '#e74c3c',
					fontSize: '18px',
				}}
			>
				{error || 'Пользователь не найден'}
			</div>
		)
	}

	const isStudent = user.role === 'student'

	const actionButtons = (
		<div
			style={{
				width: isMobile ? '100%' : '30%',
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
			}}
		>
			<button
				type='button'
				onClick={openEdit}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					width: '100%',
					padding: '14px 16px',
					backgroundColor: '#E5EEFF',
					border: 'none',
					borderRadius: '20px',
					color: '#6060f0',
					fontSize: '15px',
					fontWeight: '600',
					cursor: 'pointer',
				}}
			>
				<SquarePen size={18} />
				Редактировать
			</button>
			<button
				type='button'
				onClick={() => router.navigate({ to: '/users' })}
				style={{
					width: '100%',
					padding: '14px 16px',
					backgroundColor: '#6060f0',
					border: 'none',
					borderRadius: '20px',
					color: '#fff',
					fontSize: '15px',
					fontWeight: '500',
					cursor: 'pointer',
				}}
			>
				Вернуться к списку
			</button>
			<button
				type='button'
				onClick={openDelete}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					width: '100%',
					padding: '14px 16px',
					backgroundColor: '#FFE5E5',
					border: 'none',
					borderRadius: '20px',
					color: '#e74c3c',
					fontSize: '15px',
					fontWeight: '600',
					cursor: 'pointer',
				}}
			>
				<Trash2 size={18} />
				Удалить пользователя
			</button>
		</div>
	)

	return (
		<>
			<EditUserModal
				opened={editOpened}
				onClose={closeEdit}
				onSubmit={handleUpdate}
				submitting={saving}
				user={user}
			/>

			<UniversalModal
				opened={Boolean(editError)}
				onClose={() => setEditError(null)}
				title='Ошибка редактирования пользователя'
				message={editError || undefined}
				icon={<AlertCircle size={48} color='#e74c3c' />}
				actions={[
					{
						label: 'ОК',
						onClick: () => setEditError(null),
						variant: 'primary',
					},
				]}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title='Удалить пользователя?'
				size='md'
				centered
				radius='16px'
				padding='28px'
				styles={{ title: { fontWeight: 700, fontSize: '22px' } }}
			>
				<div style={{ color: '#454652', lineHeight: 1.5 }}>
					Пользователь {getFullName(user)} будет удален из системы.
				</div>
				{deleteError && (
					<div style={{ marginTop: '16px', color: '#e74c3c', fontSize: '14px' }}>
						{deleteError}
					</div>
				)}
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '12px',
						marginTop: '28px',
					}}
				>
					<button
						type='button'
						onClick={closeDelete}
						disabled={deleting}
						style={{
							padding: '12px 20px',
							borderRadius: '12px',
							border: '1px solid #D3E4FE',
							backgroundColor: 'transparent',
							color: '#454652',
							cursor: deleting ? 'not-allowed' : 'pointer',
							fontSize: '14px',
							fontWeight: 500,
						}}
					>
						Отмена
					</button>
					<button
						type='button'
						onClick={handleDelete}
						disabled={deleting}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '12px 20px',
							borderRadius: '12px',
							border: 'none',
							backgroundColor: '#e74c3c',
							color: '#fff',
							cursor: deleting ? 'not-allowed' : 'pointer',
							fontSize: '14px',
							fontWeight: 500,
							opacity: deleting ? 0.7 : 1,
						}}
					>
						<Trash2 size={18} />
						{deleting ? 'Удаление...' : 'Удалить'}
					</button>
				</div>
			</Modal>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
					height: isMobile ? 'auto' : '12dvh',
					padding: isMobile ? '20px 16px 12px' : '0 48px',
				}}
			>
				<h2 style={{ color: '#6060f0' }}>Профиль пользователя</h2>
				<p style={{ color: '#454652', marginTop: isMobile ? '4px' : undefined }}>
					Личная информация пользователя
				</p>
			</div>

			<div
				style={{
					height: isMobile ? 'auto' : '88dvh',
					padding: isMobile ? '8px 16px 24px' : '16px 48px',
					display: 'flex',
					flexDirection: isMobile ? 'column' : 'row',
					justifyContent: 'space-between',
					gap: '24px',
				}}
			>
				{/* Кнопки действий — сверху на мобильном */}
				{isMobile && actionButtons}

				<div style={{ flex: '1 1 0%', width: '100%' }}>
					{/* Карточка с основной информацией */}
					<div
						style={{
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: isMobile ? '20px' : '32px',
							boxShadow: '#24389c14 0px 4px 12px',
							marginBottom: '24px',
							display: 'flex',
							flexDirection: isMobile ? 'column' : 'row',
							width: '100%',
							alignItems: isMobile ? 'center' : 'flex-start',
						}}
					>
						{/* Фото */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: isMobile ? '100%' : '20%',
								paddingRight: isMobile ? '0' : '32px',
								paddingBottom: isMobile ? '20px' : '0',
							}}
						>
							{user.photo ? (
								<img
									src={user.photo}
									alt='Фото профиля'
									style={{
										width: isMobile ? '110px' : '140px',
										height: isMobile ? '110px' : '140px',
										borderRadius: '50%',
										objectFit: 'cover',
									}}
								/>
							) : (
								<div
									style={{
										width: isMobile ? '110px' : '140px',
										height: isMobile ? '110px' : '140px',
										borderRadius: '50%',
										backgroundColor: '#E5EEFF',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<User size={isMobile ? 48 : 60} color='#6060f0' />
								</div>
							)}
						</div>

						{/* Имя + поля */}
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '20px',
								width: '100%',
							}}
						>
							<div style={{ textAlign: isMobile ? 'center' : 'left' }}>
								<h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600' }}>
									{getFullName(user)}
								</h2>
								<p style={{ color: '#6060f0', marginTop: '4px' }}>
									{isStudent ? 'Студент' : 'Сотрудник'}
								</p>
							</div>

							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '12px',
									width: '100%',
								}}
							>
								{isStudent && (
									<InfoCard icon={<DoorOpen size={24} color='#006C49' />} label='Блок'>
										{user.block || '-'} ({user.room_type || '-'})
									</InfoCard>
								)}
								<InfoCard icon={<Mail size={24} color='#24389C' />} label='Почта'>
									{user.email}
								</InfoCard>
								<InfoCard icon={<Phone size={24} color='#24389C' />} label='Телефон'>
									{formatPhone(user.phone)}
								</InfoCard>
								{isStudent && (
									<InfoCard
										icon={<GraduationCap size={24} color='#603B00' />}
										label='Группа'
									>
										{user.group || 'Не указана'}
									</InfoCard>
								)}
							</div>
						</div>
					</div>

					{/* Экстренный контакт */}
					{isStudent && (
						<div
							style={{
								backgroundColor: '#fff',
								borderRadius: '24px',
								border: '1px solid #D3E4FE',
								padding: isMobile ? '20px' : '32px',
								boxShadow: '#24389c14 0px 4px 12px',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									marginBottom: '20px',
								}}
							>
								<AlertCircle size={24} color='#e74c3c' />
								<h3 style={{ margin: 0, color: '#e74c3c' }}>
									Экстренный контакт
								</h3>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '12px',
								}}
							>
								<div>
									<div style={{ fontSize: '12px', color: '#666' }}>ФИО</div>
									<div style={{ fontWeight: '500' }}>
										{user.emergency_contact_name || 'Не указан'}
									</div>
								</div>
								<div>
									<div style={{ fontSize: '12px', color: '#666' }}>
										Кем приходится
									</div>
									<div style={{ fontWeight: '500' }}>
										{user.emergency_contact_relation || 'Не указано'}
									</div>
								</div>
								<div>
									<div style={{ fontSize: '12px', color: '#666' }}>
										Телефон
									</div>
									<div style={{ fontWeight: '500' }}>
										{formatPhone(user.emergency_contact_phone)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Кнопки действий — справа на десктопе */}
				{!isMobile && actionButtons}
			</div>
		</>
	)
}

function InfoCard({
	icon,
	label,
	children,
}: {
	icon: ReactNode
	label: string
	children: ReactNode
}) {
	return (
		<div
			style={{
				backgroundColor: '#F8F9FF',
				width: '100%',
				borderRadius: '12px',
			}}
		>
			<div style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
				<div
					style={{
						padding: '10px',
						backgroundColor: '#dee0ff81',
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					{icon}
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						minWidth: 0,
					}}
				>
					<div style={{ color: '#454652', fontSize: '13px' }}>{label}</div>
					<div style={{ fontWeight: '600', fontSize: '16px', overflowWrap: 'anywhere' }}>
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}
