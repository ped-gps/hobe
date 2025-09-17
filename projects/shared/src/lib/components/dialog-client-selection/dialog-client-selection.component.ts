import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { AlertType } from '../../enums/alert-type';
import { Client } from '../../models/client';
import { CpfCnpjPipe } from '../../pipes/cpf-cnpj.pipe';
import { PhonePipe } from "../../pipes/phone.pipe";
import { AlertService } from '../../services/alert.service';
import { ClientService } from '../../services/client.service';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
    selector: 'app-dialog-client-selection',
    templateUrl: './dialog-client-selection.component.html',
    styleUrl: './dialog-client-selection.component.scss',
    imports: [
		ButtonModule,
		CpfCnpjPipe,
		FormsModule,
		IconFieldModule,
		InputIconModule,
		InputTextModule,
		TableModule,
		PhonePipe,
	],
})
export class DialogClientSelectionComponent implements OnInit {

	clients!: Array<Client>;
	isLoading: boolean = false;

	textFilter!: string;
	selectedClient!: Client;

	page: number = 0;
    size: number = 10;
    sort: string = 'name';
    direction: string = 'asc';
    totalElements: number = 0;

	private _time!: any;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _clientService: ClientService,
		private readonly _dialogRef: DynamicDialogRef,
	) {}

	ngOnInit(): void {
		this._retrieveClients();
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

	onSubmit() {
		
		if (!this.selectedClient) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum paciente selecionado!');
			return;
		}

		this._dialogRef.close({ client: this.selectedClient });
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
					name: this.textFilter || ''
				}
			);

			this.clients = clientsPage.content;
			this.totalElements = clientsPage.page.totalElements;
			this._changeDetector.detectChanges();
		} finally {
			this.isLoading = false;
		}
	}
}
