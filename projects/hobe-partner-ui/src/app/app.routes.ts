import { Routes } from '@angular/router';

import { Route } from '@hobe/shared';

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
];
