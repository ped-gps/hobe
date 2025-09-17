import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Route } from '../enums/route';
import { AuthenticationService } from '../services/authentication.service';

export const authenticationGuard: CanActivateFn = (route, state) => {

	const authenticationService = inject(AuthenticationService);
	const router = inject(Router);

	if (authenticationService.isAuthenticated()) {
		return true;
	}
	
	router.navigate([Route.SIGN_IN]);
	return false;
};