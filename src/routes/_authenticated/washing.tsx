import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { WashingMachine, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ReportMachineModal } from '../../components/ReportMachineModal'

type WashingMachineType = {
	id: number
	name: string
	status: 'free' | 'busy' | 'broken'
}

export const Route = createFileRoute('/_authenticated/washing')({
	component: RouteComponent,
})

function RouteComponent() {
	const [machines, setMachines] = useState<WashingMachineType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [problemModalOpened, setProblemModalOpened] = useState(false)

	const freeCount = machines.filter(m => m.status === 'free').length
	const busyCount = machines.filter(m => m.status === 'busy').length
	const brokenCount = machines.filter(m => m.status === 'broken').length

	useEffect(() => {
		axios
			.get('https://f3b0cd06c4aa4730.mokky.dev/machines')
			.then(response => {
				setMachines(response.data)
				setLoading(false)
			})
			.catch(error => {
				console.error('Ошибка:', error)
				setError('Не удалось загрузить данные о стиральных машинах')
				setLoading(false)
			})
	}, [])

	const toggleMachineStatus = async (
		machineId: number,
		currentStatus: string,
	) => {
		if (currentStatus === 'broken') {
			alert('Эта машина неисправна, обратитесь к администрации')
			return
		}

		const newStatus = currentStatus === 'free' ? 'busy' : 'free'

		try {
			await axios.patch(
				`https://f3b0cd06c4aa4730.mokky.dev/machines/${machineId}`,
				{
					status: newStatus,
				},
			)

			setMachines(prevMachines =>
				prevMachines.map(machine =>
					machine.id === machineId
						? { ...machine, status: newStatus as 'free' | 'busy' }
						: machine,
				),
			)
		} catch (err) {
			console.error('Ошибка при изменении статуса:', err)
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
				}
			case 'busy':
				return {
					bgColor: '#ffddb862',
					iconColor: '#603B00',
					buttonBg: '#ffddb862',
					buttonColor: '#603B00',
					buttonText: 'Освободить',
					statusText: 'Занята',
				}
			case 'broken':
				return {
					bgColor: '#ffdad681',
					iconColor: '#BA1A1A',
					buttonBg: '#ffdad66b',
					buttonColor: '#BA1A1A',
					buttonText: 'Неисправна',
					statusText: 'Неисправна',
				}
			default:
				return {
					bgColor: '#6cf8bb48',
					iconColor: '#006C49',
					buttonBg: '#6cf8bb48',
					buttonColor: '#006C49',
					buttonText: 'Занять',
					statusText: 'Свободна',
				}
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

	if (error) {
		return (
			<div style={{ padding: '48px', color: 'red', textAlign: 'center' }}>
				{error}
			</div>
		)
	}

	return (
		<>
			<ReportMachineModal
				opened={problemModalOpened}
				onClose={() => setProblemModalOpened(false)}
			/>
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
				}}
			>
				<div
					className='itemListWash'
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: '12px',
						// justifyContent: 'space-between',
						alignItems: 'flex-start',
						alignContent: 'flex-start',
					}}
				>
					{machines.map(machine => {
						const styles = getMachineStyles(machine.status)
						return (
							<div
								key={machine.id}
								style={{
									width: '32%',
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
									// flexGrow: '1',
								}}
							>
								<div
									style={{
										backgroundColor: styles.bgColor,
										padding: '32px',
										borderRadius: '50%',
									}}
								>
									<WashingMachine size={48} color={styles.iconColor} />
								</div>
								<div style={{ textAlign: 'center' }}>
									<h2 style={{ fontSize: '16px', fontWeight: '600' }}>
										{machine.name}
									</h2>
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
											marginTop: '16px',
										}}
									>
										{styles.statusText}
									</p>
								</div>
								{machine.status === 'broken' ? (
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
										{styles.buttonText}
									</button>
								)}
							</div>
						)
					})}
				</div>
				<div
					style={{ display: 'flex', width: '30%', justifyContent: 'center' }}
				>
					<div
						style={{
							width: '100%',
							height: '200px',
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '36px',
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
								gap: '36px',
							}}
						>
							<h2
								style={{
									fontWeight: '600',
									fontSize: '20px',
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
				</div>
			</div>
		</>
	)
}
