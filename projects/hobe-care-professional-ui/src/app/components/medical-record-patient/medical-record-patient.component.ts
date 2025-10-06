import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
	AgePipe,
	Appointment,
	Client,
	GenderPipe,
	UserPictureComponent,
} from '@hobe/shared';

@Component({
	selector: 'app-medical-record-patient',
	templateUrl: './medical-record-patient.component.html',
	styleUrl: './medical-record-patient.component.scss',
	imports: [CommonModule, AgePipe, GenderPipe, UserPictureComponent],
})
export class MedicalRecordPatientComponent {
	@Input() client!: Client;
	@Input() appointment!: Appointment;
}
