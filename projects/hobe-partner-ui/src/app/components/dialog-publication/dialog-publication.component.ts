import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { OrderListModule } from 'primeng/orderlist';
import { TextareaModule } from 'primeng/textarea';

import {
	AlertService,
	AuthenticationService,
	FileLoaded,
	FileUtils,
	FormUtils,
	HintComponent,
	MediaComponent,
	ModelType,
	OperatorUtils,
	Publication,
	PublicationService,
	UploadFilesComponent,
	User,
	UserProfile
} from '@hobe/shared';

@Component({
	selector: 'app-dialog-publication',
	templateUrl: './dialog-publication.component.html',
	styleUrl: './dialog-publication.component.scss',
	imports: [
		ButtonModule,
		FormsModule,
		HintComponent,
		OrderListModule,
		ReactiveFormsModule,
		TextareaModule,
		UploadFilesComponent,
		MediaComponent,
	],
})
export class DialogPublicationComponent implements OnInit {

	form!: FormGroup;
	publication!: Publication;
	filesLoaded!: Array<FileLoaded>;
	user!: User;

	isSubmitting: boolean = false;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _dialogConfig: DynamicDialogConfig,
		private readonly _dialogRef: DynamicDialogRef,
		private readonly _formBuilder: FormBuilder,
		private readonly _publicationService: PublicationService,
	) {}

	async ngOnInit(): Promise<void> {
		this.publication = this._dialogConfig.data['publication'];
		this.user = await this._authenticationService.retrieveUser();

		if (this.publication?.files) {
			
			this.filesLoaded = this.publication.files.map(file => ({
				id: file.id,
				name: file.name,
				path: file.path,
				type: file.type,
				position: file.position,
				saved: true,
			}));
		}

		this._buildForm(this.publication);
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

	async onFileSelected(files: FileList): Promise<void> {
		const filesLoaded = await FileUtils.toFilesLoaded(files);
		
		this.filesLoaded = [
			...(this.filesLoaded || []), 
			...filesLoaded
		];
		this._changeDetector.markForCheck();
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

			const publication: Publication = {
				...(this.publication || {}),
				...this.form.getRawValue(),
				authorId: this.user.id,
				authorType: this._getAuthorType(),
			};

			if (publication.id) {
				await this._publicationService.update(publication, {
					files: this.filesLoaded,
					showErrorMessage: true,
					showSuccessMessage: false,
				});
				this._alertService.handleSuccess("Publicação atualizada com sucesso!");
			} else {
				await this._publicationService.save(publication, {
					files: this.filesLoaded,
					showErrorMessage: true,
					showSuccessMessage: false,
				});
				this._alertService.handleSuccess("Publicação cadastrada com sucesso!");
			}

			this._dialogRef.close({ change: true });
		} finally {
			this.isSubmitting = false;
		}
	}

	private _buildForm(publication?: Publication): void {
		this.form = this._formBuilder.group({
			description: [publication?.description, Validators.nullValidator],
		});
	}

	private _getAuthorType() {
	
		switch(this.user.profile) {
			case UserProfile.ADMINISTRATOR:
				return ModelType.ADMINISTRATOR;
			case UserProfile.CLIENT:
				return ModelType.CLIENT;
			case UserProfile.HEALTH_PROFESSIONAL:
				return ModelType.HEALTH_PROFESSIONAL;
			case UserProfile.PARTNER:
				return ModelType.PARTNER;
			case UserProfile.RECEPTIONIST:
				return ModelType.RECEPTIONIST;
		}
	}
}
