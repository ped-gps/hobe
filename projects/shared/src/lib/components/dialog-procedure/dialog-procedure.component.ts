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
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from "primeng/select";
import { startWith } from 'rxjs';

import { PayoutType } from '../../enums/payout-type';
import { Partner } from '../../models/partner';
import { Procedure } from '../../models/procedure';
import { AuthenticationService } from '../../services/authentication.service';
import { HealthProfessionalService } from '../../services/health-professional.service';
import { ProcedureService } from '../../services/procedure.service';
import { FormUtils } from '../../utils/form.util';
import { OperatorUtils } from '../../utils/operator.util';
import { PayoutTypeUtils } from '../../utils/payout-type.util';
import { HintComponent } from '../hint/hint.component';

@Component({
    selector: 'app-dialog-procedure',
    templateUrl: './dialog-procedure.component.html',
    styleUrl: './dialog-procedure.component.scss',
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputMaskModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        HintComponent,
    ],
})
export class DialogProcedureComponent implements OnInit {
    
    form!: FormGroup;
    partner!: Partner;
    procedure!: Procedure;
    
    healthProfessionalOptions!: Array<SelectItem>;
    payoutTypeOptions!: Array<SelectItem>;

    isSubmitting: boolean = false;

    constructor(
        private readonly _authenticationService: AuthenticationService,
        private readonly _dialogConfig: DynamicDialogConfig,
        private readonly _dialogRef: DynamicDialogRef,
        private readonly _formBuilder: FormBuilder,
        private readonly _healthProfessionalService: HealthProfessionalService,
        private readonly _procedureService: ProcedureService
    ) {}

    ngOnInit(): void {
        this.procedure = this._dialogConfig.data['procedure'];

        this.payoutTypeOptions = Object.values(PayoutType).map(value => ({
            label: PayoutTypeUtils.getFriendlyName(value),
            value: value
        }));

        this._buildForm();
        this._addFormObservers();
        this._fetchData();
    }

    getErrorMessage(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.getErrorMessage(form, controlName);
    }

    getPayoutValue() {
        return this.form.get('payoutValue')?.value;
    }

    hasError(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.hasError(form, controlName);
    }

    onClose() {
        this._dialogRef.close({ change: false });
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
            
            const procedure: Procedure = {
                ...(this.procedure || {}),
                ...this.form.getRawValue(),
                partner: { id: this.partner.id } as Partner,
            };

            if (procedure.id) {
                await this._procedureService.update(procedure);
            } else {
                await this._procedureService.save(procedure);
            }

            this._dialogRef.close({ change: true });
        } finally {
            this.isSubmitting = false;
        }
    }

    private _addFormObservers() {
        const payoutTypeCtrl   = this.form.get('payoutType')!;
        const payoutValueCtrl  = this.form.get('payoutValue')!;

        payoutTypeCtrl.valueChanges
            .pipe(startWith(payoutTypeCtrl.value)) 
            .subscribe((type: PayoutType | null) => {
            
                if (type) {
                    
                    const validators = [Validators.required, Validators.min(0)];

                    if (type === PayoutType.PERCENTAGE) {
                        validators.push(Validators.max(100));
                    }

                    payoutValueCtrl.enable({ emitEvent: false });
                    payoutValueCtrl.setValidators(validators);
                } else {
                    payoutValueCtrl.disable({ emitEvent: false });
                    payoutValueCtrl.clearValidators();
                    payoutValueCtrl.setValue(null, { emitEvent: false });
                }

                payoutValueCtrl.updateValueAndValidity({ emitEvent: false });
            })
        ;
    }

    private _buildForm() {
        this.form = this._formBuilder.group({
            name: [
                this.procedure?.name,
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(100),
                ],
            ],
            value: [
                this.procedure?.value,
                [Validators.required, Validators.min(0)],
            ],
            code: [
                this.procedure?.code,
                [Validators.nullValidator, Validators.maxLength(10)],
            ],
            payoutType:[
                this.procedure?.payoutType,
                [Validators.nullValidator]
            ],
            payoutValue: [
                { 
                    value: this.procedure?.payoutValue ?? null, 
                    disabled: !this.procedure?.payoutType 
                }, 
                [Validators.nullValidator]
            ],
            healthProfessional: [
                this.procedure?.healthProfessional,
                [Validators.required]
            ]
        });
    }

    private async _fetchData() {
        
        this.partner = await this._authenticationService.retrieveUser();
        
        const healthProfessionalsPage = await this._healthProfessionalService.search(-1, -1, 'name', 'asc', {
            partnerId: this.partner.id,
        });

        this.healthProfessionalOptions = healthProfessionalsPage.content.map((healthProfessional) => ({
            label: `${healthProfessional.name} | ${healthProfessional.councilCode}`,
            value: healthProfessional,
        }));
    }
}
