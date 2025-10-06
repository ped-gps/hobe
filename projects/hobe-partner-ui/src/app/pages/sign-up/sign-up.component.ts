import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { NgxMaskDirective } from 'ngx-mask';

import {
	AddressService,
	AlertService,
	Country,
	CountryUtils,
	FileLoaded,
	FileUtils,
	FormUtils,
	HintComponent,
	OperatorUtils,
	Partner,
	PartnerService,
	PartnerType,
	PartnerTypeUtils,
	State,
	StateUtils,
	UserProfile,
	UserService,
	UploadFilesComponent,
	FileSizePipe,
	PhonePipe,
	CpfCnpjPipe,
	ZipCodePipe,
} from '@hobe/shared';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrl: './sign-up.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		HintComponent,
		InputMaskModule,
		InputOtpModule,
		InputTextModule,
		NgxMaskDirective,
		PasswordModule,
		SelectModule,
		StepperModule,
		ReactiveFormsModule,
		UploadFilesComponent,
		FileSizePipe,
		PhonePipe,
		CpfCnpjPipe,
		ZipCodePipe,
	],
})
export class SignupComponent {
	public firstStepForm!: FormGroup;
	public secondStepForm!: FormGroup;
	public thirdStepForm!: FormGroup;

	public validationCode!: string;
	public partnerEmail!: string;

	public typeOptions: Array<any> = [];
	public stateOptions: Array<any> = [];
	public countryOptions: Array<any> = [];
	public partner: Partner | null = null;

	public files: Array<FileLoaded> = [];
	public establishmentFiles: Array<FileLoaded> = [];

	public isSubmitting: boolean = false;
	public active: number = 6;

	@ViewChild('fileInput') fileInput!: ElementRef;

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _alertService: AlertService,
		private readonly _addressService: AddressService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _formBuilder: FormBuilder,
		private readonly _location: Location,
		private readonly _partnerService: PartnerService,
		private readonly _userService: UserService,
		private readonly _router: Router,
	) {}

	async ngOnInit(): Promise<void> {
		this._activatedRoute.queryParams.subscribe((params) => {
			if (params) {
				if (params['step']) {
					this.active = Number(params['step']);
				}
				if (params['email']) {
					this.partnerEmail = String(params['email']);
				}
			}
		});

		this.typeOptions = Object.values(PartnerType).map((type) => ({
			label: PartnerTypeUtils.getFriendlyName(type),
			value: type,
		}));

		this.countryOptions = Object.values(Country).map((country) => ({
			label: CountryUtils.getFriendlyName(country),
			value: country,
		}));

		this.stateOptions = Object.values(State).map((state) => ({
			label: StateUtils.getFriendlyName(state),
			value: state,
		}));

		this._buildForms();
	}

	back() {
		this._location.back();
	}

	getCountryFriendlyName(country: Country): string {
		return CountryUtils.getFriendlyName(country);
	}

	getErrorMessage(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.getErrorMessage(form, controlName);
	}

	getStateFriendlyName(state: State): string {
		return StateUtils.getFriendlyName(state);
	}

	getTypeFriendlyName(type: PartnerType): string {
		return PartnerTypeUtils.getFriendlyName(type);
	}

	hasError(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.hasError(form, controlName);
	}

	async handleFileSelected(files: FileList) {
		const filesLoaded = await FileUtils.toFilesLoaded(files, {
			types: ['image', 'application/pdf'],
		});
		this.files.push(...filesLoaded);
		this._changeDetector.markForCheck();
	}

	handleRemoveFile(fileLoad: FileLoaded) {
		this.files = this.files.filter((file) => file.id !== fileLoad.id);
		this._changeDetector.markForCheck();
	}

	async handleEstablishmentFileSelected(files: FileList) {
		const filesLoaded = await FileUtils.toFilesLoaded(files, {
			types: ['image'],
		});
		this.establishmentFiles.push(...filesLoaded);
		this._changeDetector.markForCheck();
	}

	handleRemoveEstablishmentFile(fileLoad: FileLoaded) {
		this.establishmentFiles = this.establishmentFiles.filter(
			(file) => file.id !== fileLoad.id,
		);
		this._changeDetector.markForCheck();
	}

	async handleZipCodeComplete() {
		const zipCode = this.thirdStepForm?.get('zipCode')?.value;
		const address = await this._addressService.getByZipCode(zipCode);

		this.thirdStepForm?.patchValue({
			city: address.city,
			state: address.state,
			neighborhood: address.neighborhood,
			street: address.street,
		});
	}

	async onResendCode() {
		this.isSubmitting = true;
		await OperatorUtils.delay(500);

		try {
			const email = this.partnerEmail
				? this.partnerEmail
				: this.partner?.email!;
			await this._userService.resendCode(email);
			this._alertService.handleSuccess(
				`Código de validação reenviado para ${email}`,
			);
		} finally {
			this.isSubmitting = false;
		}
	}

	async onSubmit() {
		if (
			this.firstStepForm.valid &&
			this.secondStepForm.valid &&
			this.thirdStepForm.valid
		) {
			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {
				const firstStep = this.firstStepForm.getRawValue();
				const basePartner: Partial<Partner> = {
					...firstStep,
					...this.secondStepForm.getRawValue(),
					address: this.thirdStepForm.getRawValue(),
				};

				const cpfCnpj = (firstStep.cnpj || '').replace(/\D/g, '');
				if (cpfCnpj.length === 11) {
					(basePartner as any).cpf = cpfCnpj;
				}
				if (cpfCnpj.length === 14) {
					(basePartner as any).cnpj = cpfCnpj;
				}

				const partner: Partner = basePartner as Partner;
				const allFiles = [...this.files, ...this.establishmentFiles];
				this.partner = await this._partnerService.saveWithFiles(
					partner,
					allFiles,
				);
				this.active = 5;
			} finally {
				this.isSubmitting = false;
			}
		} else {
			FormUtils.markAsTouched(this.firstStepForm);
			FormUtils.markAsTouched(this.secondStepForm);
			FormUtils.markAsTouched(this.thirdStepForm);
			FormUtils.goToInvalidFields();
		}
	}

	async onValidate() {
		if (this.validationCode.length === 6) {
			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {
				const email = this.partnerEmail
					? this.partnerEmail
					: this.partner?.email!;

				await this._userService.emailVerify(
					email,
					this.validationCode,
					UserProfile.PARTNER,
				);

				this._alertService.handleSuccess(`
                    E-mail validado com sucesso!
                    \n\n
                    Sua conta está atualmente em análise pela nossa equipe. 
                    Em breve, você receberá uma atualização por e-mail informando o status da sua conta. Obrigado pela sua paciência!    
                `);
				this._router.navigate(['/']);
			} finally {
				this.isSubmitting = false;
			}
		}
	}

	triggerFileInput() {
		this.fileInput.nativeElement.click();
	}

	verifyFiles(): boolean {
		return this.files.length > 0;
	}

	verifyEstablishmentFiles(): boolean {
		return this.establishmentFiles.length > 0;
	}

	verifyPasswords(): boolean {
		const password = this.firstStepForm.get('password')?.value;
		const confirmPassword =
			this.firstStepForm.get('confirmPassword')?.value;

		if (!password || !confirmPassword || password !== confirmPassword) {
			this.firstStepForm
				.get('confirmPassword')
				?.setErrors({ mismatch: true });
			return false;
		} else {
			this.firstStepForm.get('confirmPassword')?.setErrors(null);
			return true;
		}
	}

	private _buildForms() {
		this.firstStepForm = this._formBuilder.group({
			name: [null, Validators.required],
			email: [null, [Validators.required, Validators.email]],
			cnpj: [null, Validators.required],
			phone: [null, Validators.required],
			type: [null, Validators.required],
			password: [
				null,
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(32),
				],
			],
			confirmPassword: [
				null,
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(32),
				],
			],
		});

		this.secondStepForm = this._formBuilder.group({
			administratorName: [null, Validators.required],
			administratorPhone: [null, Validators.required],
			administratorCpf: [null, Validators.required],
			administratorEmail: [null, [Validators.required, Validators.email]],
			files: [[] as File[]],
		});

		this.thirdStepForm = this._formBuilder.group({
			city: [null, Validators.required],
			street: [null, Validators.required],
			number: [null, Validators.required],
			neighborhood: [null, Validators.required],
			complement: [null],
			state: [null, Validators.required],
			zipCode: [null, Validators.required],
			country: [null, Validators.required],
		});
	}
}
