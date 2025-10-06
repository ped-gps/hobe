import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import {
	IMCCategory,
	ImcCategoryPipe,
	IMCUtils,
	MedicalAppointment,
} from '@hobe/shared';

@Component({
	selector: 'app-medical-record-attendance',
	templateUrl: './medical-record-attendance.component.html',
	styleUrl: './medical-record-attendance.component.scss',
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		InputNumberModule,
		InputTextModule,
		ImcCategoryPipe,
		TextareaModule,
	],
})
export class MedicalRecordAttendanceComponent implements OnInit {
	@Input({ required: true }) medicalAppointment:
		| MedicalAppointment
		| undefined;
	@Input({ required: true }) readOnly: boolean = false;
	@Output() attendanceFormChange = new EventEmitter<FormGroup>();

	public form!: FormGroup;
	public readonly IMCCategory = IMCCategory;

	constructor(private readonly _formBuilder: FormBuilder) {}

	ngOnInit(): void {
		this._buildForm();
	}

	getIMCCategory() {
		const imc = this.form.get('imc')?.value;

		if (!imc || imc <= 0) {
			return IMCUtils.getCategory(0);
		}

		return IMCUtils.getCategory(imc);
	}

	hasIMC() {
		const imc = this.form.get('imc')?.value;
		return imc && imc > 0;
	}

	onAttendanceFormChange() {
		this.attendanceFormChange.emit(this.form);
	}

	onHeightOrWeightChange() {
		const height = this.form.get('height')?.value;
		const weight = this.form.get('weight')?.value;

		if (height && height > 0) {
			if (weight && weight > 0) {
				const imc = weight / Math.pow(height / 100, 2);
				this.form.get('imc')?.patchValue(Number(imc.toFixed(2)));
			}
		}
	}

	private _buildForm() {
		this.form = this._formBuilder.group({
			mainComplaint: [
				{
					value: this.medicalAppointment?.mainComplaint,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			currentIllnessHistory: [
				{
					value: this.medicalAppointment?.currentIllnessHistory,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],

			medicalHistory: [
				{
					value: this.medicalAppointment?.medicalHistory,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			physicalExam: [
				{
					value: this.medicalAppointment?.physicalExam,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			height: [
				{
					value: this.medicalAppointment?.height,
					disabled: this.readOnly,
				},
				[Validators.nullValidator, Validators.min(0)],
			],
			weight: [
				{
					value: this.medicalAppointment?.weight,
					disabled: this.readOnly,
				},
				[Validators.nullValidator, Validators.min(0)],
			],
			imc: [
				{
					value: this.medicalAppointment?.imc,
					disabled: true,
				},
				[Validators.nullValidator, Validators.min(0)],
			],
			diagnosis: [
				{
					value: this.medicalAppointment?.diagnosis,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			medicalConduct: [
				{
					value: this.medicalAppointment?.medicalConduct,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
		});

		this.onAttendanceFormChange();
		this.form.valueChanges.subscribe(() => this.onAttendanceFormChange());
	}
}
