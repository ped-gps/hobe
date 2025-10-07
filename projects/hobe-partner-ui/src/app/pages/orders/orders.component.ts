import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

import { OrderStatus, PageHeaderComponent, OrdersListComponent } from '@hobe/shared';

@Component({
	selector: 'app-orders',
	templateUrl: './orders.component.html',
	styleUrl: './orders.component.scss',
	imports: [
		OrdersListComponent,
		PageHeaderComponent, 
		TabsModule, 
	]
})
export class OrdersComponent implements OnInit {

	public OrderStatus = OrderStatus;
	public tabIndex!: number;

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _router: Router
	) { }

	ngOnInit(): void {
		this.tabIndex = this._getTabIndex();
	}

	onTabChange(value: string | number) {

		if(value === 1) {
			this._router.navigate([], { fragment: 'new' });
		}

		if(value === 2) {
			this._router.navigate([], { fragment: 'processing'});
		}

		if(value === 3) {
			this._router.navigate([], { fragment: 'shipped'});
		}

		if(value === 4) {
			this._router.navigate([], { fragment: 'concluded'});
		}
	}

	private _getTabIndex(): number {
		const fragment = this._activatedRoute.snapshot.fragment;

		switch(fragment) {
			case 'new':
				return 1;
			case 'processing':
				return 2;
			case 'shipped':
				return 3;
			case 'concluded':
				return 4;
		}

		return 1;
	}
}
