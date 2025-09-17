import { Routes } from '@angular/router';
import { authenticationGuard, Route, LayoutComponent } from '@hobe/shared';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
    },
    {
        path: Route.SIGN_IN,
        loadComponent: () => import('./pages/sign-in/sign-in.component').then(m => m.SignInComponent)
    },
    {
        path: '',
        loadComponent: () => import('@hobe/shared').then(m => m.LayoutComponent),
        canActivate: [authenticationGuard],
        children: [
            {
                path: Route.CLIENTS,
                loadComponent: () => import('@hobe/shared').then(m => m.ClientsComponent)
            },
            {
                path: Route.DASHBOARD,
                loadComponent: () => import('@hobe/shared').then(m => m.DashboardComponent)
            },
            {
                path: Route.PROFESSIONALS,
                loadComponent: () => import('@hobe/shared').then(m => m.ProfessionalsComponent)
            },
            {
                path: Route.PROCEDURES,
                loadComponent: () => import('@hobe/shared').then(m => m.ProceduresComponent)
            },
            {
                path: Route.SCHEDULE,
                loadComponent: () => import('@hobe/shared').then(m => m.ScheduleComponent)
            },
            {
                path: Route.MEDICAL_APPOINTMENTS_EXTRACT,
                loadComponent: () => import('@hobe/shared').then(m => m.MedicalAppointmentsExtractComponent)
            },
            {
                path: Route.MEDICAL_INSURANCES,
                loadComponent: () => import('@hobe/shared').then(m => m.MedicalInsurancesComponent)
            }
        ]
    }
];
