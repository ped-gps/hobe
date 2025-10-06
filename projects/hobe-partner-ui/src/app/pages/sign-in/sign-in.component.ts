import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import {
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
		RouterModule,
	],
})
export class SignInComponent {
	public form!: FormGroup;
	public keepConnected = false;
	public isSubmitting = false;

	Route = Route;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _formBuilder: FormBuilder,
		private readonly _router: Router,
	) {}

	ngOnInit(): void {
		this._authenticationService
			.getAuthentication()
			.subscribe((authentication) => {
				if (authentication) {
					this._router.navigate(['/home']);
				}
			});

		this.buildForm();
	}

	buildForm() {
		this.form = this._formBuilder.group({
			username: [null, Validators.required],
			password: [null, Validators.required],
		});
	}

	getErrorMessage(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.getErrorMessage(form, controlName);
	}

	hasError(form: FormGroup | FormArray, controlName: string) {
		return FormUtils.hasError(form, controlName);
	}

	async onSubmit() {
		if (this.form.valid) {
			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {
				const credentials: Credentials = Object.assign(
					{},
					this.form.getRawValue(),
				);
				await this._authenticationService.token(credentials);
				await this._authenticationService.init();
			} catch (error: any) {
				if (error.status === 403) {
					const email = this.form.get('username')?.value as string;
					this._router.navigate(['/signup'], {
						queryParams: { email, step: '4' },
					});
				}
			} finally {
				this.isSubmitting = false;
			}
		} else {
			FormUtils.markAsTouched(this.form);
			FormUtils.goToInvalidFields();
		}
	}
}
