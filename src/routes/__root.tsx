import { createRootRoute, Outlet } from '@tanstack/react-router'
import './../index.css'

const RootLayout = () => (
	<>
		<Outlet />
	</>
)

export const Route = createRootRoute({ component: RootLayout })
