import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-no-content',
	templateUrl: './no-content.component.html',
	styleUrl: './no-content.component.scss',
})
export class NoContentComponent {
	@Input({ required: true }) type: 'DEFAULT' | 'PUBLICATION' = 'DEFAULT';
}
