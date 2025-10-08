import { Routes } from '@angular/router';

import { authenticationGuard, Route } from '@hobe/shared';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'sign-in',
		pathMatch: 'full',
	},
	{
		path: Route.SIGN_IN,
		loadComponent: () =>
			import('./pages/sign-in/sign-in.component').then(
				(m) => m.SignInComponent,
			),
	},
	{
		path: Route.SIGN_UP,
		loadComponent: () =>
			import('./pages/sign-up/sign-up.component').then(
				(m) => m.SignupComponent,
			),
	},
	{
		path: Route.CALLBACK,
		loadComponent: () =>
			import(
				'./pages/mercado-pago-callback/mercado-pago-callback.component'
			).then((m) => m.MercadoPagoCallbackComponent),
	},
	{
		path: '',
		loadComponent: () => import('@hobe/shared').then(m => m.LayoutComponent),
		canActivate: [authenticationGuard],
		children: [
			{
				path: Route.CHAT,
				loadComponent: () => import('@hobe/shared').then(m => m.ChatsComponent)
			},
			{
				path: Route.CHATS,
				loadComponent: () => import('@hobe/shared').then(m => m.ChatsComponent)
			},
			{
				path: Route.DASHBOARD,
				loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			{
				path: Route.FOLLOWERS,
				loadComponent: () =>
					import('./pages/followers/followers.component').then(
						(m) => m.FollowersComponent,
					),
			},
			{
				path: Route.ORDER,
				loadComponent: () =>
					import('./pages/order/order.component').then(
						(m) => m.OrderComponent,
					),
			},
			{
				path: Route.ORDERS,
				loadComponent: () =>
					import('./pages/orders/orders.component').then(
						(m) => m.OrdersComponent,
					),
			},
			{
				path: Route.PROFESSIONALS,
				loadComponent: () =>
					import('@hobe/shared').then(
						(m) => m.ProfessionalsComponent,
					),
			},
			{
				path: Route.SCHEDULE,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ScheduleComponent),
			},
		]
	}
];
