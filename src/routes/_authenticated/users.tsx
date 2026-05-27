import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
	Outlet,
	createFileRoute,
	redirect,
	useLocation,
	useRouter,
} from '@tanstack/react-router'
import {
	AlertCircle,
	DoorOpen,
	GraduationCap,
	Mail,
	Phone,
	Plus,
	Search,
	User,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
	AddUserModal,
	type CreateUserPayload,
} from '../../components/AddUserModal'
import { UniversalModal } from '../../components/UniversalModal'
import api from '../../lib/api'
import { auth } from '../../lib/auth'

type PeopleRole = 'student' | 'employee'
type RoleFilter = 'all' | PeopleRole

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
	is_active?: boolean
	created_at?: string
}

type ApiErrorResponse = {
	response?: {
		data?: {
			detail?: string
		}
	}
}

const roleLabels: Record<PeopleRole, string> = {
	student: 'Студент',
	employee: 'Сотрудник',
}

const roleBadgeStyles: Record<PeopleRole, CSSProperties> = {
	student: {
		backgroundColor: '#E5EEFF',
		color: '#24389C',
	},
	employee: {
		backgroundColor: '#6cf8bb48',
		color: '#006C49',
	},
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

export const Route = createFileRoute('/_authenticated/users')({
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

function normalizeUser(user: PeopleUser): PeopleUser {
	return {
		...user,
		role: normalizeRole(user.role),
	}
}

function getFullName(user: PeopleUser) {
	return [user.surname, user.name, user.middle_name].filter(Boolean).join(' ')
}

function getInitials(user: PeopleUser) {
	return `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase()
}

function getCreateUserErrorMessage(error: unknown) {
	const detail = (error as ApiErrorResponse).response?.data?.detail

	if (detail?.trim()) {
		return detail
	}

	return 'Не удалось добавить пользователя'
}

function appendFormDataValue(formData: FormData, key: string, value: string | number) {
	formData.append(key, String(value))
}

function buildCreateUserFormData(payload: CreateUserPayload) {
	const formData = new FormData()

	appendFormDataValue(formData, 'email', payload.email)
	appendFormDataValue(formData, 'password', payload.password)
	appendFormDataValue(formData, 'role', payload.role)
	appendFormDataValue(formData, 'surname', payload.surname)
	appendFormDataValue(formData, 'name', payload.name)
	appendFormDataValue(formData, 'middle_name', payload.middle_name)
	appendFormDataValue(formData, 'phone', payload.phone)

	if (payload.photo) {
		formData.append('photo', payload.photo)
	}

	appendFormDataValue(formData, 'group', payload.group)
	appendFormDataValue(formData, 'floor', payload.floor)
	appendFormDataValue(formData, 'wing', payload.wing)
	appendFormDataValue(formData, 'block', payload.block)
	appendFormDataValue(formData, 'room_type', payload.room_type)
	formData.append('emergency_contact', JSON.stringify(payload.emergency_contact))

	return formData
}

function RouteComponent() {
	const router = useRouter()
	const location = useLocation()
	const [users, setUsers] = useState<PeopleUser[]>([])
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
	const [selectedUser, setSelectedUser] = useState<PeopleUser | null>(null)
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
	const [loading, setLoading] = useState(true)
	const [detailsLoading, setDetailsLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [createUserError, setCreateUserError] = useState<string | null>(null)
	const [opened, { open, close }] = useDisclosure(false)
	const isMobile = useMediaQuery('(max-width: 768px)') ?? false

	const loadUsers = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const trimmedSearch = search.trim()
			const params: Record<string, string | number> = {
				limit: 500,
				offset: 0,
			}

			if (roleFilter !== 'all') {
				params.role = roleFilter
			}

			const response = trimmedSearch
				? await api.get<PeopleUser[]>('/api/users/search', {
						params: { q: trimmedSearch, role: params.role },
					})
				: await api.get<PeopleUser[]>('/api/users/', { params })

			const normalizedUsers = response.data.map(normalizeUser)
			const visibleUsers =
				trimmedSearch && roleFilter !== 'all'
					? normalizedUsers.filter(user => user.role === roleFilter)
					: normalizedUsers

			setUsers(visibleUsers)
			setSelectedUserId(currentId => {
				if (visibleUsers.some(user => user.id === currentId)) {
					return currentId
				}

				return visibleUsers[0]?.id ?? null
			})
		} catch (requestError) {
			console.error('Ошибка загрузки пользователей:', requestError)
			setError('Не удалось загрузить пользователей')
			setUsers([])
			setSelectedUserId(null)
			setSelectedUser(null)
		} finally {
			setLoading(false)
		}
	}, [roleFilter, search])

	useEffect(() => {
		if (location.pathname !== '/users') return

		const timer = window.setTimeout(loadUsers, 300)
		return () => window.clearTimeout(timer)
	}, [loadUsers, location.pathname])

	useEffect(() => {
		if (!selectedUserId) {
			setSelectedUser(null)
			return
		}

		let cancelled = false
		setDetailsLoading(true)

		api
			.get<PeopleUser>(`/api/users/${selectedUserId}`)
			.then(response => {
				if (!cancelled) {
					setSelectedUser(normalizeUser(response.data))
				}
			})
			.catch(requestError => {
				console.error('Ошибка загрузки профиля пользователя:', requestError)
				if (!cancelled) {
					setSelectedUser(
						users.find(user => user.id === selectedUserId) ?? null,
					)
				}
			})
			.finally(() => {
				if (!cancelled) {
					setDetailsLoading(false)
				}
			})

		return () => {
			cancelled = true
		}
	}, [selectedUserId, users])

	const handleCloseAddModal = () => {
		close()
	}

	const handleCreateUser = async (payload: CreateUserPayload) => {
		setSubmitting(true)
		setCreateUserError(null)

		try {
			const response = await api.post<PeopleUser>(
				'/api/users/',
				buildCreateUserFormData(payload),
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				},
			)
			const createdUser = normalizeUser(response.data)

			setUsers(prev => [createdUser, ...prev])
			setSelectedUserId(createdUser.id)
			setSelectedUser(createdUser)
			handleCloseAddModal()
			await loadUsers()
		} catch (requestError) {
			console.error('Ошибка добавления пользователя:', requestError)
			setCreateUserError(getCreateUserErrorMessage(requestError))
			throw requestError
		} finally {
			setSubmitting(false)
		}
	}

	const openUserProfile = (userId: number) => {
		router.navigate({
			to: '/users/$userId',
			params: { userId: String(userId) },
		})
	}

	if (location.pathname.startsWith('/users/')) {
		return <Outlet />
	}

	return (
		<>
			<AddUserModal
				opened={opened}
				onClose={handleCloseAddModal}
				onSubmit={handleCreateUser}
				submitting={submitting}
			/>

			<UniversalModal
				opened={Boolean(createUserError)}
				onClose={() => setCreateUserError(null)}
				title='Ошибка добавления пользователя'
				message={createUserError || undefined}
				icon={<AlertCircle size={48} color='#e74c3c' />}
				actions={[
					{
						label: 'ОК',
						onClick: () => setCreateUserError(null),
						variant: 'primary',
					},
				]}
			/>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
					height: isMobile ? 'auto' : '12dvh',
					padding: isMobile ? '20px 16px 12px' : '0 48px',
				}}
			>
				<h2 style={{ color: '#6060f0' }}>Студенты и персонал</h2>
				<p style={{ color: '#454652', marginTop: isMobile ? '4px' : undefined }}>
					Поиск, фильтрация и просмотр профилей пользователей
				</p>
			</div>

			<div
				style={{
					height: isMobile ? 'auto' : '88dvh',
					padding: isMobile ? '8px 16px 24px' : '16px 48px',
					display: 'flex',
					gap: '24px',
				}}
			>
				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
						minWidth: 0,
					}}
				>
					<div
						style={{
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '20px',
							boxShadow: '#24389c14 0px 4px 12px',
							display: 'grid',
							gridTemplateColumns: isMobile
								? '1fr'
								: 'minmax(220px, 1fr) 200px auto',
							gap: '12px',
							alignItems: 'center',
						}}
					>
						<div style={{ position: 'relative' }}>
							<Search
								size={18}
								color='#6060f0'
								style={{
									position: 'absolute',
									left: '14px',
									top: '50%',
									transform: 'translateY(-50%)',
								}}
							/>
							<input
								value={search}
								onChange={event => setSearch(event.target.value)}
								placeholder='Поиск по имени, почте или комнате'
								style={{
									...inputStyle,
									paddingLeft: '42px',
									height: '44px',
								}}
							/>
						</div>
						<select
							value={roleFilter}
							onChange={event => setRoleFilter(event.target.value as RoleFilter)}
							style={{ ...inputStyle, height: '44px' }}
						>
							<option value='all'>Все роли</option>
							<option value='student'>Студенты</option>
							<option value='employee'>Сотрудники</option>
						</select>
						<button
							type='button'
							onClick={open}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '8px',
								height: '44px',
								padding: '0 18px',
								borderRadius: '12px',
								border: 'none',
								backgroundColor: '#6060f0',
								color: '#fff',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: 500,
								whiteSpace: 'nowrap',
							}}
						>
							<Plus size={18} />
							Добавить пользователя
						</button>
					</div>

					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '12px',
							overflowY: isMobile ? 'visible' : 'auto',
							paddingRight: '4px',
						}}
					>
						{loading && (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									padding: '48px',
								}}
							>
								<div className='load-weather'></div>
							</div>
						)}
						{error && !loading && (
							<div
								style={{
									backgroundColor: '#fff',
									borderRadius: '20px',
									border: '1px solid #FFDAD6',
									padding: '32px',
									color: '#e74c3c',
									textAlign: 'center',
								}}
							>
								{error}
							</div>
						)}
						{!loading &&
							!error &&
							users.map(user => {
								const isSelected = selectedUserId === user.id

								return (
									<button
										key={user.id}
										type='button'
										onClick={() =>
											isMobile
												? openUserProfile(user.id)
												: setSelectedUserId(user.id)
										}
										style={{
											width: '100%',
											backgroundColor: isSelected && !isMobile ? '#EFF4FF' : '#fff',
											border: `1px solid ${isSelected && !isMobile ? '#6060f0' : '#D3E4FE'}`,
											borderRadius: '20px',
											padding: '18px 20px',
											boxShadow: '#24389c14 0px 4px 12px',
											color: '#0B1C30',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											gap: '16px',
											textAlign: 'left',
										}}
									>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '14px',
												minWidth: 0,
											}}
										>
											<Avatar user={user} size={54} />
											<div style={{ minWidth: 0 }}>
												<h3
													style={{
														fontSize: '16px',
														fontWeight: 600,
														color: '#0B1C30',
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}
												>
													{getFullName(user)}
												</h3>
												<p
													style={{
														marginTop: '4px',
														fontSize: '13px',
														color: '#454652',
													}}
												>
													{user.role === 'student'
														? `${user.group || 'Группа не указана'} / блок ${user.block || '-'}`
														: user.email}
												</p>
											</div>
										</div>
										<span
											style={{
												...roleBadgeStyles[user.role],
												padding: '8px 12px',
												borderRadius: '20px',
												fontSize: '13px',
												fontWeight: 600,
												whiteSpace: 'nowrap',
											}}
										>
											{roleLabels[user.role]}
										</span>
									</button>
								)
							})}
						{!loading && !error && users.length === 0 && (
							<div
								style={{
									backgroundColor: '#fff',
									borderRadius: '20px',
									border: '1px solid #D3E4FE',
									padding: '32px',
									color: '#454652',
									textAlign: 'center',
								}}
							>
								Пользователи не найдены
							</div>
						)}
					</div>
				</div>

				{!isMobile && (
					<div
						style={{
							width: '36%',
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '28px',
							boxShadow: '#24389c14 0px 4px 12px',
							alignSelf: 'flex-start',
							minHeight: '520px',
						}}
					>
						{detailsLoading ? (
							<div
								style={{
									minHeight: '460px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<div className='load-weather'></div>
							</div>
						) : selectedUser ? (
							<UserPreview
								user={selectedUser}
								onDetails={() => openUserProfile(selectedUser.id)}
							/>
						) : (
							<div
								style={{
									minHeight: '460px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#454652',
									textAlign: 'center',
								}}
							>
								Выберите пользователя из списка
							</div>
						)}
					</div>
				)}
			</div>
		</>
	)
}

function Avatar({ user, size }: { user: PeopleUser; size: number }) {
	if (user.photo) {
		return (
			<img
				src={user.photo}
				alt={getFullName(user)}
				style={{
					width: size,
					height: size,
					borderRadius: '50%',
					objectFit: 'cover',
					flex: `0 0 ${size}px`,
				}}
			/>
		)
	}

	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: user.role === 'student' ? '#E5EEFF' : '#6cf8bb48',
				color: user.role === 'student' ? '#6060f0' : '#006C49',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontWeight: 700,
				fontSize: size > 60 ? '24px' : '16px',
				flex: `0 0 ${size}px`,
			}}
		>
			{getInitials(user) || <User size={size / 2} />}
		</div>
	)
}

function UserPreview({
	user,
	onDetails,
}: {
	user: PeopleUser
	onDetails: () => void
}) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '24px',
				minHeight: '460px',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					gap: '14px',
				}}
			>
				<Avatar user={user} size={112} />
				<div>
					<h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1C30' }}>
						{getFullName(user)}
					</h2>
					<div
						style={{
							...roleBadgeStyles[user.role],
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							marginTop: '10px',
							padding: '8px 14px',
							borderRadius: '20px',
							fontSize: '14px',
							fontWeight: 600,
						}}
					>
						{user.role === 'student' ? (
							<GraduationCap size={18} />
						) : (
							<User size={18} />
						)}
						{roleLabels[user.role]}
					</div>
				</div>
			</div>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
					flex: 1,
				}}
			>
				<DetailItem icon={<Phone size={22} color='#24389C' />} label='Телефон'>
					{user.phone || 'Не указан'}
				</DetailItem>
				{user.role === 'student' ? (
					<DetailItem icon={<DoorOpen size={22} color='#006C49' />} label='Блок'>
						{user.block || '-'} ({user.room_type || '-'})
					</DetailItem>
				) : (
					<DetailItem icon={<Mail size={22} color='#24389C' />} label='Почта'>
						{user.email}
					</DetailItem>
				)}
			</div>

			<button
				type='button'
				onClick={onDetails}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					padding: '12px 18px',
					borderRadius: '12px',
					border: 'none',
					backgroundColor: '#6060f0',
					color: '#fff',
					cursor: 'pointer',
					fontSize: '14px',
					fontWeight: 600,
				}}
			>
				Подробнее
			</button>
		</div>
	)
}

function DetailItem({
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
				display: 'flex',
				alignItems: 'center',
				gap: '14px',
				backgroundColor: '#F8F9FF',
				borderRadius: '14px',
				padding: '14px',
			}}
		>
			<div
				style={{
					width: '44px',
					height: '44px',
					borderRadius: '50%',
					backgroundColor: '#dee0ff81',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flex: '0 0 44px',
				}}
			>
				{icon}
			</div>
			<div style={{ minWidth: 0 }}>
				<div style={{ color: '#454652', fontSize: '13px', marginBottom: '4px' }}>
					{label}
				</div>
				<div
					style={{
						fontWeight: 600,
						fontSize: '16px',
						color: '#0B1C30',
						overflowWrap: 'anywhere',
					}}
				>
					{children}
				</div>
			</div>
		</div>
	)
}
