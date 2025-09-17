import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { AuthenticationService } from '../../services/authentication.service';
import { MedicalInsuranceService } from '../../services/medical-insurance.service';
import { ProcedureService } from '../../services/procedure.service';
import { ServiceService } from '../../services/service.service';
import { HintComponent } from '../hint/hint.component';
import { LoadingComponent } from '../loading/loading.component';
import { MedicalInsurance } from '../../models/medical-insurance';
import { Partner } from '../../models/partner';
import { Procedure } from '../../models/procedure';
import { Service } from '../../models/service';
import { FormUtils } from '../../utils/form.util';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
    selector: 'app-dialog-medical-insurance',
    templateUrl: './dialog-medical-insurance.component.html',
    styleUrl: './dialog-medical-insurance.component.scss',
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        HintComponent,
        IconFieldModule,
        InputIconModule,
        InputMaskModule,
        InputTextModule,
        LoadingComponent,
        ReactiveFormsModule,
        SelectModule,
        TableModule,
    ],
})
export class DialogMedicalInsuranceComponent implements OnInit {
    
    form!: FormGroup;
    medicalInsurance!: MedicalInsurance;
    partner!: Partner;
    procedures: Array<Procedure | Service> = [];
    selectedProcedures: Array<Procedure | Service> = [];
    textFilter!: string;
    
    isSubmitting: boolean = false;
    isLoading: boolean = false;
    
    private _time!: any;
    private _allProcedures: Array<Procedure | Service> = [];

    constructor(
        private readonly _authenticationService: AuthenticationService,
        private readonly _dialogConfig: DynamicDialogConfig,
        private readonly _dialogRef: DynamicDialogRef,
        private readonly _formBuilder: FormBuilder,
        private readonly _medicalInsuranceService: MedicalInsuranceService,
        private readonly _procedureService: ProcedureService,
        private readonly _serviceService: ServiceService
    ) {}

    async ngOnInit(): Promise<void> {
        this.medicalInsurance = this._dialogConfig.data['medicalInsurance'];
        await this._fetchData();
        this._buildForm();
    }

    getErrorMessage(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.getErrorMessage(form, controlName);
    }

    hasError(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.hasError(form, controlName);
    }

    onClose() {
        this._dialogRef.close({ change: false });
    }

    onInput() {
        clearTimeout(this._time);

        this._time = setTimeout(() => {
            this._applyLocalFilter();
        }, 500);
    }

    onSourceChange() {
        this._retrieveProcedures();
    }

    async onSubmit() {

        if (this.form.invalid) {
            FormUtils.markAsTouched(this.form);
            FormUtils.goToInvalidFields();
            return;
        }

        this.isSubmitting = true;
        await OperatorUtils.delay(500);

        try {

            const procedures = this.selectedProcedures
                .filter(procedure => procedure.type === 'PROCEDURE')
                .map(procedure => ({ id: procedure.id } as Procedure))
            ;
            
            const services = this.selectedProcedures
                .filter(service => service.type === 'SERVICE')
                .map(service => ({ id: service.id } as Service))
            ;

            const medicalInsurance: MedicalInsurance = {
                ...(this.medicalInsurance || {}),
                ...this.form.getRawValue(),
                partner: { id: this.partner.id } as Partner,
                procedures,
                services
            }

            if (medicalInsurance.id) {
                await this._medicalInsuranceService.update(medicalInsurance);
            } else {
                await this._medicalInsuranceService.save(medicalInsurance);
            }

            this._dialogRef.close({ change: true });
        } finally {
            this.isSubmitting = false;
        }
    }

    trackById(index: number, item: Procedure | Service): string {
        return item.id!;
    }

    private _applyLocalFilter() {
        const filter = (this.textFilter || '').trim().toLowerCase();

        this.procedures = this._allProcedures
            .filter(p =>
                p.name.toLowerCase().includes(filter) ||
                p.code?.toLowerCase().includes(filter)
            )
            .sort((a, b) => 
                a.name.toUpperCase().localeCompare(b.name.toUpperCase())
            );

        this._restoreSelection();
    }

    private _buildForm() {
        this.form = this._formBuilder.group({
            name: [
                this.medicalInsurance?.name,
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(100),
                ],
            ],
			email: [
				this.medicalInsurance?.email,
				[
					Validators.required,
					Validators.email,
					Validators.maxLength(100),
				],
			],
			phone: [
				this.medicalInsurance?.phone,
				[Validators.required]
			],
			code: [
				this.medicalInsurance?.code,
				[
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(15),
				],
			],
			procedures: [
				this.medicalInsurance?.procedures || [],
				[Validators.nullValidator],
			]
        });
    }

    private async _fetchData() {
        this.partner = await this._authenticationService.retrieveUser();

        if (this.medicalInsurance && this.medicalInsurance.id) {
            this._retrieveSelectedProcedures();
        }

        await this._retrieveProcedures();
    }

    private _restoreSelection() {
        const selectedIds = new Set(this.selectedProcedures.map(p => p.id));
        this.selectedProcedures = this._allProcedures.filter(p => selectedIds.has(p.id));
    }

    private async _retrieveSelectedProcedures() {
        const proceduresPage = await this._procedureService.search(-1, -1, 'name', 'asc', {
            medicalInsuranceId: this.medicalInsurance.id
        });

        const servicesPage = await this._serviceService.search(-1, -1, 'name', 'asc', {
            medicalInsuranceId: this.medicalInsurance.id
        });

        this.selectedProcedures = [
            ...proceduresPage.content.map(p => ({ ...p, type: 'PROCEDURE' } as Procedure)),
            ...servicesPage.content.map(s => ({ ...s, type: 'SERVICE' } as Service))
        ];
    }

    private async _retrieveProcedures() {
        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            const procedures: Array<Procedure | Service> = [];

            const proceduresPage = await this._procedureService.search(-1, -1, 'name', 'asc', {
                partnerId: this.partner.id,
            });

            procedures.push(
                ...proceduresPage.content.map(p => ({
                    ...p,
                    type: 'PROCEDURE'
                } as Procedure))
            );

            const servicesPage = await this._serviceService.search(-1, -1, 'name', 'asc', {
                partnerId: this.partner.id,
            });

            procedures.push(
                ...servicesPage.content.map(s => ({
                    ...s,
                    type: 'SERVICE'
                } as Service))
            );

            this._allProcedures = Array.from(new Map(procedures.map(p => [p.id, p])).values());
            this._applyLocalFilter();
        } finally {
            this.isLoading = false;
        }
    }
}
