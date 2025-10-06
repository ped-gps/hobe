import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

import { Anamnesis } from '@hobe/shared';

@Component({
	selector: 'app-medical-record-anamnesis',
	templateUrl: './medical-record-anamnesis.component.html',
	styleUrl: './medical-record-anamnesis.component.scss',
	imports: [CommonModule, FormsModule, ReactiveFormsModule, TextareaModule],
})
export class MedicalRecordAnamnesisComponent implements OnInit {
	@Input() anamnesis!: Anamnesis | undefined;
	@Input() readOnly: boolean = false;
	@Output() anamnesisFormChange = new EventEmitter<FormGroup>();

	public form!: FormGroup;

	constructor(private readonly _formBuilder: FormBuilder) {}

	ngOnInit(): void {
		this._buildForm();
	}

	onFormChange() {
		this.anamnesisFormChange.emit(this.form);
	}

	private _buildForm() {
		this.form = this._formBuilder.group({
			clinicalHistory: [
				{
					value: this.anamnesis?.clinicalHistory,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			surgicalHistory: [
				{
					value: this.anamnesis?.surgicalHistory,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			familyBackground: [
				{
					value: this.anamnesis?.familyBackground,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			habits: [
				{
					value: this.anamnesis?.habits,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			allergies: [
				{
					value: this.anamnesis?.allergies,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
			medicationsInUse: [
				{
					value: this.anamnesis?.medicationsInUse,
					disabled: this.readOnly,
				},
				[Validators.nullValidator],
			],
		});

		this.onFormChange();
		this.form.valueChanges.subscribe(() => this.onFormChange());
	}
}
