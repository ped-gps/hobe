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

import { Country } from '../../enums/country';
import { Gender } from '../../enums/gender';
import { MaritalStatus } from '../../enums/marital-status';
import { State } from '../../enums/state';
import { Status } from '../../enums/status';
import { Client } from '../../models/client';
import { AlertService } from '../../services/alert.service';
import { ClientService } from '../../services/client.service';
import { ViaCepService } from '../../services/via-cep.service';
import { CountryUtils } from '../../utils/country.util';
import { FileLoaded } from '../../utils/file.util';
import { FormUtils } from '../../utils/form.util';
import { GenderUtils } from '../../utils/gender.util';
import { MaritalStatusUtils } from '../../utils/marital-status.util';
import { OperatorUtils } from '../../utils/operator.util';
import { StateUtils } from '../../utils/state.util';
import { StatusUtils } from '../../utils/status.util';
import { HintComponent } from '../hint/hint.component';
import { UserPictureComponent } from '../user-picture/user-picture.component';

@Component({
	selector: 'app-dialog-client',
	templateUrl: './dialog-client.component.html',
	styleUrl: './dialog-client.component.scss',
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
		UserPictureComponent,
	],
})
export class DialogClientComponent implements OnInit {
	form!: FormGroup;
	client!: Client;
	picture!: FileLoaded;

	statusOptions!: Array<SelectItem>;
	maritalStatusOptions!: Array<SelectItem>;
	genderOptions!: Array<SelectItem>;
	stateOptions!: Array<SelectItem>;
	countryOptions!: Array<SelectItem>;

	isSubmitting: boolean = false;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _clientService: ClientService,
		private readonly _dialogConfig: DynamicDialogConfig,
		private readonly _dialogRef: DynamicDialogRef,
		private readonly _formBuilder: FormBuilder,
		private readonly _viaCepService: ViaCepService,
	) {}

	async ngOnInit(): Promise<void> {
		this.client = this._dialogConfig.data['client'];

		if (this.client && this.client.picture) {
			const { picture } = this.client;

			this.picture = {
				id: picture.id,
				name: picture.originalName,
				path: picture.path,
				type: picture.type,
				saved: true,
			};
		}

		this.statusOptions = Object.values(Status).map((value) => ({
			label: StatusUtils.getFriendlyName(value),
			value: value,
		}));

		this.maritalStatusOptions = Object.values(MaritalStatus).map(
			(value) => ({
				label: MaritalStatusUtils.getFriendlyName(value),
				value: value,
			}),
		);

		this.genderOptions = Object.values(Gender).map((value) => ({
			label: GenderUtils.getFriendlyName(value),
			value: value,
		}));

		this.stateOptions = Object.values(State).map((value) => ({
			label: StateUtils.getFriendlyName(value),
			value: value,
		}));

		this.countryOptions = Object.values(Country).map((value) => ({
			label: CountryUtils.getFriendlyName(value),
			value: value,
		}));

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

	async onSubmit() {
		if (this.form.invalid) {
			FormUtils.markAsTouched(this.form);
			FormUtils.goToInvalidFields();
			return;
		}

		this.isSubmitting = true;
		await OperatorUtils.delay(500);

		try {
			const client: Client = {
				...(this.client || {}),
				...this.form.getRawValue(),
				address: {
					...(this.client?.address || {}),
					...this.form.get('address')?.value,
				},
			};

			if (client.id) {
				await this._clientService.update(client);
				this._alertService.handleSuccess('Atualizado com sucesso!');
			} else {
				await this._clientService.save(client);
				this._alertService.handleSuccess('Cadastrado com sucesso!');
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
				this.client?.name,
				[
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(100),
				],
			],
			email: [
				this.client?.email,
				[
					Validators.required,
					Validators.email,
					Validators.maxLength(100),
				],
			],
			password: [
				this.client?.password,
				[Validators.nullValidator, Validators.maxLength(32)],
			],
			cpf: [this.client?.cpf, [Validators.required]],
			birthDate: [
				this.client?.birthDate
					? new Date(this.client.birthDate + 'T00:00:00')
					: null,
				[Validators.required],
			],
			phone: [this.client?.phone, [Validators.nullValidator]],
			status: [this.client?.status, [Validators.required]],
			maritalStatus: [
				this.client?.maritalStatus,
				[Validators.nullValidator],
			],
			gender: [this.client?.gender, [Validators.required]],
			address: this._formBuilder.group({
				street: [
					this.client?.address?.street,
					[Validators.required, Validators.maxLength(100)],
				],
				city: [
					this.client?.address?.city,
					[Validators.required, Validators.maxLength(50)],
				],
				state: [this.client?.address?.state, [Validators.required]],
				zipCode: [this.client?.address?.zipCode, [Validators.required]],
				number: [
					this.client?.address?.number,
					[Validators.required, Validators.maxLength(10)],
				],
				neighborhood: [
					this.client?.address?.neighborhood,
					[Validators.required, Validators.maxLength(50)],
				],
				country: [this.client?.address?.country, [Validators.required]],
				complement: [
					this.client?.address?.complement,
					[Validators.nullValidator, Validators.maxLength(50)],
				],
			}),
		});
	}
}
