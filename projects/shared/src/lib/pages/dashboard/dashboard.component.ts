import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
    AppointmentService,
    AppointmentStatistics,
    AuthenticationService,
    DateUtils,
    HealthProfessional,
    HealthProfessionalService,
    MedicalAppointment,
    MedicalAppointmentOverview,
    MedicalAppointmentService,
    Partner,
    Route
} from '@hobe/shared';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        ChartModule,
        CommonModule,
        DatePickerModule,
        DividerModule,
        FormsModule,
        RouterModule,
        SelectModule,
        TableModule,
    ],
})
export class DashboardComponent implements OnInit {

    partner!: Partner;
    appointmentStatistics!: AppointmentStatistics;
    medicalAppointmentOverview!: MedicalAppointmentOverview;
    
    medicalAppointments!: Array<MedicalAppointment>;

    healthProfessionalOptions: Array<SelectItem> = [];
    selectedPeriod!: Array<Date>;
    selectedHealthProfessional!: HealthProfessional;

    chartData!: any;
    chartOptions!: any;

    Route = Route;

    constructor(
        private readonly _authenticationService: AuthenticationService,
        private readonly _appointmentService: AppointmentService,
		private readonly _changeDetector: ChangeDetectorRef,
        private readonly _healthProfessionalService: HealthProfessionalService,
        private readonly _medicalAppointmentService: MedicalAppointmentService,
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
		this._initChartOptions();
        await this._fetchData();
		this._changeDetector.markForCheck();
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

    async onHealthProfessionalChange() {
        await this._retrieveAppointmentStatistics();
        await this._retrieveMedicalAppointmentsOverview();
        await this._retrieveLastMedicalAppointments();
    }

    async onPeriodChange() {
        const [start, end] = this.selectedPeriod || [];

        if (!start || !end) {
            return;
        }

        await this._retrieveAppointmentStatistics();
        await this._retrieveMedicalAppointmentsOverview();
    }

    private async _fetchData() {
        this.partner = await this._authenticationService.retrieveUser();
        await this._retrieveHealthProfessionals();
        await this._retrieveAppointmentStatistics();
        await this._retrieveMedicalAppointmentsOverview();
        await this._retrieveLastMedicalAppointments();
    }

    private async _retrieveAppointmentStatistics() {

        if (!this.partner || !this.selectedHealthProfessional) {
            return;
        }

        const startDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[0]).split('T')[0];
        const endDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[1]).split('T')[0];

        this.appointmentStatistics = await this._appointmentService.statistics(
            this.partner.id!,
            this.selectedHealthProfessional.id!,
            startDate,
            endDate
        );

        this._changeDetector.detectChanges();
    }

    private async _retrieveLastMedicalAppointments() {

        const medicalAppointmentsPage = await this._medicalAppointmentService.search(0, 5, 'createdDate', 'desc', {
            healthProfessionalId: this.selectedHealthProfessional.id
        });

        this.medicalAppointments = medicalAppointmentsPage.content;
    }

    private async _retrieveMedicalAppointmentsOverview() {
        
        if (!this.partner || !this.selectedHealthProfessional) {
            return;
        }

        const startDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[0]).split('T')[0];
        const endDate = DateUtils.formatDateWithoutTimezone(this.selectedPeriod[1]).split('T')[0];

        this.medicalAppointmentOverview = await this._medicalAppointmentService.overview(
            this.selectedHealthProfessional.id!,
            startDate,
            endDate
        );
        
        this.chartData = {
            labels: this.medicalAppointmentOverview.dailyAttendanceCounts.map(d => DateUtils.toLocaleDateString(d.date)),
            datasets: [
                {
                    label: 'Atendimentos',
                    data: this.medicalAppointmentOverview.dailyAttendanceCounts.map(d => d.count),
                    borderColor: '#475585ff',
                    backgroundColor: 'rgba(71, 85, 133, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ],
        };

        this._changeDetector.detectChanges();
    }

    private async _retrieveHealthProfessionals() {

        const { content, page } = await this._healthProfessionalService.search(-1, -1, 'name', 'asc', {
            partnerId: this.partner.id
        });

        this.healthProfessionalOptions = content.map(healthProfessional => ({
            label: healthProfessional.name,
            value: healthProfessional
        }));

        if (page.totalElements > 0) {
            this.selectedHealthProfessional = content[0];
        }

        this._changeDetector.detectChanges();
    }

    private _initChartOptions() {
        this.chartOptions = {
			responsive: false,
    		maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
            },
        };
    }
}
