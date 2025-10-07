import { Component, Input } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
	selector: 'app-page-header',
	templateUrl: './page-header.component.html',
	styleUrl: './page-header.component.scss',
	imports: [
		BreadcrumbComponent
	]
})
export class PageHeaderComponent {
	@Input({ required: true }) title!: string;
}