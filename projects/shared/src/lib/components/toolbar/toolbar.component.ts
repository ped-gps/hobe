import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';

import { Route } from '../../enums/route';
import { HealthProfessional } from '../../models/health-professional';
import { Partner } from '../../models/partner';
import { Receptionist } from '../../models/receptionist';
import { AuthenticationService } from '../../services/authentication.service';
import { UserPictureComponent } from '../user-picture/user-picture.component';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrl: './toolbar.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		MenuModule,
		SkeletonModule,
		Menu,
		UserPictureComponent
	],
})
export class ToolbarComponent implements OnInit {

	public user!: HealthProfessional | Partner | Receptionist;
	public userMenuItems!: Array<MenuItem>;
	public isLoading: boolean = false;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _router: Router
	) { }

	ngOnInit(): void {

		this.userMenuItems = [
			{
				icon: PrimeIcons.USER,
				label: 'Perfil',
				command: () => {
					this._router.navigate([Route.PROFILE]);
				}
			},
			{
				icon: PrimeIcons.SIGN_OUT,
				label: 'Sair',
				command: async () => {
					await this._authenticationService.logout();
				}
			}
		];

		this._authenticationService.getAuthentication().subscribe(async authentication => {

			if (authentication) {
				this.user = await this._authenticationService.retrieveUser();
				this._changeDetector.detectChanges();
			}
		});
	}
}