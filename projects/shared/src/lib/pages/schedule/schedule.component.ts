import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';

import { UserProfile } from '../../enums/user-profile';

import { 
    Appointment, 
    AppointmentService, 
    AppointmentSituationUtils, 
    AuthenticationService, 
    DateUtils, 
    DialogAppointmentComponent, 
    HealthProfessional, 
    HealthProfessionalService, 
    Partner 
} from '@hobe/shared';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrl: './schedule.component.scss',
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        FullCalendarModule,
        SelectModule,
    ],
})
export class ScheduleComponent implements OnInit {

    partner!: Partner;
    
    healthProfessionalOptions!: Array<SelectItem>;
    selectedAppointment!: Appointment;
    selectedHealthProfessional!: HealthProfessional;

    calendarOptions: CalendarOptions = {
        plugins: [timeGridPlugin],
        initialView: 'timeGridDay', // visualização por dia
        slotMinTime: '00:00:00', // início do horário
        slotMaxTime: '23:59:59', // fim do horário
        slotDuration: '00:30:00', // intervalo entre as linhas
        locale: 'pt-BR',
		allDaySlot: false,
		nowIndicator: true, // linha indicadora de "agora",
		buttonText: {
			today: 'Hoje',
			day: 'Dia',
			week: 'Semana'
		},
		headerToolbar: {
            left: 'prev today next',
            center: 'title',
            right: 'timeGridDay timeGridWeek',
        },
        height: 'auto',
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
		}, 
        eventContent: (arg: EventContentArg) => {
            const { timeText, event } = arg;
            const appointment: Appointment = (event.extendedProps as any).appointment;
            return {
                html: `
                    <div class="fc-event-custom">
                        <div>
                            <div class="fc-event-time">
                                ${timeText} - ${AppointmentSituationUtils.getFriendlyName(appointment.situation)}
                            </div>
                            <div class="fc-event-title">${event.title}</div>
                        </div>
                    </div>
                `
            };
        },
        datesSet: ({ start, end }) => {
            this.onDateChange(start, end);
        },
        eventClick: (info) => {
            const appointment = info.event.extendedProps['appointment'] as Appointment;
            this.onEventPress(appointment);
        },
    };

    constructor(
        private readonly _appointmentService: AppointmentService,
        private readonly _authenticationService: AuthenticationService,
        private readonly _changeDetector: ChangeDetectorRef,
        private readonly _dialogService: DialogService,
        private readonly _healthProfessionalService: HealthProfessionalService
    ) {}

    async ngOnInit(): Promise<void> {
        await this._fetchData();
        this._changeDetector.markForCheck();
    }

    onAddAppointment() {
        this._showDialogAppointment();
    }

    onDateChange(startDate: Date, endDate: Date): void {
        
        if (!this.selectedHealthProfessional || !this.partner) {
            return;
        }

        this._retrieveAppointments(startDate, endDate);
    }

    onEventPress(appointment: Appointment): void {
        this.selectedAppointment = appointment;
        this.onUpdateAppointment(); // ou qualquer outra ação
    }

    onHealthProfessionalChange() {

        if (!this.selectedHealthProfessional || !this.partner) {
            return;
        }

        this._retrieveAppointments();
    }

    onUpdateAppointment() {
        this._showDialogAppointment(this.selectedAppointment);
    }

    private async _fetchData() {
        const user = await this._authenticationService.retrieveUser();
        
        if (user.profile === UserProfile.PARTNER) {
            this.partner = user;
        }

        if (user.profile === UserProfile.RECEPTIONIST) {
            this.partner = user.partner;
        }

        const { content, page } = await this._healthProfessionalService.search(-1, -1, 'name', 'asc', { 
            partnerId: this.partner.id
        });

        this.healthProfessionalOptions = content.map(healthProfessional => ({
            label: healthProfessional.name,
            value: healthProfessional
        }));

        this._changeDetector.detectChanges();

        if (page.totalElements > 0) {
            this.selectedHealthProfessional = content[0];
            await this._retrieveAppointments();
        }
    }

    private async _retrieveAppointments(startDate?: Date, endDate?: Date) {

        const today = new Date();

        startDate = startDate || today;
        endDate = endDate || today;

        const startDateStr = DateUtils.formatDateWithoutTimezone(startDate).split('T')[0];
        const endDateStr = DateUtils.formatDateWithoutTimezone(endDate).split('T')[0];

        const { content } = await this._appointmentService.search(-1, -1, 'createdDate', 'asc', {
            partnerId: this.partner.id,
            healthProfessionalId: this.selectedHealthProfessional.id,
            startDate: startDateStr,
            endDate: endDateStr
        });

        this.calendarOptions.events = content.map(appointment => ({
            id: appointment.id,
            title: appointment.client.name,
            start: appointment.date + 'T' + appointment.time,
            appointment
        }));
    }

    private _showDialogAppointment(appointment?: Appointment) {

        this._dialogService
            .open(DialogAppointmentComponent, {
                draggable: true,
                modal: true,
                header: 'Agendamento',
                closable: true,
                closeOnEscape: false,
                data: {
                    appointment: appointment,
                    healthProfessional: this.selectedHealthProfessional
                },
                styleClass: 'dialog-appointment',
            })
            .onClose.subscribe((result) => {
                if (result && result.change) {
                    this._retrieveAppointments();
                }
            });
    }
}
