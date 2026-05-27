import { Modal } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'

type DeleteMachineModalProps = {
	opened: boolean
	onClose: () => void
	onConfirm: () => void
	machineName: string
}

export function DeleteMachineModal({
	opened,
	onClose,
	onConfirm,
	machineName,
}: DeleteMachineModalProps) {
	return (
		<Modal opened={opened} onClose={onClose} size='lg' centered>
			<div style={{ textAlign: 'center', padding: '20px 0' }}>
				<AlertTriangle
					size={48}
					color='#e74c3c'
					style={{ marginBottom: '16px' }}
				/>

				<p style={{ color: '#454652', marginBottom: '24px', fontSize: '16px' }}>
					Вы действительно хотите удалить <br />
					<h3 style={{ margin: '8px 0' }}>«{machineName}»?</h3>
				</p>

				<div
					style={{
						display: 'flex',
						gap: '12px',
						justifyContent: 'center',
						marginTop: '48px',
						width: '100%',
					}}
				>
					<button
						onClick={onClose}
						style={{
							padding: '10px 24px',
							borderRadius: '8px',
							border: '1px solid #D3E4FE',
							backgroundColor: 'transparent',
							color: '#454652',
							cursor: 'pointer',
							fontSize: '14px',
							fontWeight: '500',
							transition: 'all 0.2s',
							width: '45%',
						}}
					>
						Отмена
					</button>

					<button
						onClick={onConfirm}
						style={{
							padding: '10px 24px',
							borderRadius: '8px',
							border: 'none',
							backgroundColor: '#e74c3c',
							color: 'white',
							cursor: 'pointer',
							fontSize: '14px',
							fontWeight: '500',
							transition: 'all 0.2s',
							width: '45%',
						}}
						onMouseEnter={e => {
							e.currentTarget.style.backgroundColor = '#c0392b'
						}}
						onMouseLeave={e => {
							e.currentTarget.style.backgroundColor = '#e74c3c'
						}}
					>
						Да, удалить
					</button>
				</div>
			</div>
		</Modal>
	)
}
