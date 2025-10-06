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
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import {
	AppType,
	AuthenticationService,
	Credentials,
	FormUtils,
	HintComponent,
	OperatorUtils,
	Route,
} from '@hobe/shared';

@Component({
	selector: 'app-sign-in',
	templateUrl: './sign-in.component.html',
	styleUrl: './sign-in.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		HintComponent,
		InputTextModule,
		PasswordModule,
		ReactiveFormsModule,
	],
})
export class SignInComponent implements OnInit {
	public form!: FormGroup;
	public isSubmitting: boolean = false;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _formBuilder: FormBuilder,
		private readonly _router: Router,
	) {}

	ngOnInit(): void {
		this._buildForm();
		this._redirect();
	}

	getErrorMessage(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.getErrorMessage(form, controlName);
	}

	hasError(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.hasError(form, controlName);
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
			const credentials: Credentials = {
				...this.form.getRawValue(),
				appType: AppType.PARTNER,
			};

			await this._authenticationService.token(credentials);
			await this._authenticationService.init();
		} finally {
			this.isSubmitting = false;
		}
	}

	private _buildForm(): void {
		this.form = this._formBuilder.group({
			username: [null, [Validators.required, Validators.email]],
			password: [
				null,
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(32),
				],
			],
		});
	}

	private _redirect() {
		this._authenticationService.getAuthentication().subscribe(() => {
			if (this._authenticationService.isAuthenticated()) {
				this._router.navigate([Route.DASHBOARD]);
			}
		});
	}
}
