import { Routes } from '@angular/router';

import { authenticationGuard, Route } from '@hobe/shared';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'sign-in',
		pathMatch: 'full',
	},
	{
		path: Route.CALLBACK,
		loadComponent: () =>
			import(
				'./pages/mercado-pago-callback/mercado-pago-callback.component'
			).then((m) => m.MercadoPagoCallbackComponent),
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
		path: '',
		loadComponent: () =>
			import('@hobe/shared').then((m) => m.LayoutComponent),
		canActivate: [authenticationGuard],
		children: [
			{
				path: Route.CHAT,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ChatsComponent),
			},
			{
				path: Route.CHATS,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ChatsComponent),
			},
			{
				path: Route.DASHBOARD,
				loadComponent: () =>
					import('./pages/dashboard/dashboard.component').then(
						(m) => m.DashboardComponent,
					),
			},
			{
				path: Route.FOLLOWERS,
				loadComponent: () =>
					import('./pages/followers/followers.component').then(
						(m) => m.FollowersComponent,
					),
			},
			{
				path: Route.MARKETPLACE,
				loadComponent: () =>
					import('./pages/marketplace/marketplace.component').then(
						(m) => m.MarketplaceComponent,
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
				path: Route.PRODUCT_REGISTER,
				loadComponent: () => 
					import('./pages/product-form/product-form.component').then(
						(m) => m.ProductFormComponent,
					),
			},
			{
				path: Route.PRODUCT_DETAILS,
				loadComponent: () =>
					import('./pages/product-details/product-details.component').then(
						(m) => m.ProductDetailsComponent,
					),
			},
			{
				path: Route.PRODUCT_UPDATE,
				loadComponent: () =>
					import('./pages/product-form/product-form.component').then(
						(m) => m.ProductFormComponent,
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
				path: Route.PUBLICATIONS,
				loadComponent: () =>
					import('./pages/publications/publications.component').then(
						(m) => m.PublicationsComponent,
					),
			},
			{
				path: Route.SCHEDULE,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ScheduleComponent),
			},
		],
	},
];
