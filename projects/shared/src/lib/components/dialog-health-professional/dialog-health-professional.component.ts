import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { AuthenticationService } from '../../services/authentication.service';
import { HealthProfessionalService } from '../../services/health-professional.service';

import { CouncilType } from '../../enums/council-type';
import { Country } from '../../enums/country';
import { Gender } from '../../enums/gender';
import { MaritalStatus } from '../../enums/marital-status';
import { MedicalSpecialty } from '../../enums/medical-specialty';
import { State } from '../../enums/state';
import { Status } from '../../enums/status';
import { HealthProfessional } from '../../models/health-professional';
import { Partner } from '../../models/partner';
import { ViaCepService } from '../../services/via-cep.service';
import { CouncilTypeUtils } from '../../utils/council-type.util';
import { CountryUtils } from '../../utils/country.util';
import { FileLoaded } from '../../utils/file.util';
import { FormUtils } from '../../utils/form.util';
import { GenderUtils } from '../../utils/gender.util';
import { MaritalStatusUtils } from '../../utils/marital-status.util';
import { MedicalSpecialtyUtils } from '../../utils/medical-specialty.util';
import { OperatorUtils } from '../../utils/operator.util';
import { StateUtils } from '../../utils/state.util';
import { StatusUtils } from '../../utils/status.util';
import { HintComponent } from '../hint/hint.component';
import { UserPictureComponent } from '../user-picture/user-picture.component';

@Component({
    selector: 'app-dialog-health-professional',
    templateUrl: './dialog-health-professional.component.html',
    styleUrl: './dialog-health-professional.component.scss',
    imports: [
        AccordionModule,
        ButtonModule,
        DatePickerModule,
        FormsModule,
        InputMaskModule,
        InputTextModule,
        ReactiveFormsModule,
        HintComponent,
        PasswordModule,
        SelectModule,
        UserPictureComponent
    ],
})
export class DialogHealthProfessionalComponent implements OnInit {

    form!: FormGroup;
    partner!: Partner;
    healthProfessional!: HealthProfessional;
    picture!: FileLoaded;

	statusOptions!: Array<SelectItem>;
	maritalStatusOptions!: Array<SelectItem>;
	genderOptions!: Array<SelectItem>;
    stateOptions!: Array<SelectItem>;
    countryOptions!: Array<SelectItem>;
    councilTypeOptions!: Array<SelectItem>;
    medicalSpecialtyOptions!: Array<SelectItem>;

    isSubmitting: boolean = false;

    constructor(
        private readonly _authenticationService: AuthenticationService,
        private readonly _dialogConfig: DynamicDialogConfig,
        private readonly _dialogRef: DynamicDialogRef,
        private readonly _formBuilder: FormBuilder,
        private readonly _healthProfessionalService: HealthProfessionalService,
        private readonly _viaCepService: ViaCepService
    ) {}

    async ngOnInit(): Promise<void> {
        this.healthProfessional = this._dialogConfig.data['healthProfessional'];

        if (this.healthProfessional && this.healthProfessional.picture) {
            const { picture } = this.healthProfessional;
            
            this.picture = {
                id: picture.id,
                name: picture.originalName,
                path: picture.path,
                type: picture.type,
                saved: true
            }
        }

		this.statusOptions = Object.values(Status).map(value => ({
			label: StatusUtils.getFriendlyName(value),
			value: value
		}));

		this.maritalStatusOptions = Object.values(MaritalStatus).map(value => ({
			label: MaritalStatusUtils.getFriendlyName(value),
			value: value
		}))

		this.genderOptions = Object.values(Gender).map(value => ({
			label: GenderUtils.getFriendlyName(value),
			value: value
		}));

        this.stateOptions = Object.values(State).map(value => ({
            label: StateUtils.getFriendlyName(value),
            value: value
        }));

        this.countryOptions = Object.values(Country).map(value => ({
            label: CountryUtils.getFriendlyName(value),
            value: value
        }));

        this.councilTypeOptions = Object.values(CouncilType).map(value => ({
            label: CouncilTypeUtils.getFriendlyName(value),
            value: value
        }));

        this.medicalSpecialtyOptions = Object.values(MedicalSpecialty).map(value => ({
            label: MedicalSpecialtyUtils.getFriendlyName(value),
            value: value
        }));

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

    onPictureSelected(fileLoaded: FileLoaded) {
        this.picture = fileLoaded;
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

			const healthProfessional: HealthProfessional = {
				...(this.healthProfessional || {}),
				...this.form.getRawValue(),
				partner: { id: this.partner.id } as Partner,
                address: {
                    ...(this.healthProfessional?.address || {}),
                    ...this.form.get('address')?.value
                }
			}

			if (healthProfessional.id) {
				await this._healthProfessionalService.update(healthProfessional, { picture: this.picture });
            } else {
                await this._healthProfessionalService.save(healthProfessional, { picture: this.picture });
            }

			this._dialogRef.close({ change: true });
		} finally {
			this.isSubmitting = false;
		}
	}

    async onZipCodeComplete() {
        const zipCode = this.form.get(['address', 'zipCode'])?.value;
        const address = await this._viaCepService.findByCEP(zipCode);
        
        if (address) {
            this.form.get('address')?.patchValue(address);
        }
    }

    private _buildForm() {
        this.form = this._formBuilder.group({
            name: [
                this.healthProfessional?.name,
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(100),
                ],
            ],
            email: [
                this.healthProfessional?.email,
                [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(100),
                ],
            ],
            password: [
                this.healthProfessional?.password,
                [Validators.nullValidator, Validators.maxLength(32)],
            ],
            cpf: [
				this.healthProfessional?.cpf, 
				[Validators.required]
			],
            birthDate: [
                this.healthProfessional?.birthDate ? new Date(this.healthProfessional.birthDate + 'T00:00:00') : null,
                [Validators.required],
            ],
            phone: [
				this.healthProfessional?.phone, 
				[Validators.nullValidator]
			],
            status: [
				this.healthProfessional?.status, 
				[Validators.required]
			],
            maritalStatus: [
                this.healthProfessional?.maritalStatus,
                [Validators.nullValidator],
            ],
            gender: [
				this.healthProfessional?.gender, 
				[Validators.required]
			],
            address: this._formBuilder.group({
                street: [
                    this.healthProfessional?.address?.street,
                    [
                        Validators.required,
                        Validators.maxLength(100)
                    ],
                ],
                city: [
                    this.healthProfessional?.address?.city,
                    [
                        Validators.required,
                        Validators.maxLength(50)
                    ],
                ],
                state: [
                    this.healthProfessional?.address?.state,
                    [Validators.required],
                ],
                zipCode: [
                    this.healthProfessional?.address?.zipCode,
                    [Validators.required],
                ],
                number: [
                    this.healthProfessional?.address?.number,
                    [
                        Validators.required,
                        Validators.maxLength(10)
                    ],
                ],
                neighborhood: [
                    this.healthProfessional?.address?.neighborhood,
                    [
                        Validators.required,
                        Validators.maxLength(50)
                    ],
                ],
                country: [
                    this.healthProfessional?.address?.country,
                    [Validators.required],
                ],
                complement: [
                    this.healthProfessional?.address?.complement,
                    [
                        Validators.nullValidator,
                        Validators.maxLength(50)
                    ],
                ],
            }),
            rg: [
				this.healthProfessional?.rg, 
				[Validators.nullValidator]
			],
            rgIssuer: [
                this.healthProfessional?.rgIssuer,
                [Validators.nullValidator],
            ],
            cns: [
				this.healthProfessional?.cns, 
				[Validators.nullValidator]
			],
            councilType: [
                this.healthProfessional?.councilType,
                [Validators.required],
            ],
            councilCode: [
                this.healthProfessional?.councilCode,
                [Validators.required],
            ],
            specialty: [
                this.healthProfessional?.specialty,
                [Validators.required]
            ],
            nationality: [
                this.healthProfessional?.nationality,
                [Validators.nullValidator],
            ],
            birthState: [
                this.healthProfessional?.birthState,
                [Validators.nullValidator],
            ],
            birthCity: [
                this.healthProfessional?.birthCity,
                [Validators.nullValidator],
            ],
        });
    }

    private async _fetchData() {
        this.partner = await this._authenticationService.retrieveUser();
    }
}
