import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';

import {
	AdministrationRouteUtils,
	Exam,
	ExamService,
	ExamTypePipe,
	MedicalAppointment,
	MedicalAppointmentService,
	MedicalAppointmentSituation,
	Medication,
	MedicationService,
	PharmaceuticalForm,
	PharmaceuticalFormPipe,
	PrescribedExam,
	PrescribedExamsPrintRequest,
	PrescribedMedication,
	PrescribedMedicationsPrintRequest,
	PrescribedVaccine,
	PrescribedVaccinesPrintRequest,
	Prescription,
	Vaccine,
	VaccineService,
} from '@hobe/shared';

@Component({
	selector: 'app-medical-record-prescription',
	templateUrl: './medical-record-prescription.component.html',
	styleUrl: './medical-record-prescription.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		ChipModule,
		ExamTypePipe,
		FormsModule,
		InputTextModule,
		SelectModule,
		TabsModule,
		PharmaceuticalFormPipe,
	],
})
export class MedicalRecordPrescriptionComponent implements OnInit {
	prescription: Prescription = {
		medications: [],
		exams: [],
		vaccines: [],
	};

	examSearchTerm = '';
	medicationSearchTerm = '';
	vaccineSearchTerm = '';

	examOptions: Exam[] = [];
	medicationOptions: Medication[] = [];
	vaccineOptions: Vaccine[] = [];

	selectedMedication: Medication | null = null;
	selectedExam: Exam | null = null;
	selectedVaccine: Vaccine | null = null;

	@Input() medicalAppointment!: MedicalAppointment;
	@Input() prescriptionValues!: Prescription;
	@Output() prescriptionChange = new EventEmitter<Prescription>();

	private _time: any;

	constructor(
		private examService: ExamService,
		private medicalAppointmentService: MedicalAppointmentService,
		private medicationService: MedicationService,
		private vaccineService: VaccineService,
	) {}

	ngOnInit(): void {
		if (this.prescriptionValues) {
			this.prescription = this.prescriptionValues;
		}
	}

	isMedicalAppointmentInProgress() {
		return (
			this.medicalAppointment.situation ===
			MedicalAppointmentSituation.IN_PROGRESS
		);
	}

	async onExamSearch(event: any) {
		clearTimeout(this._time);

		this._time = setTimeout(async () => {
			const term = event?.filter ?? event;
			if (!term) return;
			const page = await this.examService.search(0, 10, 'name', 'asc', {
				name: term,
			});
			this.examOptions = page.content;
		}, 500);
	}

	async onMedicationSearch(event: any) {
		clearTimeout(this._time);

		this._time = setTimeout(async () => {
			const term = event?.filter ?? event;
			if (!term) return;
			const page = await this.medicationService.search(
				0,
				10,
				'name',
				'asc',
				{
					name: term,
				},
			);
			this.medicationOptions = page.content;
		}, 500);
	}

	async onVaccineSearch(event: any) {
		clearTimeout(this._time);

		this._time = setTimeout(async () => {
			const term = event?.filter ?? event;
			if (!term) return;
			const page = await this.vaccineService.search(
				0,
				10,
				'name',
				'asc',
				{
					name: term,
				},
			);
			this.vaccineOptions = page.content;
		}, 500);
	}

	addExam(exam: Exam, quantity: number = 1) {
		const prescribed: PrescribedExam = { exam, quantity } as any;
		this.prescription.exams.push(prescribed);
		this.emitPrescription();
	}

	addMedication(
		medication: Medication,
		dosage: string = '',
		quantity: number = 1,
	) {
		if (dosage.trim() === '') {
			const administrationRoute =
				AdministrationRouteUtils.getFriendlyName(
					medication.administrationRoute,
				).toLowerCase();

			if (medication.pharmaceuticalForm === PharmaceuticalForm.TABLET) {
				dosage = `Tomar X comprimidos, via ${administrationRoute}, a cada X horas.`;
			}

			if (medication.pharmaceuticalForm === PharmaceuticalForm.CAPSULE) {
				dosage = `Tomar X cápsulas, via ${administrationRoute}, a cada X horas.`;
			}

			if (
				medication.pharmaceuticalForm === PharmaceuticalForm.SUSPENSION
			) {
				dosage = `Tomar X ml, via ${administrationRoute}, a cada X horas.`;
			}

			if (
				medication.pharmaceuticalForm === PharmaceuticalForm.INJECTABLE
			) {
				dosage = `Aplicar X ml, via ${administrationRoute}, a cada X horas.`;
			}
		}

		dosage = `${dosage} Durante X dias.`;

		const prescribed: PrescribedMedication = {
			medication,
			dosage,
			quantity,
		} as any;
		this.prescription.medications.push(prescribed);
		this.emitPrescription();
	}

	addVaccine(vaccine: Vaccine, dosage: string = '', quantity: number = 1) {
		if (dosage.trim() === '') {
			dosage = `Aplicar X dose, via X, em dose única.`;
		}

		const prescribed: PrescribedVaccine = {
			vaccine,
			dosage,
			quantity,
		} as any;
		this.prescription.vaccines.push(prescribed);
		this.emitPrescription();
	}

	removeExam(index: number) {
		this.prescription.exams.splice(index, 1);
		this.emitPrescription();
	}

	removeMedication(index: number) {
		this.prescription.medications.splice(index, 1);
		this.emitPrescription();
	}

	removeVaccine(index: number) {
		this.prescription.vaccines.splice(index, 1);
		this.emitPrescription();
	}

	async onPrintPrescribedExams() {
		const { exams } = this.prescription;

		if (exams.length === 0) {
			return;
		}

		if (!this.medicalAppointment || !this.medicalAppointment.id) {
			console.error('Medical appointment is not defined or has no ID.');
			return;
		}

		const payload: PrescribedExamsPrintRequest = {
			prescribedExams: exams,
		};

		const blob = await this.medicalAppointmentService.printPrescribedExams(
			this.medicalAppointment.id,
			payload,
		);
		const url = window.URL.createObjectURL(blob);
		window.open(url);
	}

	async onPrintPrescribedMedications() {
		const { medications } = this.prescription;

		if (medications.length === 0) {
			return;
		}

		if (!this.medicalAppointment || !this.medicalAppointment.id) {
			console.error('Medical appointment is not defined or has no ID.');
			return;
		}

		const payload: PrescribedMedicationsPrintRequest = {
			prescribedMedications: medications,
		};

		const blob =
			await this.medicalAppointmentService.printPrescribedMedications(
				this.medicalAppointment.id,
				payload,
			);
		const url = window.URL.createObjectURL(blob);
		window.open(url);
	}

	async onPrintPrescribedVaccines() {
		const { vaccines } = this.prescription;

		if (vaccines.length === 0) {
			return;
		}

		if (!this.medicalAppointment || !this.medicalAppointment.id) {
			console.error('Medical appointment is not defined or has no ID.');
			return;
		}

		const payload: PrescribedVaccinesPrintRequest = {
			prescribedVaccines: vaccines,
		};

		const blob =
			await this.medicalAppointmentService.printPrescribedVaccines(
				this.medicalAppointment.id,
				payload,
			);
		const url = window.URL.createObjectURL(blob);
		window.open(url);
	}

	onSelectMedication(event: any) {
		if (event.value) {
			this.addMedication(event.value);
			this.selectedMedication = null;
		}
	}

	onSelectExam(event: any) {
		if (event.value) {
			this.addExam(event.value);
			this.selectedExam = null;
		}
	}

	onSelectVaccine(event: any) {
		if (event.value) {
			this.addVaccine(event.value);
			this.selectedVaccine = null;
		}
	}

	emitPrescription() {
		this.prescriptionChange.emit({
			medications: [...this.prescription.medications],
			exams: [...this.prescription.exams],
			vaccines: [...this.prescription.vaccines],
		});
	}
}
