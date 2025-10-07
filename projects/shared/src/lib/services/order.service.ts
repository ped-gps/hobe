import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { OrderStatus } from '../enums/order-status';
import { Order } from '../models/order';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root'
})
export class OrderService extends AbstractService<Order> {

	protected _baseURL = environment.API + '/orders';

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

	override search(
		page: number, 
		size: number, 
		sort: string, 
		direction: string, 
		filters: {
			partnerId: string,
			status?: Array<OrderStatus>
		}
	): Promise<Page<Order>> {
		return super.search(page, size, sort, direction, filters);
	}
}
