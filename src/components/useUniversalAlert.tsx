import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { UniversalModal } from './UniversalModal'

type UniversalAlertVariant = 'success' | 'error' | 'info'

type UniversalAlertOptions = {
	title?: string
	variant?: UniversalAlertVariant
}

type UniversalAlertState = {
	message: string
	title?: string
	variant: UniversalAlertVariant
}

const alertConfig = {
	success: {
		title: 'Готово',
		icon: <CheckCircle size={48} color='#1d7a39' />,
	},
	error: {
		title: 'Ошибка',
		icon: <AlertCircle size={48} color='#e74c3c' />,
	},
	info: {
		title: 'Внимание',
		icon: <Info size={48} color='#6060f0' />,
	},
} satisfies Record<
	UniversalAlertVariant,
	{ title: string; icon: ReactNode }
>

export function useUniversalAlert() {
	const [alert, setAlert] = useState<UniversalAlertState | null>(null)

	const closeAlert = () => setAlert(null)

	const openAlert = (message: string, options?: UniversalAlertOptions) => {
		setAlert({
			message,
			title: options?.title,
			variant: options?.variant || 'info',
		})
	}

	const config = alert ? alertConfig[alert.variant] : alertConfig.info

	const alertModal = (
		<UniversalModal
			opened={Boolean(alert)}
			onClose={closeAlert}
			title={alert?.title || config.title}
			message={alert?.message}
			icon={config.icon}
			actions={[
				{
					label: 'ОК',
					onClick: closeAlert,
				},
			]}
		/>
	)

	return { alertModal, openAlert, closeAlert }
}
