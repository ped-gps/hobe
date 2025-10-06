import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';

import { DialogClientComponent } from '../../components/dialog-client/dialog-client.component';
import { Client } from '../../models/client';
import { Partner } from '../../models/partner';
import { PhonePipe } from '../../pipes/phone.pipe';
import { AuthenticationService } from '../../services/authentication.service';
import { ClientService } from '../../services/client.service';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
	selector: 'app-clients',
	templateUrl: './clients.component.html',
	styleUrl: './clients.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		InputTextModule,
		IconFieldModule,
		InputIconModule,
		MenuModule,
		TableModule,
		PhonePipe,
	],
})
export class ClientsComponent implements OnInit {
	partner!: Partner;
	clients!: Array<Client>;
	isLoading: boolean = false;
	isSubmitting: boolean = false;

	textFilter!: string;
	selectedClient!: Client;
	clientMenuOptions!: Array<MenuItem>;

	page: number = 0;
	size: number = 10;
	sort: string = 'name';
	direction: string = 'asc';
	totalElements: number = 0;

	private _time!: any;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _clientService: ClientService,
		private readonly _dialogService: DialogService,
	) {}

	async ngOnInit(): Promise<void> {
		this.clientMenuOptions = [
			{
				label: 'Editar',
				command: () => this._onUpdateClient(),
			},
		];

		await this._fetchData();
	}

	onAddClient() {
		this._showDialogClient();
	}

	onInputChange() {
		clearTimeout(this._time);

		this._time = setTimeout(() => {
			this._retrieveClients();
		}, 500);
	}

	onPageChange(event: any) {
		this.page = event.first / event.rows;
		this._retrieveClients();
	}

	onSortChange(event: any) {
		this.sort = event.field;
		this.direction = event.order > 0 ? 'asc' : 'desc';
		this._retrieveClients();
	}

	private async _fetchData() {
		this.partner = await this._authenticationService.retrieveUser();
		this._retrieveClients();
	}

	private async _retrieveClients() {
		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			const clientsPage = await this._clientService.search(
				this.page,
				this.size,
				this.sort,
				this.direction,
				{
					name: this.textFilter || '',
				},
			);

			this.clients = clientsPage.content;
			this.totalElements = clientsPage.page.totalElements;
		} finally {
			this.isLoading = false;
			this._changeDetector.detectChanges();
		}
	}

	private _showDialogClient(client?: Client) {
		this._dialogService
			.open(DialogClientComponent, {
				draggable: true,
				modal: true,
				header: 'Paciente',
				closable: true,
				closeOnEscape: false,
				data: {
					client: client,
				},
				styleClass: 'dialog-client',
			})
			.onClose.subscribe((result) => {
				if (result && result.change) {
					this._retrieveClients();
				}
			});
	}

	private _onUpdateClient() {
		if (!this.selectedClient) {
			return;
		}

		this._showDialogClient(this.selectedClient);
	}
}
