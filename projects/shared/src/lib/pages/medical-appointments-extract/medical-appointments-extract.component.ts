import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
	AuthenticationService,
	DateUtils,
	HealthProfessional,
	HealthProfessionalService,
	MedicalAppointment,
	MedicalAppointmentService,
	OperatorUtils,
	Partner
} from '@hobe/shared';

@Component({
    selector: 'app-medical-appointments-extract',
    templateUrl: './medical-appointments-extract.component.html',
    styleUrl: './medical-appointments-extract.component.scss',
    imports: [
		ButtonModule,
		CommonModule,
		DatePickerModule,
		FormsModule,
		SelectModule,
		TableModule,
	],
})
export class MedicalAppointmentsExtractComponent implements OnInit {

	partner!: Partner;
	medicalAppointments: Array<MedicalAppointment> = [];
	payoutTotal: number = 0;

	healthProfessionalsOptions!: Array<SelectItem>;
	selectedHealthProfessional!: HealthProfessional;
	selectedPeriod!: Array<Date>;
	
	isLoading: boolean = false;

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _healthProfessionalService: HealthProfessionalService,
		private readonly _medicalAppointmentService: MedicalAppointmentService,
		private readonly _router: Router
	) {}

	async ngOnInit(): Promise<void> {
		const now = new Date();
        const endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
        );
        const startDate = new Date(endDate);

        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        this.selectedPeriod = [startDate, endDate];
		await this._fetchData();
	}

	getProcedureName(medicalAppointment: MedicalAppointment) {
			
		if (medicalAppointment.appointment) {
			if (medicalAppointment.appointment.service) {
				return medicalAppointment.appointment.service.name;
			}

			if (medicalAppointment.appointment.procedure) {
				return medicalAppointment.appointment.procedure.name;
			}
		}

		return "-";
	}

	getProcedureValue(medicalAppointment: MedicalAppointment) {
		return medicalAppointment.appointment.value;
	}

	onHealthProfessionalChange() {

		if (!this.selectedHealthProfessional) return;

		this._router.navigate([], {
			relativeTo: this._activatedRoute,
			queryParams: {
				professional: this.selectedHealthProfessional.id
			},
			queryParamsHandling: 'merge', // mantém outros query params existentes
			replaceUrl: true              // evita adicionar no histórico de navegação
		});

		this._retrieveMedicalAppointments();
	}

	async onPeriodChange() {
        const [start, end] = this.selectedPeriod || [];

        if (!start || !end) {
            return;
        }

		if (!this.selectedHealthProfessional) {
			return;
		}

		await this._retrieveMedicalAppointments();
    }

	async onPrintPress() {

		const startDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[0]).split('T')[0];
		const endDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[1]).split('T')[0];

		const blob = await this._medicalAppointmentService.printExtract(
			this.selectedHealthProfessional,
			this.medicalAppointments,
			startDate,
			endDate,
			this.payoutTotal
		);

		const url = window.URL.createObjectURL(blob);
		window.open(url);
	}

	private async _fetchData() {

		this.partner = await this._authenticationService.retrieveUser();

		const { content, page } = await this._healthProfessionalService.search(-1, -1, 'name', 'asc', {
			partnerId: this.partner.id
		});

		this.healthProfessionalsOptions = content.map(healthProfessional => ({
			label: healthProfessional.name,
			value: healthProfessional
		}));

		this._changeDetector.detectChanges();

		if (page.totalElements > 0) {

			const professionalId = this._activatedRoute.snapshot.queryParams['professional'];

			if (professionalId) {
				content.forEach(healthProfessional => {
					if (healthProfessional.id === professionalId) {
						this.selectedHealthProfessional = healthProfessional;
					}
				})
			} else {
				this.selectedHealthProfessional = content[0];
			}

			await this._retrieveMedicalAppointments();
		}
	}

	private async _retrieveMedicalAppointments() {

		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {

			const startDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[0]).split('T')[0];
			const endDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[1]).split('T')[0];

			const { content } = await this._medicalAppointmentService.search(-1, -1, 'createdDate', 'asc', {
				healthProfessionalId: this.selectedHealthProfessional.id,
				startDate: startDate,
				endDate: endDate
			});

			this.medicalAppointments = content;
			this.payoutTotal = content.map(m => m.payoutTotal).reduce((prev, current) => prev + current, 0);
		} finally {
			this.isLoading = false;
		}
		
		this._changeDetector.detectChanges();
	}
}