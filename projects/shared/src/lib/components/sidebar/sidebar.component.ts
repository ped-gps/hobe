import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Route } from '../../enums/route';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
  	imports: [
		RouterModule
	],
})
export class SidebarComponent implements OnInit {
	
	public Route = Route;
	public profile!: string;

	constructor(
		private readonly _authenticationService: AuthenticationService
	) {}

	ngOnInit(): void {
		
	}
}