import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
	selector: 'app-layout',
	templateUrl: './layout.component.html',
	styleUrl: './layout.component.scss',
	imports: [
		SidebarComponent,
		RouterModule,
		ToolbarComponent
	],
})
export class LayoutComponent implements OnInit {
	
	constructor(
		private readonly _authenticationService: AuthenticationService
	) { }

	ngOnInit(): void {
		this._authenticationService.init();
	}
}