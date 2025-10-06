import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';

import { DialogAppointmentProfessionalComponent } from '../../components/dialog-appointment-professional/dialog-appointment-professional.component';
import { DialogAppointmentComponent } from '../../components/dialog-appointment/dialog-appointment.component';
import { UserProfile } from '../../enums/user-profile';
import { Appointment } from '../../models/appointments';
import { HealthProfessional } from '../../models/health-professional';
import { Partner } from '../../models/partner';
import { User } from '../../models/user';
import { AppointmentService } from '../../services/appointment.service';
import { AuthenticationService } from '../../services/authentication.service';
import { HealthProfessionalService } from '../../services/health-professional.service';
import { AppointmentSituationUtils } from '../../utils/appointment-situation.util';
import { DateUtils } from '../../utils/date.util';
import { ModelAction } from './../../enums/model-action';
import { ModelType } from './../../enums/model-type';
import { WebsocketService } from './../../services/websocket.service';

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
export class ScheduleComponent implements OnInit, OnDestroy {
	partner!: Partner;
	healthProfessionalOptions!: Array<SelectItem>;
	selectedAppointment!: Appointment;
	selectedHealthProfessional!: HealthProfessional;
	user!: User;

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
			week: 'Semana',
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
			const appointment: Appointment = (event.extendedProps as any)
				.appointment;
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
                `,
			};
		},
		datesSet: ({ start, end }) => {
			this.onDateChange(start, end);
		},
		eventClick: (info) => {
			const appointment = info.event.extendedProps[
				'appointment'
			] as Appointment;
			this.onEventPress(appointment);
		},
	};

	UserProfile = UserProfile;

	private _wsTopics: string[] = [];
	private _subscriptions: Subscription[] = [];

	constructor(
		private readonly _appointmentService: AppointmentService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _dialogService: DialogService,
		private readonly _healthProfessionalService: HealthProfessionalService,
		private readonly _webSocketService: WebsocketService,
	) {}

	async ngOnInit(): Promise<void> {
		await this._fetchData();
		this._listenWebSocketConnection();
	}

	ngOnDestroy(): void {
		// Cancela listeners RxJS
		this._subscriptions.forEach((sub) => sub.unsubscribe());

		// Cancela listeners no WebSocket
		this._wsTopics.forEach((topic) => {
			this._webSocketService.unsubscribe(topic);
		});
	}

	onAddAppointment() {
		this._showDialogAppointment();
	}

	async onDateChange(startDate: Date, endDate: Date): Promise<void> {
		if (!this.selectedHealthProfessional || !this.partner) {
			return;
		}

		await this._retrieveAppointments(startDate, endDate);
		this._subscribeTopics();
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
		this.user = user;

		if (user.profile === UserProfile.PARTNER) {
			this.partner = user;
		}

		if (user.profile === UserProfile.RECEPTIONIST) {
			this.partner = user.partner;
		}

		if (user.profile === UserProfile.HEALTH_PROFESSIONAL) {
			this.selectedHealthProfessional = user;
			this.partner = user.partner;
		}

		await this._retrieveHealthProfessionals();

		if (this.selectedHealthProfessional) {
			await this._retrieveAppointments();
		}
	}

	private _listenMessages() {
		const subscription = this._webSocketService
			.getMessage()
			.subscribe((event) => {
				if (event) {
					const { type, object, action } = event;

					if (type === ModelType.APPOINTMENT) {
						const appointment: Appointment = object;

						if (action === ModelAction.UPDATE) {
							this._updateAppointmentOnCalendar(appointment);
						}
					}
				}
			});

		this._subscriptions.push(subscription);
	}

	private _listenWebSocketConnection() {
		const subscription = this._webSocketService
			.getConnected()
			.subscribe(async (connected) => {
				if (connected) {
					this._listenMessages();
					this._subscribeTopics();
				}
			});

		this._subscriptions.push(subscription);
	}

	private async _retrieveAppointments(startDate?: Date, endDate?: Date) {
		const today = new Date();

		startDate = startDate || today;
		endDate = endDate || today;

		const startDateStr =
			DateUtils.formatDateWithoutTimezone(startDate).split('T')[0];
		const endDateStr =
			DateUtils.formatDateWithoutTimezone(endDate).split('T')[0];

		const { content } = await this._appointmentService.search(
			-1,
			-1,
			'createdDate',
			'asc',
			{
				partnerId: this.partner.id,
				healthProfessionalId: this.selectedHealthProfessional.id,
				startDate: startDateStr,
				endDate: endDateStr,
			},
		);

		this.calendarOptions.events = content.map((appointment) => ({
			id: appointment.id,
			title: appointment.client.name,
			start: appointment.date + 'T' + appointment.time,
			appointment,
		}));

		this._changeDetector.markForCheck();
	}

	private async _retrieveHealthProfessionals() {
		const { content, page } = await this._healthProfessionalService.search(
			-1,
			-1,
			'name',
			'asc',
			{
				partnerId: this.partner.id,
			},
		);

		this.healthProfessionalOptions = content.map((healthProfessional) => ({
			label: healthProfessional.name,
			value: healthProfessional,
		}));

		if (page.totalElements > 0) {
			if (!this.selectedHealthProfessional) {
				this.selectedHealthProfessional =
					this.healthProfessionalOptions[0].value;
			} else {
				this.selectedHealthProfessional =
					this.healthProfessionalOptions.find(
						(o) =>
							o.value.id === this.selectedHealthProfessional.id,
					)?.value;
			}
		}

		this._changeDetector.markForCheck();
	}

	private _showDialogAppointment(appointment?: Appointment) {
		if (this.user.profile === UserProfile.HEALTH_PROFESSIONAL) {
			this._dialogService
				.open(DialogAppointmentProfessionalComponent, {
					draggable: true,
					modal: true,
					header: 'Agendamento',
					closable: true,
					closeOnEscape: false,
					data: {
						appointment: appointment,
					},
					styleClass: 'dialog-appointment',
				})
				.onClose.subscribe((result) => {
					if (result && result.change) {
						this._retrieveAppointments();
					}
				});
		} else {
			this._dialogService
				.open(DialogAppointmentComponent, {
					draggable: true,
					modal: true,
					header: 'Agendamento',
					closable: true,
					closeOnEscape: false,
					data: {
						appointment: appointment,
						healthProfessional: this.selectedHealthProfessional,
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

	private _subscribeTopics() {
		if (!this.calendarOptions.events) return;

		this._wsTopics.forEach((topic) => {
			this._webSocketService.unsubscribe(topic);
		});

		// Converte para array mutável
		const events = [...(this.calendarOptions.events as any[])];

		events.forEach(async (event) => {
			const topic = await this._webSocketService.subscribe(
				`/appointments/${event.appointment.id}`,
			);
			if (topic) {
				this._wsTopics.push(topic);
			}
		});
	}

	private _updateAppointmentOnCalendar(appointment: Appointment) {
		if (!this.calendarOptions.events) return;

		// Converte para array mutável
		const events = [...(this.calendarOptions.events as any[])];

		const index = events.findIndex((e) => e.id === appointment.id);
		if (index !== -1) {
			events[index] = {
				...events[index],
				title: appointment.client.name,
				start: appointment.date + 'T' + appointment.time,
				appointment,
			};
		} else {
			// Caso não exista, adiciona o evento
			events.push({
				id: appointment.id,
				title: appointment.client.name,
				start: appointment.date + 'T' + appointment.time,
				appointment,
			});
		}

		this.calendarOptions = {
			...this.calendarOptions,
			events,
		};

		this._changeDetector.markForCheck();
	}
}
