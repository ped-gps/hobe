import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Route } from '../../enums/route';
import { AuthenticationService } from '../../services/authentication.service';
import { Subdomain } from './../../enums/subdomain';
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

	hasChats() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.host.includes(Subdomain.PARCEIRO)
		);
	}

	hasDashboard() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.HEALTH_PROFESSIONAL) &&
			(this.host.includes(Subdomain.CLINICA) ||
				this.host.includes(Subdomain.PROFISSIONAL))
		);
	}

	hasSchedule() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.HEALTH_PROFESSIONAL ||
				this.profile === UserProfile.RECEPTIONIST) &&
			(this.host.includes(Subdomain.CLINICA) ||
				this.host.includes(Subdomain.PROFISSIONAL) ||
				this.host.includes(Subdomain.RECEPCAO))
		);
	}

	hasPatients() {
		return (
			(this.profile === UserProfile.PARTNER ||
				this.profile === UserProfile.RECEPTIONIST) &&
			(this.host.includes(Subdomain.CLINICA) ||
				this.host.includes(Subdomain.RECEPCAO))
		);
	}

	hasProfessionals() {
		return (
			this.profile === UserProfile.PARTNER &&
			(this.host.includes(Subdomain.CLINICA) ||
				this.host.includes(Subdomain.PARCEIRO))
		);
	}

	hasProcedures() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.host.includes(Subdomain.CLINICA)
		);
	}

	hasMedicalInsurances() {
		return (
			this.profile === UserProfile.PARTNER &&
			this.host.includes(Subdomain.CLINICA)
		);
	}
}
