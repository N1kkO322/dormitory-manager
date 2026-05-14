import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/duties')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/duties"!</div>
}
