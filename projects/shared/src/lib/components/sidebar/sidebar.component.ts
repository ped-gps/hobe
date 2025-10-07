import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { APP_ENV } from '@hobe/shared';
import { Route } from '../../enums/route';
import { AuthenticationService } from '../../services/authentication.service';
import { App } from './../../enums/app';
import { UserProfile } from './../../enums/user-profile';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
	imports: [RouterModule],
})
export class SidebarComponent implements OnInit {
	public profile!: UserProfile;

	public Route = Route;
	public UserProfile = UserProfile;
	public host = window.location.host;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		@Inject(APP_ENV) private readonly _env: any,
	) {}

	async ngOnInit(): Promise<void> {
		this._authenticationService
			.getAuthentication()
			.subscribe(async (authentication) => {
				if (authentication) {
					const { profile } =
						await this._authenticationService.retrieveUser();
					this.profile = profile;
					this._changeDetector.detectChanges();
				}
			});
	}

	get app() {
		return this._env?.APP ?? undefined;
	}

	hasChats() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_COMMERCIAL
		);
	}

	hasDashboard() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.HEALTH_PROFESSIONAL) &&
			(this.app === App.PARTNER_CLINIC ||
				this.app === App.PARTNER_COMMERCIAL ||
				this.app === App.PROFESSIONAL)
		);
	}

	hasFollowers() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_COMMERCIAL
		);
	}

	hasMarketplace() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_COMMERCIAL
		);
	}

	hasMedicalInsurances() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_CLINIC
		);
	}

	hasOrders() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_COMMERCIAL
		);
	}

	hasPatients() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.RECEPTIONIST) &&
			(this.app === App.PARTNER_CLINIC || this.app === App.RECEPTIONIST)
		);
	}

	hasProcedures() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_CLINIC
		);
	}

	hasProfessionals() {
		return (
			this.profile === UserProfile.PARTNER &&
			(this.app === App.PARTNER_CLINIC ||
				this.app === App.PARTNER_COMMERCIAL)
		);
	}

	hasPublications() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.app === App.PARTNER_COMMERCIAL
		);
	}

	hasSchedule() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.HEALTH_PROFESSIONAL ||
				this.profile === UserProfile.RECEPTIONIST) &&
			(this.app === App.PARTNER_CLINIC ||
				this.app === App.PARTNER_COMMERCIAL ||
				this.app === App.PROFESSIONAL ||
				this.app === App.RECEPTIONIST)
		);
	}
}
