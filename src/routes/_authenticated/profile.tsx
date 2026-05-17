import { createFileRoute } from '@tanstack/react-router'
import {
	AlertCircle,
	DoorOpen,
	GraduationCap,
	Mail,
	Phone,
	User,
} from 'lucide-react'
import { useState } from 'react'
import { ReportIncorrectModal } from '../../components/ReportIncorrectModal'
import { auth } from '../../lib/auth'

export const Route = createFileRoute('/_authenticated/profile')({
	component: RouteComponent,
})

function RouteComponent() {
	// const [loading, setLoading] = useState(true)
	const [incorrectModalOpened, setIncorrectModalOpened] = useState(false)

	const user = auth.getUser()
	const isStudent = auth.isStudent()

	console.log(user)

	const formatPhone = (phone: string | undefined) => {
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

	return (
		<>
			<ReportIncorrectModal
				opened={incorrectModalOpened}
				onClose={() => setIncorrectModalOpened(false)}
				infoType='дежурства'
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
				<h2 style={{ color: '#6060f0' }}>Профиль</h2>
				<p style={{ color: '#454652' }}>Ваша личная информация</p>
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
				<div style={{ flex: '1 1 0%', width: '100%' }}>
					<div
						style={{
							backgroundColor: '#fff',
							borderRadius: '24px',
							border: '1px solid #D3E4FE',
							padding: '32px',
							boxShadow: '#24389c14 0px 4px 12px',
							marginBottom: '24px',
							display: 'flex',
							width: '100%',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '16px',
								width: '20%',
								paddingRight: '32px',
								justifyContent: 'center',
							}}
						>
							<div
								style={{
									// backgroundColor: '#E5EEFF',
									padding: '36px',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{user?.photo ? (
									<img
										src={user?.photo}
										alt='Фото профиля'
										style={{
											width: '140px',
											height: '140px',
											borderRadius: '50%',
											objectFit: 'cover',
										}}
									/>
								) : (
									<User size={40} color='#6060f0' />
								)}
							</div>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '24px',
								width: '100%',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									width: '100%',
								}}
							>
								<h2 style={{ fontSize: '24px', fontWeight: '600' }}>
									{user?.surname} {user?.name} {user?.middleName}
								</h2>

								<p style={{ color: '#6060f0' }}>
									{isStudent ? 'Студент' : 'Сотрудник'}
								</p>
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									width: '100%',
									flexDirection: isStudent ? 'row' : 'column',
									flexWrap: 'wrap',
									gap: '42px',
								}}
							>
								{isStudent && (
									<div
										style={{
											backgroundColor: '#F8F9FF',
											width: '20%',
											borderRadius: '12px',
										}}
									>
										<div
											style={{ padding: '16px', display: 'flex', gap: '16px' }}
										>
											<div
												style={{
													padding: '12px',
													backgroundColor: '#6cf8bb3b',
													borderRadius: '50%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<DoorOpen size={24} color='#006C49' />
											</div>
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													justifyContent: 'center',
												}}
											>
												<div style={{ color: '#454652', fontSize: '14px' }}>
													Комната
												</div>
												<div style={{ fontWeight: '600', fontSize: '18px' }}>
													{user?.room}
												</div>
											</div>
										</div>
									</div>
								)}

								<div
									style={{
										backgroundColor: '#F8F9FF',
										width: isStudent ? '70%' : '60%',
										borderRadius: '12px',
									}}
								>
									<div
										style={{ padding: '16px', display: 'flex', gap: '16px' }}
									>
										<div
											style={{
												padding: '12px',
												backgroundColor: '#dee0ff81',
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<Mail size={24} color='#24389C' />
										</div>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
											}}
										>
											<div style={{ color: '#454652', fontSize: '14px' }}>
												Почта
											</div>
											<div style={{ fontWeight: '600', fontSize: '18px' }}>
												{user?.email}
											</div>
										</div>
									</div>
								</div>

								<div
									style={{
										backgroundColor: '#F8F9FF',
										width: isStudent ? '55%' : '60%',
										borderRadius: '12px',
									}}
								>
									<div
										style={{ padding: '16px', display: 'flex', gap: '16px' }}
									>
										<div
											style={{
												padding: '12px',
												backgroundColor: '#dee0ff81',
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<Phone size={24} color='#24389C' />
										</div>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
											}}
										>
											<div style={{ color: '#454652', fontSize: '14px' }}>
												Телефон
											</div>
											<div style={{ fontWeight: '600', fontSize: '18px' }}>
												{formatPhone(user?.phone)}
											</div>
										</div>
									</div>
								</div>

								{isStudent && (
									<div
										style={{
											backgroundColor: '#F8F9FF',
											width: '30%',
											borderRadius: '12px',
										}}
									>
										<div
											style={{ padding: '16px', display: 'flex', gap: '16px' }}
										>
											<div
												style={{
													padding: '12px',
													backgroundColor: '#ffddb886',
													borderRadius: '50%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<GraduationCap size={24} color='#603B00' />
											</div>
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													justifyContent: 'center',
												}}
											>
												<div style={{ color: '#454652', fontSize: '14px' }}>
													Группа
												</div>
												<div style={{ fontWeight: '600', fontSize: '18px' }}>
													{user?.group}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{isStudent && (
						<>
							<div
								style={{
									backgroundColor: '#fff',
									borderRadius: '24px',
									border: '1px solid #D3E4FE',
									padding: '32px',
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
											{user?.emergencyContact?.name}
										</div>
									</div>
									<div>
										<div style={{ fontSize: '12px', color: '#666' }}>
											Кем приходится
										</div>
										<div style={{ fontWeight: '500' }}>
											{user?.emergencyContact?.relation}
										</div>
									</div>
									<div>
										<div style={{ fontSize: '12px', color: '#666' }}>
											Телефон
										</div>
										<div style={{ fontWeight: '500' }}>
											{formatPhone(user?.emergencyContact?.phone)}
										</div>
									</div>
								</div>
							</div>
						</>
					)}
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
							padding: '36px',
							boxShadow: '#24389c14 0px 4px 12px',
							color: '#0B1C30',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '24px',
						}}
					>
						<h2>Информация некорректна?</h2>
						<button
							onClick={() => setIncorrectModalOpened(true)}
							style={{
								width: '100%',
								padding: '12px 16px',
								backgroundColor: '#6060f0',
								border: 'none',
								borderRadius: '20px',
								color: '#fff',
								fontSize: '14px',
								fontWeight: '500',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '8px',
								transition: 'all 0.2s ease',
								marginTop: '8px',
							}}
							onMouseEnter={e => {
								e.currentTarget.style.opacity = '0.9'
								e.currentTarget.style.transform = 'translateY(-2px)'
							}}
							onMouseLeave={e => {
								e.currentTarget.style.opacity = '1'
								e.currentTarget.style.transform = 'translateY(0)'
							}}
						>
							<AlertCircle size={18} />
							Сообщить о некорректности информации
						</button>
					</div>
				</div>
			</div>
		</>
	)
}
