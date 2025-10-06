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
		path: '',
		loadComponent: () =>
			import('@hobe/shared').then((m) => m.LayoutComponent),
		canActivate: [authenticationGuard],
		children: [
			{
				path: Route.CLIENTS,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ClientsComponent),
			},
			{
				path: Route.SCHEDULE,
				loadComponent: () =>
					import('@hobe/shared').then((m) => m.ScheduleComponent),
			},
		],
	},
];
