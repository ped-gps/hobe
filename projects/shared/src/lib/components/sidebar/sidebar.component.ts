import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Route } from '../../enums/route';
import { AuthenticationService } from '../../services/authentication.service';
import { UserProfile } from './../../enums/user-profile';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
  	imports: [
		RouterModule
	],
})
export class SidebarComponent implements OnInit {
	
	public profile!: UserProfile;
	
	public Route = Route;
	public UserProfile = UserProfile;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef
	) {}

	async ngOnInit(): Promise<void> {

		this._authenticationService.getAuthentication().subscribe(async authentication => {

			if (authentication) {
				const { profile } = await this._authenticationService.retrieveUser();
				this.profile = profile;
				this._changeDetector.detectChanges();
			}
		});
	}

	hasDashboard() {
		return (
			this.profile === UserProfile.PARTNER ||
			this.profile === UserProfile.HEALTH_PROFESSIONAL
		);
	}

	hasSchedule() {
		return (
			this.profile === UserProfile.PARTNER ||
			this.profile === UserProfile.HEALTH_PROFESSIONAL || 
			this.profile === UserProfile.RECEPTIONIST
		)
	}

	hasPatients() {
		return (
			this.profile === UserProfile.PARTNER ||
			this.profile === UserProfile.RECEPTIONIST
		);
	}

	hasProfessionals() {
		return (
			this.profile === UserProfile.PARTNER
		);
	}

	hasProcedures() {
		return (
			this.profile === UserProfile.PARTNER
		);
	}

	hasMedicalInsurances() {
		return (
			this.profile === UserProfile.PARTNER
		);
	}
}