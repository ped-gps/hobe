import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-breadcrumb',
	templateUrl: './breadcrumb.component.html',
	styleUrls: ['./breadcrumb.component.scss'],
	imports: [
		BreadcrumbModule
	]
})
export class BreadcrumbComponent implements OnInit {

	public breadcrumbItems: Array<MenuItem> = [];
	public home: MenuItem | undefined;

	constructor(
		private readonly _router: Router,
	) { }

	ngOnInit(): void {
		
		this.home = { icon: 'pi pi-home', routerLink: '/' };
		this.updateBreadcrumb();

		this._router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.updateBreadcrumb();
			});
	}

	private updateBreadcrumb(): void {

		const urlSegments = this._router.url.split(/[/#]/).filter(segment => segment);
		
		this.breadcrumbItems = [];
		let accumulatedPath = '';

		for (const segment of urlSegments) {
			accumulatedPath += `/${segment}`;

			if (segment === 'appointments') {
				this.breadcrumbItems.push({
					label: 'Agendamentos',
					routerLink: accumulatedPath,
				});
			} 

			else if (urlSegments.includes('appointments') && segment !== 'appointments') {
				this.breadcrumbItems.push({
					label: 'Detalhes do agendamento',
				});
			}

			else if (segment === 'chats') {
				this.breadcrumbItems.push({
					label: 'Chats',
					routerLink: accumulatedPath,
				});
			} 

			else if (urlSegments.includes('chats') && segment !== 'chats') {
				this.breadcrumbItems.push({
					label: 'Detalhes do chat',
				});
			}

			else if (segment === 'followers') {
				this.breadcrumbItems.push({
					label: 'Seguidores',
					routerLink: accumulatedPath,
				});
			} 
			
			else if (segment === 'marketplace') {
				this.breadcrumbItems.push({
					label: 'Marketplace',
					routerLink: accumulatedPath,
				});
			} 
			
			else if (segment === 'products') {
				this.breadcrumbItems.push({
					label: 'Produtos',
					routerLink: accumulatedPath,
				});
			} 

			else if (segment === 'publications') {
				this.breadcrumbItems.push({
					label: 'Publicações',
					routerLink: accumulatedPath,
				});
			} 

			else if (urlSegments.includes('products') && segment !== 'products') {
				const existingProducts = this.breadcrumbItems.find(item => item.label === 'Produtos');
				if (!existingProducts) {
					this.breadcrumbItems.push({
						label: 'Produtos',
						routerLink: '/marketplace/products',
					});
				}
				
				const existingProductDetail = this.breadcrumbItems.find(item => item.label === 'Detalhes do produto');
				if (!existingProductDetail) {
					this.breadcrumbItems.push({
						label: 'Detalhes do produto',
						routerLink: accumulatedPath,
					});
				}
				
				if (urlSegments.includes('update')) {
					const existingEditProduct = this.breadcrumbItems.find(item => item.label === 'Editar produto');
					if (!existingEditProduct) {
						this.breadcrumbItems.push({
							label: 'Editar produto',
						});
					}
				}
			}

			else if (segment === 'profile') {
				this.breadcrumbItems.push({
					label: 'Perfil',
					routerLink: accumulatedPath,
				});
			} 
			
			else if (segment === 'services') {
				this.breadcrumbItems.push({
					label: 'Serviços',
					routerLink: accumulatedPath,
				});
			} 

			else if (urlSegments.includes('services') && segment !== 'services') {
				const existingServices = this.breadcrumbItems.find(item => item.label === 'Serviços');
				if (!existingServices) {
					this.breadcrumbItems.push({
						label: 'Serviços',
						routerLink: '/marketplace/services',
					});
				}
				
				const existingServiceDetail = this.breadcrumbItems.find(item => item.label === 'Detalhes do serviço');
				if (!existingServiceDetail) {
					this.breadcrumbItems.push({
						label: 'Detalhes do serviço',
						routerLink: accumulatedPath,
					});
				}
				
				if (urlSegments.includes('update')) {
					const existingEditService = this.breadcrumbItems.find(item => item.label === 'Editar serviço');
					if (!existingEditService) {
						this.breadcrumbItems.push({
							label: 'Editar serviço',
						});
					}
				}
			}
			
			else if (segment === 'orders') {
				this.breadcrumbItems.push({
					label: 'Pedidos',
					routerLink: accumulatedPath,
				});
			} 
			
			else if (urlSegments.includes('orders') && 
				segment !== 'orders' && segment !== 'new' && 
				segment !== 'shipped' && segment !== 'concluded'
			) {
				this.breadcrumbItems.push({
					label: 'Detalhes do pedido',
				});
			}
		}
	}
}