import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { AlertType } from '../../enums/alert-type';
import { ProcedureSource } from '../../enums/procedure-source';
import { HealthProfessional } from '../../models/health-professional';
import { MedicalInsurance } from '../../models/medical-insurance';
import { Partner } from '../../models/partner';
import { Procedure } from '../../models/procedure';
import { Service } from '../../models/service';
import { AlertService } from '../../services/alert.service';
import { ProcedureService } from '../../services/procedure.service';
import { ServiceService } from '../../services/service.service';
import { OperatorUtils } from '../../utils/operator.util';
import { ProcedureSourceUtils } from '../../utils/procedure-source.util';

@Component({
    selector: 'app-dialog-procedure-selection',
    templateUrl: './dialog-procedure-selection.component.html',
    styleUrl: './dialog-procedure-selection.component.scss',
    imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		IconFieldModule,
		InputIconModule,
		InputTextModule,
		SelectModule,
		TableModule
	],
})
export class DialogProcedureSelectionComponent implements OnInit {
	
	isLoading: boolean = false;
	healthProfessional!: HealthProfessional;
	medicalInsurance!: MedicalInsurance;
	partner!: Partner;
	procedures!: Array<Procedure | Service>;
	
	textFilter!: string;
	selectedProcedure!: Procedure | Service;
	selectedProcedureSource: ProcedureSource = ProcedureSource.CLINIC;
	procedureSourceOptions!: Array<SelectItem>;

	page: number = 0;
	size: number = 10;
	sort: string = 'name';
	direction: string = 'asc';
	totalElements: number = 0;

	private _time!: any;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _dialogConfig: DynamicDialogConfig,
		private readonly _dialogRef: DynamicDialogRef,
		private readonly _procedureService: ProcedureService,
		private readonly _serviceService: ServiceService,
	) {}

	ngOnInit(): void {
		this.partner = this._dialogConfig.data['partner'];
		this.healthProfessional = this._dialogConfig.data['healthProfessional'];
		this.medicalInsurance = this._dialogConfig.data['medicalInsurance'];

		if (!this._checkDialogParams()) {
			this._dialogRef.close();
			return;
		}

		this.procedureSourceOptions = Object.values(ProcedureSource).map(
            (value) => ({
                label: ProcedureSourceUtils.getFriendlyName(value),
                value: value,
            })
        );

		this._retrieveProcedures();
	}

	onInputChange() {
        clearTimeout(this._time);

        this._time = setTimeout(() => {
            this._retrieveProcedures();
        }, 500);
    }

    onPageChange(event: any) {
        this.page = event.first / event.rows;
        this._retrieveProcedures();
    }

    onSortChange(event: any) {
        this.sort = event.field;
        this.direction = event.order > 0 ? 'asc' : 'desc';
        this._retrieveProcedures();
    }
	
	onSourceChange() {
        this._retrieveProcedures();
    }

	onSubmit() {
		
		if (!this.selectedProcedure) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum procedimento selecionado!');
			return;
		}

		this._dialogRef.close({ procedure: this.selectedProcedure });
	}

	private _checkDialogParams() {
		
		if (!this.partner) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum parceiro informado!');
			return false;
		}

		if (!this.medicalInsurance) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum convênio informado!');
			return false;
		}

		if (!this.healthProfessional) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum profissional de saúde informado!');
			return false;
		}

		return true;
	}

	private async _retrieveProcedures() {

		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {

			if (this.selectedProcedureSource === ProcedureSource.CLINIC) {

				const proceduresPage = await this._procedureService.search(
					this.page,
					this.size,
					this.sort,
					this.direction,
					{
						name: this.textFilter || '',
						partnerId: this.partner.id,
						medicalInsuranceId: this.medicalInsurance.id,
						healthProfessionalId: this.healthProfessional.id
					}
				);

				this.procedures = proceduresPage.content.map((procedure) => ({
                    ...procedure,
                    type: 'PROCEDURE',
                }));
                this.totalElements = proceduresPage.page.totalElements;
			}

			if (this.selectedProcedureSource === ProcedureSource.MARKETPLACE) {

				const servicesPage = await this._serviceService.search(
					this.page,
					this.size,
					this.sort,
					this.direction,
					{
						name: this.textFilter || '',
						partnerId: this.partner.id,
						medicalInsuranceId: this.medicalInsurance.id,
						healthProfessionalId: this.healthProfessional.id
					}
				);

				this.procedures = servicesPage.content.map((service) => ({
                    ...service,
                    type: 'SERVICE',
                }));
                this.totalElements = servicesPage.page.totalElements;
			}
		} finally {
			this.isLoading = false;
		}
	}
}