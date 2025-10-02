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

import { DialogMedicalInsuranceComponent } from '../../components/dialog-medical-insurance/dialog-medical-insurance.component';
import { MedicalInsurance } from '../../models/medical-insurance';
import { Partner } from '../../models/partner';
import { PhonePipe } from '../../pipes/phone.pipe';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { MedicalInsuranceService } from '../../services/medical-insurance.service';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
	selector: 'app-medical-insurances',
	templateUrl: './medical-insurances.component.html',
	styleUrl: './medical-insurances.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		InputTextModule,
        IconFieldModule,
        InputIconModule,
		MenuModule,
		TableModule,
		PhonePipe
	],
})
export class MedicalInsurancesComponent implements OnInit {
	
	partner!: Partner;
    medicalInsurances: Array<MedicalInsurance> = [];
    isLoading: boolean = false;
    isSubmitting: boolean = false;

	textFilter!: string;
	selectedMedicalInsurance!: MedicalInsurance;
	medicalInsuranceMenuOptions: Array<MenuItem> = [];

	page: number = 0;
    size: number = 10;
    sort: string = 'name';
    direction: string = 'asc';
    totalElements: number = 0;

	private _time!: any;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _dialogService: DialogService,
		private readonly _medicalInsuranceService: MedicalInsuranceService
	) {}

	ngOnInit(): void {
	
		this.medicalInsuranceMenuOptions = [
            {
                label: 'Editar',
                command: () => this._onUpdateMedicalInsurance(),
            },
            {
                label: 'Excluir',
                command: () => this._onDeleteMedicalInsurance(),
            },
        ];

        this._fetchData();
	}

	onAddMedicalInsurance() {
		this._showDialogMedicalInsurance();
	}

	onInputChange() {
        clearTimeout(this._time);

        this._time = setTimeout(() => {
            this._retrieveMedicalInsurances();
        }, 500);
    }

	onPageChange(event: any) {
        this.page = event.first / event.rows;
        this._retrieveMedicalInsurances();
    }

    onSortChange(event: any) {
        this.sort = event.field;
        this.direction = event.order > 0 ? 'asc' : 'desc';
        this._retrieveMedicalInsurances();
    }

	private async _fetchData() {
		this.partner = await this._authenticationService.retrieveUser();
		this._retrieveMedicalInsurances();
	}

	private async _onDeleteMedicalInsurance() {
		if (!this.selectedMedicalInsurance) {
			return;
		}

		const confirmation = await this._alertService.confirmMessage(
			`Deseja excluir o convênio ${
				this.selectedMedicalInsurance!.name
			}? Essa ação é irreversível!`
		);

		if (confirmation) {
			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {
				await this._medicalInsuranceService.delete(
					this.selectedMedicalInsurance!.id!
				);
				await this._retrieveMedicalInsurances();
			} finally {
				this.isSubmitting = false;
			}
		}
	}

	private _onUpdateMedicalInsurance() {
		if (!this.selectedMedicalInsurance) {
			return;
		}

		this._showDialogMedicalInsurance(this.selectedMedicalInsurance);
	}

	private async _retrieveMedicalInsurances() {

		this.isLoading = true;
        await OperatorUtils.delay(500);

		try {

			const medicalInsurancesPage = await this._medicalInsuranceService.search(
				this.page,
				this.size,
				this.sort,
				this.direction,
				{
					name: this.textFilter || undefined,
					code: this.textFilter || undefined,
					partnerId: this.partner.id
				}
			);

			this.medicalInsurances = medicalInsurancesPage.content;
			this.totalElements = medicalInsurancesPage.page.totalElements;

		} finally {
			this.isLoading = false;
			this._changeDetector.detectChanges();
		}
	}

	private _showDialogMedicalInsurance(medicalInsurance?: MedicalInsurance) {
		
		this._dialogService
			.open(DialogMedicalInsuranceComponent, {
				draggable: true,
				modal: true,
				header: 'Convênio',
				closable: true,
				closeOnEscape: false,
				data: {
					medicalInsurance: medicalInsurance,
				},
				styleClass: 'dialog-medical-insurance',
			})
			.onClose.subscribe((result) => {
				if (result && result.change) {
					this._retrieveMedicalInsurances();
				}
			});
	}
}