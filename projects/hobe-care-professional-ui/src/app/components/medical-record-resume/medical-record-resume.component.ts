import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

import {
	Client,
	HealthProfessional,
	MedicalAppointment,
	MedicalAppointmentService,
} from '@hobe/shared';

@Component({
	selector: 'app-medical-record-resume',
	templateUrl: './medical-record-resume.component.html',
	styleUrl: './medical-record-resume.component.scss',
	imports: [AccordionModule, CommonModule],
})
export class MedicalRecordResumeComponent implements OnInit {
	@Input({ required: true }) client!: Client;
	@Input({ required: true }) healthProfessional!: HealthProfessional;

	public medicalAppointments!: MedicalAppointment[];

	constructor(
		private readonly _chandeDetector: ChangeDetectorRef,
		private readonly _medicalAppointmentService: MedicalAppointmentService,
	) {}

	async ngOnInit(): Promise<void> {
		const { content } = await this._medicalAppointmentService.search(
			-1,
			-1,
			'createdDate',
			'desc',
			{
				clientId: this.client.id,
				healthProfessionalId: this.healthProfessional.id,
			},
		);

		this.medicalAppointments = content;
		this._chandeDetector.markForCheck();
	}
}
