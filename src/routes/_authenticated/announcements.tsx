import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createFileRoute, Link } from '@tanstack/react-router'
import axios from 'axios'
import { Plus, ShieldCheck, SquarePen, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddNewsModalContent } from '../../components/AddNewsModalContent'
import { DeleteNewsModal } from '../../components/DeleteNewsModal'
import { EditNewsModal } from '../../components/EditNewsModal'
import { auth } from '../../lib/auth'

type NewsItem = {
	id: number
	type: string
	title: string
	content: string
	priority: string
	author: string
	created: string
	imageUrl?: string
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

	const getWelcomeMeassage = () => {
		const hour = new Date().getHours()
		if (hour >= 6 && hour < 12) {
			return 'Доброе утро'
		}
		if (hour >= 12 && hour < 18) {
			return 'Добрый день'
		}
		if (hour >= 18 && hour < 24) {
			return 'Добрый вечер'
		}
		return 'Доброй ночи'
	}

	const welcome = getWelcomeMeassage()

	const user = auth.getUser()
	const isEmployee = user?.role === 'employee'

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
			console.log('Обновляю новости...')
			const response = await axios.get(
				'https://f3b0cd06c4aa4730.mokky.dev/news',
			)
			console.log('Получены новости:', response.data)
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
			await axios.delete(
				`https://f3b0cd06c4aa4730.mokky.dev/news/${newsToDelete.id}`,
			)
			const response = await axios.get(
				'https://f3b0cd06c4aa4730.mokky.dev/news',
			)
			const sortedNews = response.data.sort(
				(a: NewsItem, b: NewsItem) => b.id - a.id,
			)
			setNews(sortedNews)
			closeDelete()
			setNewsToDelete(null)
		} catch (error) {
			console.error('Ошибка при удалении:', error)
			alert('Не удалось удалить новость')
		}
	}

	useEffect(() => {
		axios
			.get('https://f3b0cd06c4aa4730.mokky.dev/news')
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
	}, [])

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
		return <div style={{ color: 'red' }}>{error}</div>
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title='Добавить новость'
				size='lg'
				centered
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
					{welcome}, {user?.name}{' '}
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

								{item.imageUrl && (
									<div style={{ marginTop: '16px' }}>
										<img
											src={item.imageUrl}
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
								Мои дежурства
							</h2>
							<Link
								style={{
									textDecoration: 'none',
									color: '#6060f0',
									fontWeight: '600',
								}}
								to={'/duties'}
							>
								Детально
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
										fontSize: '14px',
									}}
								>
									ДЕК
								</span>
								<span style={{ fontWeight: '600', fontSize: '20px' }}>14</span>
							</div>
							<div>
								<h2 style={{ letterSpacing: '1px' }}>Уборка кухни</h2>
							</div>
						</div>
					</div>

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
								flexDirection: 'row',
								gap: '24px',
							}}
						>
							<h2 style={{ fontWeight: '600' }}>Погода на сегодня</h2>
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
								<h2 style={{ fontWeight: '600' }}>24°</h2>
								<span style={{ fontWeight: '600' }}>/</span>
								<h2>Ясно</h2>
							</div>
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
