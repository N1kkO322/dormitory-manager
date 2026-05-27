import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, ShieldCheck, SquarePen, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddNewsModalContent } from '../../components/AddNewsModalContent'
import { DeleteNewsModal } from '../../components/DeleteNewsModal'
import { EditNewsModal } from '../../components/EditNewsModal'
import { useUniversalAlert } from '../../components/useUniversalAlert'
import api from '../../lib/api'
import type { User } from '../../lib/auth'
import { auth } from '../../lib/auth'

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

type Duty = {
	id: number
	student: User
	floor: number
	date: string
}

type WeatherResponse = {
	main?: {
		temp: number
	}
	weather?: {
		description: string
	}[]
}

export const Route = createFileRoute('/_authenticated/announcements')({
	component: RouteComponent,
})

function RouteComponent() {
	const [news, setNews] = useState<NewsItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [expandedNews, setExpandedNews] = useState<number[]>([])
	const [opened, { open, close }] = useDisclosure(false)
	const [deleteOpened, { open: openDelete, close: closeDelete }] =
		useDisclosure(false)
	const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null)
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false)
	const [newsToEdit, setNewsToEdit] = useState<NewsItem | null>(null)
	const [duties, setDuties] = useState<Duty[]>([])
	const [weather, setWeather] = useState<{
		temp: number | null
		description: string
	}>({
		temp: null,
		description: '',
	})
	const { alertModal, openAlert } = useUniversalAlert()

	const user = auth.getUser()
	const isEmployee = user?.role === 'employee'

	const getWelcomeMeassage = () => {
		const hour = new Date().getHours()
		if (hour >= 6 && hour < 12) return 'Доброе утро'
		if (hour >= 12 && hour < 18) return 'Добрый день'
		if (hour >= 18 && hour < 24) return 'Добрый вечер'
		return 'Доброй ночи'
	}

	const welcome = getWelcomeMeassage()

	const toggleExpand = (id: number) => {
		setExpandedNews(prev =>
			prev.includes(id) ? prev.filter(newsId => newsId !== id) : [...prev, id],
		)
	}

	const openEditModal = (news: NewsItem) => {
		setNewsToEdit(news)
		openEdit()
	}

	const refreshNews = async () => {
		try {
			const response = await api.get('/api/news/')
			const sortedNews = response.data.sort(
				(a: NewsItem, b: NewsItem) => b.id - a.id,
			)
			setNews(sortedNews)
		} catch (error) {
			console.error('Ошибка при обновлении:', error)
		}
	}

	const handleDeleteNews = async () => {
		if (!newsToDelete) return
		try {
			await api.delete(`/api/news/${newsToDelete.id}`)
			await refreshNews()
			closeDelete()
			setNewsToDelete(null)
		} catch (error) {
			console.error('Ошибка при удалении:', error)
			openAlert('Не удалось удалить новость', { variant: 'error' })
		}
	}

	const generateDutiesForTwoWeeks = (students: User[]): Duty[] => {
		const twoRoom = students.filter(s => s.room_type === 2)
		const threeRoom = students.filter(s => s.room_type === 3)

		const sortFn = (a: User, b: User) => {
			const blockA = parseInt(a.block || '0')
			const blockB = parseInt(b.block || '0')
			if (blockA !== blockB) return blockA - blockB
			return (a.room || '').localeCompare(b.room || '')
		}

		twoRoom.sort(sortFn)
		threeRoom.sort(sortFn)

		const queue = [...twoRoom, ...threeRoom]
		if (queue.length === 0) return []

		const today = new Date()
		const startOfYear = new Date(today.getFullYear(), 0, 0)
		const dayOfYear = Math.floor(
			(today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
		)
		const startIndex = dayOfYear % queue.length

		const duties: Duty[] = []
		for (let i = 0; i < 14; i++) {
			const date = new Date(today)
			date.setDate(today.getDate() + i)
			const dateStr = date.toISOString().split('T')[0]
			const studentIndex = (startIndex + i) % queue.length
			duties.push({
				id: i,
				student: queue[studentIndex],
				floor: queue[studentIndex].floor!,
				date: dateStr,
			})
		}
		return duties
	}

	useEffect(() => {
		api
			.get('/api/news/')
			.then(response => {
				const sortedNews = response.data.sort(
					(a: NewsItem, b: NewsItem) => b.id - a.id,
				)
				setNews(sortedNews)
				setLoading(false)
			})
			.catch(error => {
				console.error('Ошибка:', error)
				setError('Не удалось загрузить новости')
				setLoading(false)
			})

		api
			.get<WeatherResponse>('/api/weather/')
			.then(response => {
				const data = response.data
				const description = data.weather?.[0]?.description ?? ''

				if (data.main) {
					setWeather({
						temp: Math.round(data.main.temp),
						description,
					})
				}
			})
			.catch(error => console.error('Ошибка погоды:', error))

		if (user?.role === 'student') {
			api.get('/api/users/').then(res => {
				const students = res.data.filter((u: User) => u.role === 'student')
				if (students.length > 0) {
					const generated = generateDutiesForTwoWeeks(students)
					setDuties(generated)
				}
			})
		}
	}, [])

	const now = new Date()
	const today = now.toISOString().split('T')[0]
	const myFutureDuties = duties
		.filter(d => d.student.id === user?.id && d.date >= today)
		.sort((a, b) => a.date.localeCompare(b.date))
	const nextDuty = myFutureDuties[0]

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
			<Modal
				opened={opened}
				onClose={close}
				title='Добавление новости'
				size='xl'
				centered
				radius={'16px'}
				padding={'28px'}
				styles={{ title: { fontWeight: 'bold', fontSize: '24px' } }}
			>
				<AddNewsModalContent onSuccess={refreshNews} onClose={close} />
			</Modal>
			<DeleteNewsModal
				opened={deleteOpened}
				onClose={closeDelete}
				onConfirm={handleDeleteNews}
				title={newsToDelete?.title || ''}
			/>
			<EditNewsModal
				opened={editOpened}
				onClose={closeEdit}
				onSuccess={refreshNews}
				news={newsToEdit}
			/>
			{alertModal}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
					height: '12dvh',
					paddingLeft: '48px',
				}}
			>
				<h2 style={{ color: '#6060f0' }}>
					{welcome}, {user?.name}
				</h2>
				<p style={{ color: '#454652' }}>
					Вот, что происходит в общежитии сегодня
				</p>
			</div>

			<div
				style={{
					height: '88dvh',
					padding: '16px 48px',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					gap: '24px',
				}}
			>
				<div className='itemList' style={{ flex: 1, overflowY: 'auto' }}>
					{news.map(item => {
						const isExpanded = expandedNews.includes(item.id)
						const shouldTruncate = item.content.length > 500

						return (
							<div
								key={item.id}
								className='singleNews'
								style={{
									width: '100%',
									backgroundColor: '#fff',
									borderRadius: '24px',
									border: '1px solid #D3E4FE',
									padding: '24px',
									color: '#0B1C30',
									marginBottom: '20px',
									transition: '0.2s linear',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<div
										style={{
											gap: '8px',
											display: 'flex',
											alignItems: 'center',
										}}
									>
										<div
											style={{
												backgroundColor: '#6CF8BB',
												padding: '8px 8px 1px 8px',
												borderRadius: '50%',
											}}
										>
											<ShieldCheck size={30} color='#00714D' />
										</div>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '4px',
											}}
										>
											<div>
												<h3 style={{ fontSize: '16px', fontWeight: '600' }}>
													{item.author}
												</h3>
											</div>
											<div>
												<p style={{ fontSize: '14px', color: '#454652' }}>
													{item.created}
												</p>
											</div>
										</div>
									</div>
									<div style={{ display: 'flex', gap: '24px' }}>
										{isEmployee && (
											<div
												style={{
													display: 'flex',
													gap: '16px',
													alignItems: 'center',
												}}
											>
												<button
													onClick={() => openEditModal(item)}
													style={{
														padding: '6px 6px 0px 6px',
														borderRadius: '8px',
														fontSize: '14px',
														backgroundColor: '#E5EEFF',
														color: '#6060f0',
														border: 'none',
														cursor: 'pointer',
														fontWeight: '500',
														transition: 'all 0.2s',
													}}
													onMouseEnter={e => {
														e.currentTarget.style.backgroundColor = '#6060f0'
														e.currentTarget.style.color = 'white'
													}}
													onMouseLeave={e => {
														e.currentTarget.style.backgroundColor = '#E5EEFF'
														e.currentTarget.style.color = '#6060f0'
													}}
												>
													<SquarePen />
												</button>
												<button
													onClick={() => {
														setNewsToDelete(item)
														openDelete()
													}}
													style={{
														padding: '4px 6px 0px 6px',
														borderRadius: '8px',
														fontSize: '14px',
														backgroundColor: '#FFE5E5',
														color: '#e74c3c',
														border: 'none',
														cursor: 'pointer',
														fontWeight: '500',
														transition: 'all 0.2s',
													}}
													onMouseEnter={e => {
														e.currentTarget.style.backgroundColor = '#e74c3c'
														e.currentTarget.style.color = 'white'
													}}
													onMouseLeave={e => {
														e.currentTarget.style.backgroundColor = '#FFE5E5'
														e.currentTarget.style.color = '#e74c3c'
													}}
												>
													<Trash />
												</button>
											</div>
										)}
										<div
											style={{
												padding: '8px 12px',
												borderRadius: '20px',
												fontSize: '14px',
												backgroundColor:
													item.priority === 'high' ? '#FFE5E5' : '#E5EEFF',
												color: item.priority === 'high' ? '#e74c3c' : '#454652',
											}}
										>
											{item.type}
										</div>
									</div>
								</div>

								{item.image_url && (
									<div style={{ marginTop: '16px' }}>
										<img
											src={item.image_url}
											alt={item.title}
											style={{
												width: '100%',
												maxHeight: '400px',
												objectFit: 'cover',
												borderRadius: '16px',
											}}
										/>
									</div>
								)}

								<div>
									<div
										style={{
											margin: '16px 0px',
											fontWeight: '600',
											fontSize: '16px',
										}}
									>
										<h2>{item.title}</h2>
									</div>
									<div
										className={!isExpanded ? 'text-clamp' : ''}
										style={{
											fontSize: '14px',
											color: '#454652',
											lineHeight: '24px',
											letterSpacing: '0px',
											maxHeight: isExpanded ? '500px' : '100px',
											overflow: 'hidden',
											transition: 'max-height 0.1s linear',
											position: 'relative',
										}}
									>
										{item.content.split('\n').map((paragraph, idx) => (
											<p key={idx}>{paragraph}</p>
										))}
									</div>
								</div>

								{shouldTruncate && (
									<div
										style={{
											marginTop: '16px',
											paddingTop: '16px',
											borderTop: '1px solid #D3E4FE',
										}}
									>
										<button
											onClick={() => toggleExpand(item.id)}
											style={{
												width: '100%',
												padding: '8px 16px',
												borderRadius: '8px',
												border: '1px solid #6060f0',
												backgroundColor: 'transparent',
												color: '#6060f0',
												cursor: 'pointer',
												fontSize: '14px',
												fontWeight: '500',
												transition: 'all 0.2s',
											}}
											onMouseEnter={e => {
												e.currentTarget.style.backgroundColor = '#6060f0'
												e.currentTarget.style.color = 'white'
											}}
											onMouseLeave={e => {
												e.currentTarget.style.backgroundColor = 'transparent'
												e.currentTarget.style.color = '#6060f0'
											}}
										>
											{isExpanded ? 'Свернуть' : 'Читать полностью'}
										</button>
									</div>
								)}
							</div>
						)
					})}
				</div>

				<div
					style={{
						width: '30%',
						display: 'flex',
						flexDirection: 'column',
						gap: '48px',
					}}
				>
					{user?.role === 'student' && nextDuty && (
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
								gap: '24px',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<h2 style={{ fontSize: '20px', fontWeight: '600' }}>
									Ближайшие дежурства
								</h2>
								<Link
									style={{
										textDecoration: 'none',
										color: '#6060f0',
										fontWeight: '600',
									}}
									to={'/duties'}
								>
									Календарь дежурств
								</Link>
							</div>
							<div
								style={{
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									gap: '24px',
								}}
							>
								<div
									style={{
										width: '60px',
										height: '60px',
										backgroundColor: '#E5EEFF',
										borderRadius: '8px',
										display: 'flex',
										justifyContent: 'center',
										flexDirection: 'column',
										alignItems: 'center',
									}}
								>
									<span
										style={{
											color: '#6060f0',
											fontWeight: '600',
											fontSize: '12px',
										}}
									>
										{(() => {
											const d = new Date(nextDuty.date)
											return d
												.toLocaleString('ru', { month: 'short' })
												.replace('.', '')
												.toUpperCase()
										})()}
									</span>
									<span style={{ fontWeight: '600', fontSize: '20px' }}>
										{new Date(nextDuty.date).getDate()}
									</span>
								</div>
								<div>
									<h2 style={{ letterSpacing: '1px' }}>Уборка кухни</h2>
								</div>
							</div>
						</div>
					)}

					<div
						style={{
							width: '100%',
							backgroundColor: '#EFF4FF',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '36px',
							boxShadow: '#24389c14 0px 4px 12px',
							color: '#0B1C30',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								width: '100%',
								flexDirection: 'column',
								gap: '24px',
							}}
						>
							<h2 style={{ fontWeight: '600' }}>Погода на сегодня</h2>
							{weather.temp !== null ? (
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										gap: '12px',
									}}
								>
									<div
										style={{
											width: '12px',
											height: '12px',
											backgroundColor: '#6CF8BB',
											borderRadius: '50%',
										}}
									></div>
									<h2 style={{ fontWeight: '600' }}>{weather.temp}°</h2>
									<span style={{ fontWeight: '600' }}>/</span>
									<h2 style={{ textTransform: 'capitalize' }}>
										{weather.description}
									</h2>
								</div>
							) : (
								<div className='load-weather'></div>
							)}
						</div>
					</div>

					{isEmployee && (
						<button
							onClick={open}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '10px 20px',
								backgroundColor: '#6060f0',
								color: 'white',
								border: 'none',
								borderRadius: '12px',
								fontSize: '14px',
								fontWeight: '500',
								cursor: 'pointer',
								transition: 'all 0.2s',
								justifyContent: 'center',
							}}
							onMouseEnter={e => {
								e.currentTarget.style.backgroundColor = '#4a4ad0'
								e.currentTarget.style.transform = 'translateY(-2px)'
							}}
							onMouseLeave={e => {
								e.currentTarget.style.backgroundColor = '#6060f0'
								e.currentTarget.style.transform = 'translateY(0)'
							}}
						>
							<Plus size={18} />
							Добавить новость
						</button>
					)}
				</div>
			</div>
		</>
	)
}
