import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';

import { AuthenticationService, OperatorUtils, Product, ProductService, Route, User } from '@hobe/shared';

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrl: './products.component.scss',
	imports: [
		ButtonModule,
		CommonModule, 
		FormsModule, 
		IconFieldModule, 
		InputIconModule, 
		InputTextModule, 
		RatingModule,
		TableModule
	],
})
export class ProductsComponent implements OnInit {

	user!: User;
	searchText: string = '';
	products: Array<Product> = [];

	page: number = 0;
	size: number = 10;
	sort: string = 'createdDate';
	direction: string = 'asc';
	totalElements: number = 0;

	isLoading: boolean = false;
	isRefreshing: boolean = false;

	private _time!: any;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _productService: ProductService,
		private readonly _router: Router,
	) {}

	ngOnInit(): void {
		this._fetchData();
	}

	getPicture(item: Product) {

        if (item.pictures && item.pictures.length > 0) {
            return item.pictures.sort((a, b) => a.position - b.position)[0].path;
        }

        return 'assets/svgs/no-image.svg';
    }

	onAddPress() {
		this._router.navigate([Route.PRODUCT_REGISTER]);
	}

	onInput() {
		clearTimeout(this._time);

        this._time = setTimeout(() => {
            this.page = 0;
            this._retrieveProducts();
        }, 500);
	}

	onProductPress(product: Product) {
		const route = Route.PRODUCT_DETAILS.replace(':id', product.id!);
		this._router.navigate([route]);
	}

	async onPageChange(event: any) {
		this.page = event.first / event.rows;
		this._retrieveProducts();
	}

	async onSortChange(event: any) {
		this.sort = event.field;
		this.direction = event.order === 1 ? 'asc' : 'desc';
		this._retrieveProducts();
	}

	private async _fetchData() {

		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			this.user = await this._authenticationService.retrieveUser();
			this._retrieveProducts();
		} finally {
			this.isLoading = false;
		}
	}

	private async _retrieveProducts() {

		const { content, page } = await this._productService.search(this.page, this.size, this.sort, this.direction, {
			partnerId: this.user.id!,
			name: this.searchText
		});

		this.products = content;
		this.totalElements = page.totalElements;
		this._changeDetector.markForCheck();
	}
}