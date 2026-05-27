import { Modal } from '@mantine/core'
import type { ReactNode } from 'react'

type UniversalModalActionVariant = 'primary' | 'secondary' | 'danger'

export type UniversalModalAction = {
	label: string
	onClick: () => void
	variant?: UniversalModalActionVariant
	disabled?: boolean
}

type UniversalModalProps = {
	opened: boolean
	onClose: () => void
	title?: string
	message?: string
	children?: ReactNode
	icon?: ReactNode
	actions?: UniversalModalAction[]
	size?: 'sm' | 'md' | 'lg' | 'xl'
	withCloseButton?: boolean
	closeOnClickOutside?: boolean
}

const actionStyles: Record<UniversalModalActionVariant, React.CSSProperties> = {
	primary: {
		border: 'none',
		backgroundColor: '#6060f0',
		color: '#fff',
	},
	secondary: {
		border: '1px solid #D3E4FE',
		backgroundColor: 'transparent',
		color: '#454652',
	},
	danger: {
		border: 'none',
		backgroundColor: '#e74c3c',
		color: '#fff',
	},
}

export function UniversalModal({
	opened,
	onClose,
	title,
	message,
	children,
	icon,
	actions,
	size = 'md',
	withCloseButton = true,
	closeOnClickOutside = true,
}: UniversalModalProps) {
	const modalActions = actions?.length
		? actions
		: [{ label: 'ОК', onClick: onClose, variant: 'primary' as const }]

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			size={size}
			centered
			radius='16px'
			padding='28px'
			withCloseButton={withCloseButton}
			closeOnClickOutside={closeOnClickOutside}
		>
			<div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
				{icon && <div style={{ marginBottom: '16px' }}>{icon}</div>}

				{title && (
					<h2
						style={{
							color: '#1f1f1f',
							fontSize: '24px',
							fontWeight: 700,
							marginBottom: '12px',
						}}
					>
						{title}
					</h2>
				)}

				{message && (
					<p
						style={{
							color: '#454652',
							fontSize: '16px',
							lineHeight: 1.5,
							margin: 0,
						}}
					>
						{message}
					</p>
				)}

				{children}

				<div
					style={{
						display: 'flex',
						gap: '12px',
						justifyContent: 'center',
						marginTop: '32px',
						width: '100%',
					}}
				>
					{modalActions.map(action => {
						const variant = action.variant || 'primary'

						return (
							<button
								key={action.label}
								type='button'
								onClick={action.onClick}
								disabled={action.disabled}
								style={{
									...actionStyles[variant],
									padding: '12px 24px',
									borderRadius: '12px',
									cursor: action.disabled ? 'not-allowed' : 'pointer',
									fontSize: '14px',
									fontWeight: 500,
									opacity: action.disabled ? 0.7 : 1,
									transition: 'all 0.2s',
									width: modalActions.length > 1 ? '45%' : '60%',
								}}
							>
								{action.label}
							</button>
						)
					})}
				</div>
			</div>
		</Modal>
	)
}
