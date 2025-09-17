import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from "primeng/datepicker";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { AlertType } from '../../enums/alert-type';
import { AppointmentSituation } from '../../enums/appointment-situation';
import { Appointment } from '../../models/appointments';
import { Client } from '../../models/client';
import { HealthProfessional } from '../../models/health-professional';
import { MedicalInsurance } from '../../models/medical-insurance';
import { Partner } from '../../models/partner';
import { Procedure } from '../../models/procedure';
import { Service } from '../../models/service';
import { AlertService } from '../../services/alert.service';
import { AppointmentService } from '../../services/appointment.service';
import { AuthenticationService } from '../../services/authentication.service';
import { MedicalInsuranceService } from '../../services/medical-insurance.service';
import { AppointmentSituationUtils } from '../../utils/appointment-situation.util';
import { FormUtils } from '../../utils/form.util';
import { OperatorUtils } from '../../utils/operator.util';
import { DialogClientSelectionComponent } from '../dialog-client-selection/dialog-client-selection.component';
import { DialogProcedureSelectionComponent } from '../dialog-procedure-selection/dialog-procedure-selection.component';
import { HintComponent } from "../hint/hint.component";

@Component({
    selector: 'app-dialog-appointment',
    templateUrl: './dialog-appointment.component.html',
    styleUrl: './dialog-appointment.component.scss',
    imports: [
		ButtonModule,
		FormsModule,
		InputGroupModule,
		InputGroupAddonModule,
		InputNumberModule,
		InputTextModule,
		SelectModule,
		ReactiveFormsModule,
		DatePicker,
		HintComponent,
		InputNumber
	],
})
export class DialogAppointmentComponent implements OnInit {
	
	form!: FormGroup;
	appointment!: Appointment;
	healthProfessional!: HealthProfessional;
	partner!: Partner;

	medicalInsurancesOptions!: Array<SelectItem>;
	situationOptions!: Array<SelectItem>;

	selectedClient!: Client | undefined;
	selectedMedicalInsurance!: MedicalInsurance | undefined;
	selectedProcedure!: Procedure | Service | undefined;

	isSubmitting: boolean = false;
	isSearching: boolean = false;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _appointmentService: AppointmentService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _dialogConfig: DynamicDialogConfig,
		private readonly _dialogRef: DynamicDialogRef,
		private readonly _dialogService: DialogService,
		private readonly _formBuilder: FormBuilder,
		private readonly _medicalInsuranceService: MedicalInsuranceService,
	) { }

	async ngOnInit(): Promise<void> {
		this.appointment = this._dialogConfig.data['appointment'];
		this.healthProfessional = this._dialogConfig.data['healthProfessional'];

		if (!this.healthProfessional) {
			this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Nenhum profissional de saúde selecionado!');
			this._dialogRef.close({ change: false });
		}

		if (this.appointment) {
			const { client, medicalInsurance, procedure, service } = this.appointment;
			this.selectedClient = client;
			this.selectedMedicalInsurance = medicalInsurance;
			this.selectedProcedure = procedure || service;				
		}

		this.situationOptions = Object.values(AppointmentSituation).map(value => ({
			label: AppointmentSituationUtils.getFriendlyName(value),
			value: value
		}));

		await this._fetchData();
		this._buildForm();
	}

	getErrorMessage(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.getErrorMessage(form, controlName);
    }

    hasError(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.hasError(form, controlName);
    }

	isAppointmentConcluded() {
		return this.appointment && this.appointment.situation === AppointmentSituation.CONCLUDED;
	}

    onClose() {
        this._dialogRef.close({ change: false });
    }

	onMedicalInsuranceChange(event: any) {
		this.selectedMedicalInsurance = event.value;
		this.selectedProcedure = undefined;
	}

	onSelectClientPress() {

		this._dialogService.open(DialogClientSelectionComponent, {
			draggable: true,
			modal: true,
			header: 'Seleção de Paciente',
			closable: true,
			closeOnEscape: false,
			styleClass: 'dialog-client-selection',
		})
		.onClose.subscribe((result) => {
			if (result && result.client) {
				const { client } = result;
				this.form.get('client')?.patchValue(client);
				this.selectedClient = client;
			}
		});
	}

	onSelectProcedurePress() {

		this._dialogService.open(DialogProcedureSelectionComponent, {
			draggable: true,
			modal: true,
			header: 'Seleção de Procedimento',
			closable: true,
			closeOnEscape: false,
			styleClass: 'dialog-procedure-selection',
			data: {
				healthProfessional: this.healthProfessional,
				medicalInsurance: this.selectedMedicalInsurance,
				partner: this.partner
			}
		})
		.onClose.subscribe((result) => {
			if (result && result.procedure) {
				const { procedure } = result;

				if (procedure.type === 'PROCEDURE') {
					this.form.get('procedure')?.patchValue(procedure);
				}

				if (procedure.type === 'SERVICE') {
					this.form.get('service')?.patchValue(procedure);
				}
				
				this.form.get('value')?.patchValue(procedure.value);
				this.selectedProcedure = result.procedure;
			}
		});
	}

	async onSubmit() {

		if (this.form.invalid) {
			FormUtils.markAsTouched(this.form);
			FormUtils.goToInvalidFields();
			return;
		}

		this.isSubmitting = true;
		await OperatorUtils.delay(500);
	
		try {

			const time = (this.form.get('time')?.value as Date).toLocaleTimeString();
			
			const appointment: Appointment = {
				...(this.appointment || {}),
				...this.form.getRawValue(),
				location: {
					...this.partner.address,
					id: undefined
				},
				partner: {
					id: this.partner.id
				},
				time: time
			}

			if (appointment.id) {
				await this._appointmentService.update(appointment);
			} else {
				await this._appointmentService.save(appointment);
			}

			this._dialogRef.close({ change: true });
		} finally {
			this.isSubmitting = false;
		}
	}

	private _buildForm() {

		this.form = this._formBuilder.group({
			service: [
				this.appointment?.service,
				[Validators.nullValidator]
			],
			procedure: [
				this.appointment?.procedure,
				[Validators.nullValidator]
			],
			value: [
				{
					disabled: true,
					value: this.appointment?.value,
				},
				[Validators.required, Validators.min(0)]
			],
			client: [
				this.appointment?.client,
				[Validators.required]
			],
			medicalInsurance: [
				this.appointment?.medicalInsurance,
				[Validators.nullValidator]
			],
			date: [
				this.appointment?.date ? new Date(this.appointment.date + 'T00:00:00') : null,
				[Validators.required]
			],
			time: [
				this.appointment?.time ? new Date(this.appointment.date + 'T' + this.appointment.time) : null,
				[Validators.required]
			],
			situation: [
				this.appointment?.situation || AppointmentSituation.PENDING,
				[Validators.nullValidator]
			],
			healthProfessional: [
				{
					value: this.healthProfessional,
					disabled: true
				},
				[Validators.required]
			]
		});

		if (this.appointment && this.appointment.situation === AppointmentSituation.CONCLUDED) {
			this.form.disable({ emitEvent: false });
		}
	}

	private async _fetchData() {
		this.partner = await this._authenticationService.retrieveUser();
		
		const medicalInsurancesPage = await this._medicalInsuranceService.search(-1, -1, 'name', 'asc', {
			partnerId: this.partner.id
		});

		this.medicalInsurancesOptions = medicalInsurancesPage.content.map(medicalInsurance => ({
			label: medicalInsurance.name,
			value: medicalInsurance
		}));
	}
}
