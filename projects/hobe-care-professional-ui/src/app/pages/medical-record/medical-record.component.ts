import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MedicalRecordAttachmentsComponent } from './../../components/medical-record-attachments/medical-record-attachments.component';

import { MedicalRecordAnamnesisComponent } from '../../components/medical-record-anamnesis/medical-record-anamnesis.component';
import { MedicalRecordAttendanceComponent } from '../../components/medical-record-attendance/medical-record-attendance.component';
import { MedicalRecordDocumentsComponent } from '../../components/medical-record-documents/medical-record-documents.component';
import { MedicalRecordObservationsComponent } from '../../components/medical-record-observations/medical-record-observations.component';
import { MedicalRecordPatientComponent } from '../../components/medical-record-patient/medical-record-patient.component';
import { MedicalRecordPrescriptionComponent } from '../../components/medical-record-prescription/medical-record-prescription.component';
import { MedicalRecordResumeComponent } from '../../components/medical-record-resume/medical-record-resume.component';

import { Appointment, Client, HealthProfessional, MedicalAppointment, Prescription, MedicalAppointmentSituation, AlertService, AuthenticationService, MedicalAppointmentService, Route, MedicalObservation, AlertType, DateUtils, FileLoaded, Anamnesis } from '@hobe/shared';

@Component({
    selector: 'app-medical-record',
    templateUrl: './medical-record.component.html',
    styleUrls: ['./medical-record.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        BreadcrumbModule,
        RouterModule,
        MedicalRecordAnamnesisComponent,
        MedicalRecordAttendanceComponent,
        MedicalRecordDocumentsComponent,
        MedicalRecordAttachmentsComponent,
        MedicalRecordPatientComponent,
        MedicalRecordPrescriptionComponent,
        MedicalRecordResumeComponent,
        MedicalRecordDocumentsComponent,
        MedicalRecordObservationsComponent,
    ],
})
export class MedicalRecordComponent implements OnInit {
    public anamnesisForm!: FormGroup;
    public attendanceForm!: FormGroup;
    public medicalObservationForm!: FormGroup;

    public appointment!: Appointment;
    public attachments: any[] = [];
    public client!: Client;
    public healthProfessional!: HealthProfessional;
    public medicalAppointment!: MedicalAppointment;
    public prescription!: Prescription;

    public isMedicalAppointmentStart = false;
    public timer = '00:00:00';
    public finishedTime: string = '';
    public items: MenuItem[] | undefined;
    public isLoading!: boolean;

    public activeSection: string = 'resumo';
    public sections = [
        { key: 'resumo', label: 'Resumo' },
        { key: 'anamnesis', label: 'Anamnese' },
        { key: 'atendimento', label: 'Atendimento' },
        { key: 'prescricoes', label: 'Prescrições' },
        { key: 'documentos', label: 'Documentos e atestados' },
        { key: 'imagens', label: 'Imagens e anexos' },
        { key: 'observacoes', label: 'Observações Clínicas' },
    ];

    public readonly MedicalAppointmentSituation = MedicalAppointmentSituation;
    private timerInterval: any;

    constructor(
        private readonly _alertService: AlertService,
        private readonly _authService: AuthenticationService,
        private readonly _changeDetector: ChangeDetectorRef,
        private readonly _location: Location,
        private readonly _medicalAppointmentService: MedicalAppointmentService,
        private readonly _router: Router,
        private readonly _route: ActivatedRoute
    ) {}

    async ngOnInit() {
        this.items = [
            { label: 'Agenda', url: Route.MEDICAL_SCHEDULE },
            { label: 'Prontuário', url: Route.MEDICAL_RECORD },
        ];

        this._fetchData();
    }

    isSectionDisabled(sectionKey: string): boolean {
        if (sectionKey === 'resumo') {
            return false;
        }
        return !this.medicalAppointment?.id && !this.isMedicalAppointmentStart;
    }

    isMedicalAppointmentInProgress() {
        return (
            this.isMedicalAppointmentStart ||
            (this.medicalAppointment &&
                this.medicalAppointment.situation ===
                    MedicalAppointmentSituation.IN_PROGRESS)
        );
    }

    isMedicalAppointmentConcluded() {
        return (
            this.medicalAppointment &&
            this.medicalAppointment.situation ===
                MedicalAppointmentSituation.CONCLUDED
        );
    }

    onAnamnesisFormChange(form: FormGroup) {
        this.anamnesisForm = form;
        this.medicalAppointment.anamnesis = form.getRawValue();
        this._saveMedicalAppointmentInLocalStorage();
    }

    onAttendanceFormChange(form: FormGroup) {
        this.attendanceForm = form;
        
        if (!this.medicalAppointment) {
            this.medicalAppointment = {} as any;
        } 
        
        Object.assign(this.medicalAppointment, form.getRawValue());
        this._saveMedicalAppointmentInLocalStorage();
    }

    onAttachmentsChange(attachments: any[]) {
        this.attachments = attachments;
        this._saveMedicalAppointmentInLocalStorage();
    }

    async onFinishMedicalAppointment(): Promise<void> {
        this.isMedicalAppointmentStart = false;

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.finishedTime = this.timer;

        const existingAttachments = this.attachments.filter(
            (att): att is FileLoaded & { id: string } =>
                !(att.file instanceof File) && typeof att.id === 'string'
        );
        const newAttachments = this.attachments.filter(
            (att): att is FileLoaded & { file: File } => att.file instanceof File
        );

        const anamnesis: Anamnesis = {
            ...(this.medicalAppointment?.anamnesis || {}),
            ...(this.anamnesisForm?.getRawValue() || {}),
        };

        const medicalObservation: MedicalObservation = {
            ...(this.medicalAppointment?.medicalObservation || {}),
            ...(this.medicalObservationForm?.getRawValue() || {}),
        };

        const medicalAppointment: MedicalAppointment = {
            ...(this.medicalAppointment || {}),
            ...(this.attendanceForm?.getRawValue() || {}),
            client: { id: this.client.id } as any,
            healthProfessional: { id: this.healthProfessional.id } as any,
            duration: this._timeStringToSeconds(this.finishedTime),
            prescription: this.prescription,
            anamnesis: anamnesis,
            medicalObservation: medicalObservation,
            situation: MedicalAppointmentSituation.CONCLUDED,
            attachments: existingAttachments.map(
                (att) => ({ id: att.id } as any)
            ),
        };

        this.medicalAppointment =
            await this._medicalAppointmentService.updateWithFiles(
                medicalAppointment,
                newAttachments,
                { showSuccessMessage: false }
            );

        localStorage.removeItem('medicalAppointment');

        this._alertService.showMessage(
            AlertType.SUCCESS,
            'Concluído',
            'Atendimento finalizado!'
        );
        
        this.activeSection = 'resumo';
    }

    onMedicalObservationFormChange(form: FormGroup) {
        this.medicalObservationForm = form;
        this.medicalAppointment.medicalObservation = form.value;
        this._saveMedicalAppointmentInLocalStorage();
    }

    onPrescriptionChange(prescription: Prescription) {
        this.prescription = prescription;
        this._saveMedicalAppointmentInLocalStorage();
    }

    async onStartMedicalAppointment() {
        this.isMedicalAppointmentStart = true;
        this._startTimer();
        let newMedicalAppointment;

        if (this.medicalAppointment) {
            this.medicalAppointment = {
                ...this.medicalAppointment,
                client: { id: this.medicalAppointment.client.id },
                healthProfessional: {
                    id: this.medicalAppointment.healthProfessional.id,
                },
                appointment: { id: this.medicalAppointment.appointment.id },
                situation: MedicalAppointmentSituation.IN_PROGRESS,
            } as any;

            newMedicalAppointment =
                await this._medicalAppointmentService.update(
                    this.medicalAppointment,
                    { showSuccessMessage: false }
                );
        } else {
            this.medicalAppointment = {
                client: { id: window.history.state.appointment.client.id },
                healthProfessional: { id: this.healthProfessional.id },
                appointment: { id: window.history.state.appointment.id },
                situation: MedicalAppointmentSituation.IN_PROGRESS,
            } as any;

            newMedicalAppointment = await this._medicalAppointmentService.save(
                this.medicalAppointment,
                { showSuccessMessage: false }
            );
        }

        this._location.go(`/medical-record/${newMedicalAppointment.id}`);
        this.medicalAppointment = newMedicalAppointment;
        this._saveMedicalAppointmentInLocalStorage();
    }

    secondsToTimeString(totalSeconds: number): string {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map((u) => String(u).padStart(2, '0')).join(':');
    }

    private async _fetchData() {
        this.isLoading = true;

        try {
            const medicalAppointmentId =
                this._route.snapshot.paramMap.get('id') || undefined;

            if (!medicalAppointmentId) {
                if (!window.history.state.appointment) {
                    this._router.navigate([`/dashboard`]);
                } else {
                    this.appointment = window.history.state.appointment;
                    this.client = this.appointment.client;
                }
            }

            this.healthProfessional = await this._authService.retrieveUser();

            if (medicalAppointmentId) {
                await this._retrieveMedicalAppointment(medicalAppointmentId);
            }
        } finally {
            this.isLoading = false;
            this._changeDetector.markForCheck();
        }
    }

    private _saveMedicalAppointmentInLocalStorage() {
        if (
            this.medicalAppointment.situation ===
            MedicalAppointmentSituation.IN_PROGRESS
        ) {
            const anamnesis: Anamnesis = {
                ...(this.medicalAppointment?.anamnesis || {}),
                ...(this.anamnesisForm?.getRawValue() || {}),
            };

            const medicalObservation: MedicalObservation = {
                ...(this.medicalAppointment?.medicalObservation || {}),
                ...(this.medicalObservationForm?.getRawValue() || {}),
            };

            const medicalAppointment: MedicalAppointment = {
                ...(this.medicalAppointment || {}),
                ...(this.attendanceForm?.getRawValue() || {}),
                anamnesis: anamnesis,
                prescription: this.prescription,
                medicalObservation: medicalObservation,
                attachments: this.attachments,
            };

            localStorage.setItem('medicalAppointment', JSON.stringify(medicalAppointment));
        }
    }

    private async _retrieveMedicalAppointment(medicalAppointmentId: string) {
        const medicalAppointment =
            await this._medicalAppointmentService.findById(
                medicalAppointmentId
            );

        const medicalAppointmentLocalStorage = JSON.parse(
            localStorage.getItem('medicalAppointment') || '{}'
        ) as MedicalAppointment;

        if (medicalAppointment) {
            this.medicalAppointment = medicalAppointment;
            this.appointment = medicalAppointment.appointment;
            this.client = medicalAppointment.client;

            if (medicalAppointment.id === medicalAppointmentLocalStorage.id) {
                this.medicalAppointment = {
                    ...medicalAppointment,
                    ...medicalAppointmentLocalStorage,
                };
            }

            this.timer = this.secondsToTimeString(
                this.medicalAppointment.duration
            );

            this.attachments = this.medicalAppointment.attachments as any;

            if (
                this.medicalAppointment.situation ===
                MedicalAppointmentSituation.IN_PROGRESS
            ) {
                if (this.medicalAppointment.createdDate) {
                    const createdDate = DateUtils.plusHours(
                        this.medicalAppointment.createdDate,
                        -3
                    );
                    const duration = Date.now() - createdDate.getTime();
                    this.timer = this.secondsToTimeString(
                        Math.floor(duration / 1000)
                    );
                }

                this.isMedicalAppointmentStart = true;
                this._startTimer();
            }
        }
    }

    private _startTimer() {
        let seconds = 0;
        if (!this.timer) {
            this.timer = '00:00:00';
        } else {
            seconds = this._timeStringToSeconds(this.timer);
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600)
                .toString()
                .padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60)
                .toString()
                .padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            this.timer = `${h}:${m}:${s}`;
        }, 1000);
    }

    private _timeStringToSeconds(time: string | number): number {
        if (typeof time === 'number') return time;
        const [h, m, s] = time.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    }
}
