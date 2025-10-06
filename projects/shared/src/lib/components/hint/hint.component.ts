import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-hint',
	templateUrl: './hint.component.html',
	styleUrl: './hint.component.scss',
	imports: [CommonModule],
})
export class HintComponent {
	@Input({ required: true }) visible!: boolean;
	@Input({ required: true }) message!: string;
	@Input({ required: true }) isError!: boolean;
}
