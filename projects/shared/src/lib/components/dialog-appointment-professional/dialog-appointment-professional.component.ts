import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AppointmentSituation } from '../../enums/appointment-situation';
import { Gender } from '../../enums/gender';
import { Appointment } from '../../models/appointments';
import { GenderPipe } from '../../pipes/gender.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import { MedicalAppointmentService } from '../../services/medical-appointment.service';
import { UserPictureComponent } from '../user-picture/user-picture.component';

type Patient = {
    name: string;
    birthDate: Date;
    email: string;
    phone: string;
    gender?: Gender;
    avatarUrl?: string;
}

@Component({
    selector: 'app-dialog-appointment-professional',
    templateUrl: './dialog-appointment-professional.component.html',
    styleUrls: ['./dialog-appointment-professional.component.scss'],
    imports: [
        ButtonModule, 
        CardModule, 
        CommonModule, 
        GenderPipe, 
        PhonePipe, 
        UserPictureComponent
    ],
})
export class DialogAppointmentProfessionalComponent {

    patient!: Patient;
    
    @Input() appointment!: Appointment;
    
    public readonly AppointmentSituation = AppointmentSituation;
    
    constructor(
        private readonly _config: DynamicDialogConfig,
        private readonly _router: Router,
        private readonly _dialogRef: DynamicDialogRef,
        private readonly _medicalAppointmentService: MedicalAppointmentService
    ) {
        if (this._config.data) {
            
            if (this._config.data.appointment) {
                this.appointment = this._config.data.appointment;
                this.appointment.time = this.appointment.time.substring(0, 5);
                
                this.patient = {
                    email: this.appointment.client.email,
                    name: this.appointment.client?.name,
                    birthDate: this.appointment.client?.birthDate,
                    phone: this.appointment.client?.phone,
                    gender: this.appointment.client?.gender,
                    avatarUrl: this.appointment.client?.picture?.path
                }
            }
        }
    }

    getProcedureName() {
        return this.appointment.procedure?.name || this.appointment.service?.name;
    }

    isStartMedicalAppointmentEnabled() {
        return (
            this.appointment.situation === AppointmentSituation.PENDING || 
            this.appointment.situation === AppointmentSituation.WAITING
        );
    }

    isNavigateToMedicalAppointmentEnabled() {
        return (
            this.appointment.situation === AppointmentSituation.IN_PROGRESS ||
            this.appointment.situation === AppointmentSituation.CONCLUDED
        );
    }

    navigate() {

        this._router.navigate(['/medical-record'], {
            state: { appointment: this.appointment },
        });

        this._dialogRef.close();
    }

    async navigateToMedicalAppointment() {
        const appointmentId = this.appointment.id;
        
        if (appointmentId) {
            const medicalAppointment = await this._medicalAppointmentService.findByAppointmentId(appointmentId);

            this._router.navigate([`/medical-record/${medicalAppointment.id}`], {
                state: { appointment: this.appointment },
            });

            this._dialogRef.close();
        }
    }
}
