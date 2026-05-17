import { createFileRoute } from '@tanstack/react-router'
import { BrushCleaning, Eye, Heater, Paintbrush } from 'lucide-react'
import { useEffect, useState } from 'react'
import { auth, User } from '../../lib/auth'

type Duty = {
	id: number
	student: User
	floor: number
	date: string
	completed: boolean
}

export const Route = createFileRoute('/_authenticated/duties')({
	component: RouteComponent,
})

function RouteComponent() {
	const currentUser = auth.getUser()
	const [duties, setDuties] = useState<Duty[]>([])
	const [loading, setLoading] = useState(true)
	const [allStudents, setAllStudents] = useState<User[]>([])

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const response = await fetch('https://f3b0cd06c4aa4730.mokky.dev/users')
				const data = await response.json()
				const students = data.filter((user: User) => user.role === 'student')
				setAllStudents(students)
			} catch (error) {
				console.error('Ошибка загрузки студентов:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchStudents()
	}, [])

	useEffect(() => {
		if (allStudents.length > 0 && currentUser) {
			const generatedDuties = generateDutiesForTwoWeeks(
				allStudents,
				currentUser as User,
			)
			setDuties(generatedDuties)
		}
	}, [allStudents, currentUser])

	const refreshData = () => {
		setDuties(generateDutiesForTwoWeeks(allStudents, currentUser))
	}

	useEffect(() => {
		const now = new Date()
		const midnight = new Date()
		midnight.setHours(24, 0, 0, 0)
		const timeUntilMidnight = midnight.getTime() - now.getTime()

		const timer = setTimeout(() => {
			refreshData()
			setInterval(refreshData, 24 * 60 * 60 * 1000)
		}, timeUntilMidnight)

		return () => clearTimeout(timer)
	}, [allStudents, currentUser])

	const generateDutiesForTwoWeeks = (
		students: User[],
		currentUser: User,
	): Duty[] => {
		const studentsByBlock: Record<string, User[]> = {}
		students.forEach(student => {
			const block = student.block || 'unknown'
			if (!studentsByBlock[block]) {
				studentsByBlock[block] = []
			}
			studentsByBlock[block].push(student)
		})

		const sortedBlocks = Object.keys(studentsByBlock).sort()

		const dutyQueue: User[] = []

		sortedBlocks.forEach(block => {
			const blockStudents = studentsByBlock[block]
			blockStudents.sort((a, b) => {
				if (a.room !== b.room) return (a.room || '').localeCompare(b.room || '')
				return a.id - b.id
			})
			dutyQueue.push(...blockStudents)
		})

		let startIndex = dutyQueue.findIndex(s => s.id === currentUser.id)
		if (startIndex === -1) startIndex = 0

		const duties: Duty[] = []
		const today = new Date()

		for (let i = 0; i < 14; i++) {
			const date = new Date(today)
			date.setDate(today.getDate() + i)
			const dateStr = date.toISOString().split('T')[0]

			const studentIndex = (startIndex + i) % dutyQueue.length
			const student = dutyQueue[studentIndex]

			duties.push({
				id: i,
				student: student,
				floor: student.floor,
				date: dateStr,
				completed: false,
			})
		}

		return duties
	}

	const getNext7Days = (): string[] => {
		const dates: string[] = []
		const today = new Date()
		for (let i = 0; i < 7; i++) {
			const date = new Date(today)
			date.setDate(today.getDate() + i)
			dates.push(date.toISOString().split('T')[0])
		}
		return dates
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		const day = date.getDate()
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		return `${day}.${month}`
	}

	const getDayOfWeek = (dateStr: string) => {
		const weekdays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
		return weekdays[new Date(dateStr).getDay()]
	}

	const isToday = (dateStr: string) => {
		const today = new Date().toISOString().split('T')[0]
		return dateStr === today
	}

	const dates = getNext7Days()

	const dutiesByDate: Record<string, Duty[]> = {}
	duties.forEach(duty => {
		if (!dutiesByDate[duty.date]) {
			dutiesByDate[duty.date] = []
		}
		dutiesByDate[duty.date].push(duty)
	})

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

	return (
		<div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
					height: '12dvh',
					paddingLeft: '48px',
				}}
			>
				<h2 style={{ color: '#6060f0' }}>Дежурства</h2>
				<p style={{ color: '#454652' }}>Расписание на ближайшие 7 дней</p>
			</div>

			<div
				style={{
					height: '88dvh',
					padding: '16px 48px',
					display: 'flex',
					flexDirection: 'column',
					gap: '24px',
				}}
			>
				<div style={{ overflowY: 'auto' }}>
					<div
						style={{
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '24px',
							boxShadow: '#24389c14 0px 4px 12px',
						}}
					>
						<div
							style={{
								textAlign: 'center',
								fontWeight: '600',
								color: '#6060f0',
								fontSize: '24px',
								padding: '16px 0px 32px 0px',
								textAlignLast: 'left',
							}}
						>
							Календарь дежурств
						</div>

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(7, 1fr)',
								gap: '12px',
								borderRadius: '24px',
							}}
						>
							{dates.map(date => {
								const dayDuties = dutiesByDate[date] || []
								const today = isToday(date)

								return (
									<div
										key={date}
										style={{
											backgroundColor: today ? '#6060f0' : '#eff4ff',
											borderRadius: '16px',
											border: today ? '2px solid #6060f0' : '1px solid #D3E4FE',
											padding: '16px',
											height: '220px',
											width: '80%',
											minHeight: '120px',
											transition: 'all 0.2s',
											color: today ? '#fff' : '',
										}}
									>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												height: '100%',
												justifyContent: 'space-between',
											}}
										>
											<div
												style={{
													fontSize: '20px',
													fontWeight: '600',
													color: today ? '#fff' : '#333',
													marginBottom: '8px',
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
												}}
											>
												<span
													style={{
														fontSize: '20px',
														color: today ? '#fff' : '#6060f0',
														fontWeight: '600',
													}}
												>
													{formatDate(date)}
												</span>
												<span
													style={{
														fontSize: '18px',
														color: today ? '#fff' : '#666',
														fontWeight: '400',
													}}
												>
													{getDayOfWeek(date).slice(0, 2)}
												</span>
											</div>

											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													borderRadius: '8px',
													alignItems: 'flex-start',
												}}
											>
												{dayDuties.length > 0 ? (
													dayDuties.map(duty => (
														<div
															key={duty.id}
															style={{
																gap: '6px',
																fontSize: '11px',
															}}
														>
															<div
																style={{
																	fontWeight: '500',
																	color: today ? '#fff' : '#0B1C30',
																	fontSize: '14px',
																	display: 'flex',
																	flexDirection: 'column',
																	alignItems: 'flex-start',
																	gap: '2px',
																}}
															>
																<img
																	src={duty.student.photo}
																	alt=''
																	style={{
																		width: '80px',
																		height: '80px',
																		borderRadius: '50%',
																		marginBottom: '8px',
																		objectFit: 'cover',
																	}}
																/>
																<div>
																	<h3
																		style={{
																			fontSize: '14px',
																			fontWeight: '600',
																			margin: 0,
																		}}
																	>
																		{duty.student.name} {duty.student.surname}
																	</h3>
																</div>
															</div>
															<div
																style={{
																	marginTop: '8px',
																	fontSize: '12px',
																	fontWeight: '600',
																	color: today ? '#d8dced' : '#454652',
																}}
															>
																Блок {duty.student.block} (
																{duty.student.roomType})
															</div>
														</div>
													))
												) : (
													<div
														style={{
															textAlign: 'center',
															color: '#999',
															fontSize: '11px',
															padding: '8px',
														}}
													>
														—
													</div>
												)}
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>

				<div
					style={{
						width: '30%',
						display: 'flex',
						flexDirection: 'column',
						gap: '48px',
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
						}}
					>
						<h3
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								marginBottom: '16px',
							}}
						>
							Обязанности дежурного
						</h3>
						<div
							style={{
								color: '#454652',
								lineHeight: '1.8',
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							<div
								style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
							>
								<Eye size={25} color='#6060f0' /> Проверить порядок на кухне
							</div>
							<div
								style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
							>
								<BrushCleaning size={25} color='#6060f0' /> Вымыть раковины
							</div>
							<div
								style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
							>
								<Heater size={25} color='#6060f0' /> Вымыть плиту
							</div>
							<div
								style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
							>
								<Paintbrush size={25} color='#6060f0' /> Протереть стол
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
