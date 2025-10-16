import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageHeaderComponent } from "@hobe/shared";
import { TabsModule } from 'primeng/tabs';

import { ProductsComponent } from "../../components/products/products.component";

@Component({
	selector: 'app-marketplace',
	templateUrl: './marketplace.component.html',
	styleUrl: './marketplace.component.scss',
	imports: [
		CommonModule, 
		PageHeaderComponent, 
		ProductsComponent,
		TabsModule, 
	],
})
export class MarketplaceComponent {
	tabIndex: number = 0;

	onTabChange() {
	}
}
