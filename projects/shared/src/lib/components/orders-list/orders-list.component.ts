import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from "primeng/table";

import { OrderStatus } from '../../enums/order-status';
import { Route } from '../../enums/route';
import { Order } from '../../models/order';
import { Partner } from '../../models/partner';
import { AuthenticationService } from '../../services/authentication.service';
import { OrderService } from '../../services/order.service';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
	selector: 'app-orders-list',
	templateUrl: './orders-list.component.html',
	styleUrl: './orders-list.component.scss',
	imports: [
		CommonModule,
		TableModule
	]
})
export class OrdersListComponent implements OnInit {

	public orders!: Array<Order>;

	public page: number = 0;
	public size: number = 10;
	public totalElements: number = 0;
	public isRefreshing: boolean = false;

	public selectedSort: string = 'createdDate';
	public selectedDirection: string = 'asc';

	private _partner!: Partner;

	@Input({ required: true }) status!: Array<OrderStatus>;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _orderService: OrderService,
		private readonly _router: Router
	) { }

	async ngOnInit() {
		await this._fetchData();
	}

	handleOrderPress(order: Order) {
		this._router.navigate([`${Route.ORDERS}/${order.id}`]);
	}

	async onPageChange(event: any) {
		this.page = event.first / event.rows;
		await this._refreshOrders();
	}

	async onSortChange(event: any) {
		this.selectedSort = event.field;
		this.selectedDirection = event.order === 1 ? 'asc' : 'desc';
		await this._refreshOrders();
	}

	private async _fetchData() {
		this._partner = await this._authenticationService.retrieveUser();
		await this._refreshOrders();
	}

	private async _refreshOrders() {

		this.isRefreshing = true;
		await OperatorUtils.delay(500);

		try {
			const ordersPage = await this._orderService.search(this.page, this.size, this.selectedSort, this.selectedDirection, {
				partnerId: this._partner.id!,
				status: this.status,
			});

			this.orders = ordersPage.content;
			this.totalElements = ordersPage.page.totalElements;
		} finally {
			this._changeDetector.markForCheck();
			this.isRefreshing = false;
		}
	}
}
