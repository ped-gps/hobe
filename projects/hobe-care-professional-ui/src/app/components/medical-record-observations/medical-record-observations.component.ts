import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

import { MedicalObservation } from '@hobe/shared';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-medical-record-observations',
    templateUrl: './medical-record-observations.component.html',
    styleUrl: './medical-record-observations.component.scss',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
		TextareaModule,
        TooltipModule,
    ],
})
export class MedicalRecordObservationsComponent implements OnInit {

	@Input({ required: true }) medicalObservation: MedicalObservation | undefined;
	@Input({ required: true }) readOnly: boolean = false;
    @Output() medicalObservationFormChange = new EventEmitter<FormGroup>();
	
	public form!: FormGroup;

	constructor(
		private readonly _formBuilder: FormBuilder
	) {}

	ngOnInit(): void {
		this._buildForm();
	}

	onMedicalObservationFormChange(form: FormGroup) {
		this.medicalObservationFormChange.emit(form);
	}

	private _buildForm() {

		this.form = this._formBuilder.group({
			general: [
				{
					value: this.medicalObservation?.general,
					disabled: this.readOnly
				},
				[Validators.nullValidator]
			],
			hypothesesClinicalAnalyses: [
				{
					value: this.medicalObservation?.hypothesesClinicalAnalyses,
					disabled: this.readOnly
				},
				[Validators.nullValidator]
			],
			therapeuticStrategiesUsed: [
				{
					value: this.medicalObservation?.therapeuticStrategiesUsed,
					disabled: this.readOnly
				},
				[Validators.nullValidator]
			],
			forwardingFuturePlans: [
				{
					value: this.medicalObservation?.forwardingFuturePlans,
					disabled: this.readOnly
				},
				[Validators.nullValidator]
			]
		});

		this.onMedicalObservationFormChange(this.form);
		this.form.valueChanges.subscribe(() => this.onMedicalObservationFormChange(this.form));
	}
}
