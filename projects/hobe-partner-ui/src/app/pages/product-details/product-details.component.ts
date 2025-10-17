import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { MenuModule } from 'primeng/menu';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';

import {
	AlertService,
	Comment,
	LoadingComponent,
	OperatorUtils,
	PageHeaderComponent,
	Product,
	ProductService,
	Route
} from '@hobe/shared';

@Component({
	selector: 'app-product-details',
	templateUrl: './product-details.component.html',
	styleUrl: './product-details.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		GalleriaModule,
		MenuModule,
		PageHeaderComponent,
		RatingModule,
		TagModule,
		LoadingComponent,
	],
})
export class ProductDetailsComponent implements OnInit {
	product!: Product;
	productOptions!: Array<MenuItem>;
	comments!: Array<Comment>;

	isLoading: boolean = false;

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _alertService: AlertService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _productService: ProductService,
		private readonly _router: Router,
	) {}

	ngOnInit(): void {
		this.productOptions = [
			{
				label: 'Opções',
				items: [
					{
						label: 'Editar',
						icon: 'pi pi-pen-to-square',
						command: () => this._handleUpdate(),
					},
					{
						label: 'Excluir',
						icon: 'pi pi-trash',
						command: () => this._handleDelete(),
					},
				],
			},
		];

		this._fetchData();
	}

	private async _fetchData() {
		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			const id = this._activatedRoute.snapshot.paramMap.get('id');

			if (id) {
				this.product = await this._productService.findById(id);
			}
		} finally {
			this.isLoading = false;
			this._changeDetector.markForCheck();
		}
	}

	private async _handleDelete() {
		const confirmed = await this._alertService.confirmMessage(
			`Tem certeza que deseja excluir o produto?`
        );

        if (confirmed && this.product?.id) {
            await this._productService.delete(this.product.id);
            this._router.navigate([Route.MARKETPLACE]);
        }
	}

	private _handleUpdate() {
		const route = Route.PRODUCT_UPDATE.replace(':id', this.product.id!);
		this._router.navigate([route]);
	}
}
