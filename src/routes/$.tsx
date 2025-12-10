import { createFileRoute, Link, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
	component: CatchAllRoute,
})

function CatchAllRoute() {
	const router = useRouter()
	const pathname = router.state.location.pathname

	return (
		<div
			style={{
				width: '100%',
				height: '100dvh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: '50%',
					backgroundColor: '#fff',
					display: 'flex',
					padding: '24px',
					borderRadius: '56px',
					boxShadow: '#c3c3c3 0px 0px 20px 1px',
				}}
			>
				<div style={{ width: '50%' }}>
					<h1 style={{ fontSize: '260px', color: '#6060f0' }}>404</h1>
				</div>
				<div
					style={{
						width: '50%',
						color: '#757575',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '24px',
							alignItems: 'center',
							padding: '20px',
						}}
					>
						<h1>Страница не найдена</h1>
						<h3 style={{ fontWeight: '300', textAlign: 'center' }}>
							Страница, которую вы запрашиваете -{' '}
							<span style={{ color: '#6060f0', fontWeight: 'bold' }}>
								{pathname}
							</span>
							, не существует. Возможно, она устарела, была удалена, или был
							введен неверный адрес в адресной строке{' '}
						</h3>
						<Link to='/' style={{ width: '80%' }}>
							<button
								style={{ marginTop: '0', width: '100%' }}
								className='auth-btns'
							>
								На главную
							</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
