import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import {
	Ban,
	LoaderPinwheel,
	Plus,
	Trash2,
	WashingMachine,
	Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { DeleteMachineModal } from '../../components/DeleteMachineModal'
import { ReportMachineModal } from '../../components/ReportMachineModal'
import { useUniversalAlert } from '../../components/useUniversalAlert'
import api from '../../lib/api'
import { auth } from '../../lib/auth'

type WashingMachineType = {
	id: number
	name: string
	status: 'free' | 'busy' | 'broken'
	occupied_by?: string
	occupied_by_role?: string
	occupied_by_id?: number
	occupied_by_block?: string
	occupied_by_room_type?: number
	occupied_at?: string
}

export const Route = createFileRoute('/_authenticated/washing')({
	component: RouteComponent,
})

const getErrorDetail = (error: unknown, fallback: string) => {
	if (isAxiosError<{ detail?: string }>(error)) {
		return error.response?.data?.detail || fallback
	}

	return fallback
}

function RouteComponent() {
	const [machines, setMachines] = useState<WashingMachineType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [problemModalOpened, setProblemModalOpened] = useState(false)
	const [deleteModalOpened, setDeleteModalOpened] = useState(false)
	const [machineToDelete, setMachineToDelete] =
		useState<WashingMachineType | null>(null)
	const { alertModal, openAlert } = useUniversalAlert()

	const freeCount = machines.filter(m => m.status === 'free').length
	const busyCount = machines.filter(m => m.status === 'busy').length
	const brokenCount = machines.filter(m => m.status === 'broken').length

	useEffect(() => {
		api
			.get('/api/machines/')
			.then(response => {
				setMachines(response.data)
				setLoading(false)
			})
			.catch(error => {
				console.error('Ошибка:', error)
				setError('Не удалось загрузить данные, пожалуйста, подождите')
				setLoading(false)
			})
	}, [])

	const toggleMachineStatus = async (
		machineId: number,
		currentStatus: string,
	) => {
		if (currentStatus === 'broken') {
			openAlert('Эта машина неисправна, обратитесь к администрации', {
				variant: 'error',
			})
			return
		}

		const currentUser = auth.getUser()
		if (!currentUser) {
			openAlert('Ошибка: пользователь не найден', { variant: 'error' })
			return
		}

		if (currentStatus === 'busy') {
			const machine = machines.find(m => m.id === machineId)
			if (machine?.occupied_by_id !== currentUser.id) {
				openAlert(
					'Вы не можете освободить эту машину, так как её занял другой пользователь',
					{ variant: 'error' },
				)
				return
			}
		}

		const newStatus = currentStatus === 'free' ? 'busy' : 'free'

		try {
			const response = await api.patch(`/api/machines/${machineId}`, {
				status: newStatus,
			})

			setMachines(prevMachines =>
				prevMachines.map(machine =>
					machine.id === machineId ? response.data : machine,
				),
			)
		} catch (err) {
			console.error('Ошибка при изменении статуса:', err)
			openAlert(
				'Не удалось изменить статус машины, возможно её занял другой пользователь или она сломалась',
				{ variant: 'error' },
			)
			try {
				const response = await api.get('/api/machines')
				setMachines(response.data)
			} catch (refreshErr) {
				console.error('Не удалось обновить список машин:', refreshErr)
				window.location.reload()
			}
		}
	}

	const markAsBroken = async (machineId: number) => {
		console.log('markAsFixed вызвана')
		try {
			const response = await api.patch(`/api/machines/${machineId}`, {
				status: 'broken',
			})

			setMachines(prevMachines =>
				prevMachines.map(machine =>
					machine.id === machineId ? response.data : machine,
				),
			)
		} catch (err: unknown) {
			console.error('Ошибка:', err)
			openAlert(
				getErrorDetail(err, 'Не удалось отметить машину как неисправную'),
				{ variant: 'error' },
			)
		}
	}

	const markAsFixed = async (machineId: number) => {
		try {
			const response = await api.patch(`/api/machines/${machineId}`, {
				status: 'free',
			})

			setMachines(prevMachines =>
				prevMachines.map(machine =>
					machine.id === machineId ? response.data : machine,
				),
			)
		} catch (err: unknown) {
			console.error('Ошибка:', err)
			openAlert(
				getErrorDetail(err, 'Не удалось отметить машину как исправную'),
				{ variant: 'error' },
			)
		}
	}

	const addMachine = async () => {
		const nextNumber = machines.length + 1
		const name = `Стиральная машина №${nextNumber}`
		try {
			const response = await api.post('/api/machines/', { name })
			setMachines(prev => [...prev, response.data])
		} catch (err: unknown) {
			console.error('Ошибка:', err)
			openAlert(getErrorDetail(err, 'Не удалось добавить машину'), {
				variant: 'error',
			})
		}
	}

	const deleteMachine = async () => {
		if (!machineToDelete) return

		try {
			await api.delete(`/api/machines/${machineToDelete.id}`)
			setMachines(prev => prev.filter(m => m.id !== machineToDelete.id))
			setDeleteModalOpened(false)
			setMachineToDelete(null)
		} catch (err: unknown) {
			console.error('Ошибка:', err)
			openAlert(getErrorDetail(err, 'Не удалось удалить машину'), {
				variant: 'error',
			})
		}
	}

	const getMachineStyles = (status: string) => {
		switch (status) {
			case 'free':
				return {
					bgColor: '#6cf8bb48',
					iconColor: '#006C49',
					buttonBg: '#6cf8bb48',
					buttonColor: '#006C49',
					buttonText: 'Занять',
					statusText: 'Свободна',
					Icon: WashingMachine,
				}
			case 'busy':
				return {
					bgColor: '#ffddb862',
					iconColor: '#603B00',
					buttonBg: '#ffddb862',
					buttonColor: '#603B00',
					buttonText: 'Освободить',
					statusText: 'Занята',
					Icon: LoaderPinwheel,
				}
			case 'broken':
				return {
					bgColor: '#ffdad681',
					iconColor: '#BA1A1A',
					buttonBg: '#ffdad66b',
					buttonColor: '#BA1A1A',
					buttonText: 'Неисправна',
					statusText: 'Неисправна',
					Icon: Ban,
				}
			default:
				return {
					bgColor: '#6cf8bb48',
					iconColor: '#006C49',
					buttonBg: '#6cf8bb48',
					buttonColor: '#006C49',
					buttonText: 'Занять',
					statusText: 'Свободна',
					Icon: WashingMachine,
				}
		}
	}

	const currentUser = auth.getUser()

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

	if (error) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100dvh',
				}}
			>
				<div style={{ color: '#ff4848', fontSize: '18px' }}>{error}</div>
			</div>
		)
	}

	return (
		<>
			<DeleteMachineModal
				opened={deleteModalOpened}
				onClose={() => {
					setDeleteModalOpened(false)
					setMachineToDelete(null)
				}}
				onConfirm={deleteMachine}
				machineName={machineToDelete?.name || ''}
			/>
			<ReportMachineModal
				opened={problemModalOpened}
				onClose={() => setProblemModalOpened(false)}
			/>
			{alertModal}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
					height: '20dvh',
					paddingLeft: '48px',
				}}
			>
				<h2 style={{ color: '#6060f0' }}>Прачечная</h2>
				<p style={{ color: '#454652' }}>Проверьте наличие свободных машин</p>
				<div style={{ color: '#454652', display: 'flex', gap: '36px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<div
							style={{
								width: '12px',
								height: '12px',
								backgroundColor: '#6CF8BB',
								borderRadius: '50%',
							}}
						></div>
						Свободно ({freeCount})
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<div
							style={{
								width: '12px',
								height: '12px',
								backgroundColor: '#FFB95F',
								borderRadius: '50%',
							}}
						></div>
						Занято ({busyCount})
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<div
							style={{
								width: '12px',
								height: '12px',
								backgroundColor: '#FFDAD6',
								borderRadius: '50%',
							}}
						></div>
						Неисправно ({brokenCount})
					</div>
				</div>
			</div>
			<div
				style={{
					height: '80dvh',
					padding: '16px 48px',
					display: 'flex',
					justifyContent: 'space-between',
					gap: '24px',
				}}
			>
				<div
					className='itemListWash'
					style={{
						width: '70%',
						display: 'flex',
						flexWrap: 'wrap',
						gap: '12px',
						alignItems: 'flex-start',
						alignContent: 'flex-start',
					}}
				>
					{[...machines]
						.sort((a, b) => a.id - b.id)
						.map(machine => {
							const styles = getMachineStyles(machine.status)
							const IconComponent = styles.Icon
							const isCurrentUserOccupier =
								machine.occupied_by_id === currentUser?.id

							return (
								<div
									key={machine.id}
									style={{
										width: 'calc(33.33% - 8px)',
										height: '340px',
										backgroundColor: '#fff',
										borderRadius: '24px',
										border: '1px solid #D3E4FE',
										padding: '24px',
										boxShadow: '#24389c14 0px 4px 12px',
										color: '#0B1C30',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'space-between',
										position: 'relative',
									}}
								>
									{currentUser?.role === 'employee' && (
										<div
											style={{
												position: 'absolute',
												top: '12px',
												right: '12px',
												cursor: 'pointer',
												zIndex: 2,
											}}
										>
											<Trash2
												size={24}
												color='#999'
												onClick={e => {
													e.stopPropagation()
													setMachineToDelete(machine)
													setDeleteModalOpened(true)
												}}
												style={{ transition: 'color 0.2s' }}
												onMouseEnter={e =>
													(e.currentTarget.style.color = '#e74c3c')
												}
												onMouseLeave={e =>
													(e.currentTarget.style.color = '#999')
												}
											/>
										</div>
									)}
									<div
										onClick={
											currentUser?.role === 'employee' &&
											machine.status !== 'broken'
												? () => markAsBroken(machine.id)
												: undefined
										}
										style={{
											backgroundColor: styles.bgColor,
											padding: '32px 32px 24px 32px',
											borderRadius: '50%',
											cursor:
												currentUser?.role === 'employee' &&
												machine.status !== 'broken'
													? 'pointer'
													: 'default',
											transition: 'all 0.3s ease',
											position: 'relative',
										}}
										onMouseEnter={e => {
											if (
												currentUser?.role === 'employee' &&
												machine.status !== 'broken'
											) {
												e.currentTarget.style.backgroundColor = '#ffdad66b'
												const icon = e.currentTarget.querySelector(
													'.machine-icon',
												) as HTMLElement
												if (icon) icon.style.opacity = '0'
												const wrench = e.currentTarget.querySelector(
													'.wrench-icon',
												) as HTMLElement
												if (wrench) wrench.style.opacity = '1'
											}
										}}
										onMouseLeave={e => {
											if (
												currentUser?.role === 'employee' &&
												machine.status !== 'broken'
											) {
												e.currentTarget.style.backgroundColor = styles.bgColor
												const icon = e.currentTarget.querySelector(
													'.machine-icon',
												) as HTMLElement
												if (icon) icon.style.opacity = '1'
												const wrench = e.currentTarget.querySelector(
													'.wrench-icon',
												) as HTMLElement
												if (wrench) wrench.style.opacity = '0'
											}
										}}
									>
										<IconComponent
											size={48}
											color={styles.iconColor}
											className='machine-icon'
											style={{ transition: 'opacity 0.3s ease' }}
										/>
										{currentUser?.role === 'employee' &&
											machine.status !== 'broken' && (
												<Wrench
													size={48}
													color='#BA1A1A'
													className='wrench-icon'
													style={{
														position: 'absolute',
														top: '50%',
														left: '50%',
														transform: 'translate(-50%, -50%)',
														opacity: 0,
														transition: 'opacity 0.3s ease',
													}}
												/>
											)}
									</div>
									<div style={{ textAlign: 'center' }}>
										<h2 style={{ fontSize: '16px', fontWeight: '600' }}>
											{machine.name}
										</h2>
										<div
											style={{
												display: 'flex',
												flexDirection: 'row',
												justifyContent: 'center',
												marginTop: '16px',
												alignContent: 'center',
												gap: '8px',
											}}
										>
											<p
												style={{
													fontSize: '18px',
													color:
														machine.status === 'free'
															? '#00cc66'
															: machine.status === 'busy'
																? '#FFB95F'
																: '#BA1A1A',
													textAlign: 'center',
												}}
											>
												{styles.statusText}{' '}
											</p>
											{machine.status === 'busy' && isCurrentUserOccupier && (
												<p
													style={{
														fontSize: '18px',
														color: '#603B00',
														fontWeight: '600',
													}}
												>
													{' '}
													(Вами)
												</p>
											)}
										</div>
									</div>
									{currentUser?.role === 'employee' &&
									machine.status === 'broken' ? (
										<button
											onClick={() => markAsFixed(machine.id)}
											style={{
												backgroundColor: '#ffdad66b',
												color: '#BA1A1A',
												border: 'none',
												padding: '10px 20px',
												width: '100%',
												borderRadius: '20px',
												cursor: 'pointer',
												fontSize: '14px',
												fontWeight: '500',
												transition: 'all 0.2s',
											}}
											onMouseEnter={e => {
												e.currentTarget.style.opacity = '0.8'
											}}
											onMouseLeave={e => {
												e.currentTarget.style.opacity = '1'
											}}
										>
											Исправна
										</button>
									) : machine.status === 'broken' ? (
										<div
											style={{
												backgroundColor: styles.buttonBg,
												color: styles.buttonColor,
												border: 'none',
												padding: '10px 20px',
												width: '100%',
												borderRadius: '20px',
												fontSize: '14px',
												fontWeight: '500',
												textAlign: 'center',
												opacity: 0.6,
											}}
										>
											{styles.buttonText}
										</div>
									) : (
										<button
											onClick={() =>
												toggleMachineStatus(machine.id, machine.status)
											}
											style={{
												backgroundColor: styles.buttonBg,
												color: styles.buttonColor,
												border: 'none',
												padding: '10px 20px',
												width: '100%',
												borderRadius: '20px',
												fontSize: '14px',
												fontWeight: '500',
												transition: 'all 0.2s',
												opacity:
													machine.status === 'busy' && !isCurrentUserOccupier
														? 0.5
														: 1,
												cursor:
													machine.status === 'busy' && !isCurrentUserOccupier
														? 'not-allowed'
														: 'pointer',
											}}
											disabled={
												machine.status === 'busy' && !isCurrentUserOccupier
											}
											onMouseEnter={e => {
												if (
													!(machine.status === 'busy' && !isCurrentUserOccupier)
												) {
													e.currentTarget.style.opacity = '0.8'
												}
											}}
											onMouseLeave={e => {
												if (
													!(machine.status === 'busy' && !isCurrentUserOccupier)
												) {
													e.currentTarget.style.opacity = '1'
												}
											}}
										>
											{styles.buttonText}
										</button>
									)}
								</div>
							)
						})}
					{currentUser?.role === 'employee' && (
						<div
							onClick={() => addMachine()}
							style={{
								width: 'calc(33.33% - 8px)',
								height: '340px',
								backgroundColor: '#fff',
								borderRadius: '24px',
								border: '2px dashed #D3E4FE',
								padding: '24px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								transition: 'all 0.2s',
								gap: '16px',
							}}
							onMouseEnter={e => {
								e.currentTarget.style.borderColor = '#6060f0'
								e.currentTarget.style.backgroundColor = '#F8F9FF'
							}}
							onMouseLeave={e => {
								e.currentTarget.style.borderColor = '#D3E4FE'
								e.currentTarget.style.backgroundColor = '#fff'
							}}
						>
							<div
								style={{
									width: '80px',
									height: '80px',
									borderRadius: '50%',
									backgroundColor: '#E5EEFF',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Plus size={40} color='#6060f0' />
							</div>
							<span
								style={{
									color: '#6060f0',
									fontSize: '16px',
									fontWeight: '500',
								}}
							>
								Добавить машину
							</span>
						</div>
					)}
				</div>
				<div
					style={{
						display: 'flex',
						width: '30%',
						justifyContent: 'flex-start',
						flexDirection: 'column',
						height: '100%',
						gap: '24px',
					}}
				>
					<div
						style={{
							width: '100%',
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '24px',
							boxShadow: '#24389c14 0px 4px 12px',
							color: '#0B1C30',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								width: '100%',
								flexDirection: 'column',
								gap: '16px',
							}}
						>
							<h2
								style={{
									fontWeight: '600',
									fontSize: '18px',
									textAlign: 'center',
								}}
							>
								Заметили неисправность машинки?
							</h2>
							<button
								onClick={() => setProblemModalOpened(true)}
								style={{
									backgroundColor: '#6060f0',
									color: '#fff',
									border: 'none',
									padding: '10px 20px',
									width: '100%',
									borderRadius: '20px',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500',
									transition: 'all 0.2s',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '12px',
								}}
								onMouseEnter={e => {
									e.currentTarget.style.opacity = '0.9'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.opacity = '1'
								}}
							>
								Сообщить о проблеме <Wrench />
							</button>
						</div>
					</div>

					<div
						style={{
							width: '100%',
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '24px',
							boxShadow: '#24389c14 0px 4px 12px',
							color: '#0B1C30',
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
						}}
					>
						<h2
							style={{
								fontWeight: '600',
								fontSize: '18px',
								textAlign: 'center',
								margin: 0,
							}}
						>
							Журнал занятости
						</h2>
						<div
							style={{
								maxHeight: '500px',
								overflowY: 'auto',
								display: 'flex',
								flexDirection: 'column-reverse',
								gap: '12px',
							}}
						>
							{machines.some(m => m.status === 'busy') ? (
								machines
									.filter(m => m.status === 'busy')
									.map(machine => (
										<div
											key={machine.id}
											style={{
												padding: '12px',
												backgroundColor: '#FFF3E0',
												borderRadius: '12px',
												border: '1px solid #FFB95F',
											}}
										>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													marginBottom: '8px',
												}}
											>
												<strong style={{ fontSize: '14px' }}>
													{machine.name}
												</strong>
												<span
													style={{
														fontSize: '12px',
														padding: '2px 8px',
														backgroundColor: '#FFB95F',
														borderRadius: '12px',
														color: '#603B00',
													}}
												>
													Занята
												</span>
											</div>
											<div style={{ fontSize: '12px', color: '#666' }}>
												Кто занял: {machine.occupied_by || 'Администратор'}
												{machine.occupied_by_block &&
													machine.occupied_by_role !== 'employee' && (
														<>
															{' '}
															{'/'} {machine.occupied_by_block} (
															{machine.occupied_by_room_type})
														</>
													)}
											</div>
											<div
												style={{
													fontSize: '12px',
													color: '#666',
													marginTop: '4px',
												}}
											>
												Когда: {machine.occupied_at}
											</div>
										</div>
									))
							) : (
								<div
									style={{
										textAlign: 'center',
										padding: '24px',
										color: '#666',
										fontSize: '14px',
									}}
								>
									Все доступные машины свободны
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
