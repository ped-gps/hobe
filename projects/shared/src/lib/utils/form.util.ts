import { FormGroup, FormControl, FormArray } from '@angular/forms';

export class FormUtils {
	static getErrorMessage(
		form: FormGroup | FormArray,
		controlName: string,
	): string {
		for (const name in form.controls) {
			const control = form.get(name);

			if (name === controlName) {
				if (control instanceof FormControl) {
					if (control.hasError('required')) {
						return 'Campo obrigatório!';
					}

					if (control.hasError('minlength')) {
						const minLength =
							control.getError('minlength').requiredLength;
						return `O campo deve ter no mínimo ${minLength} caracteres`;
					}

					if (control.hasError('maxlength')) {
						const maxLength =
							control.getError('maxlength').requiredLength;
						return `Tamanho máximo excedido! Limite: ${maxLength}`;
					}

					if (control.hasError('mask')) {
						return 'Campo inválido!';
					}

					if (control.hasError('email')) {
						return 'E-mail inválido!';
					}
				}
			}

			if (control instanceof FormGroup || control instanceof FormArray) {
				const errorMessage = this.getErrorMessage(control, controlName);

				if (errorMessage) {
					return errorMessage;
				}
			}
		}

		return 'Error';
	}

	static goToInvalidFields() {
		const elements = document.getElementsByClassName('hint');

		if (elements && elements.length > 0) {
			elements[0].scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			});
		}
	}

	static hasError(form: FormGroup | FormArray, controlName: string): boolean {
		for (const name in form.controls) {
			const control = form.get(name);

			if (name === controlName) {
				if (control instanceof FormControl) {
					return (
						(control.hasError('required') ||
							control.hasError('minlength') ||
							control.hasError('maxlength') ||
							control.hasError('mask') ||
							control.hasError('email')) &&
						control.invalid &&
						control.touched
					);
				}
			}

			if (control instanceof FormGroup || control instanceof FormArray) {
				if (this.hasError(control, controlName)) {
					return true;
				}
			}
		}

		return false;
	}

	static markAsTouched(form: FormGroup | FormArray) {
		Object.values(form.controls).forEach((control) => {
			if (control instanceof FormControl) {
				control.markAsTouched();
			} else if (control instanceof FormGroup) {
				this.markAsTouched(control);
			} else if (control instanceof FormArray) {
				this.markAsTouched(control);
			}
		});

		return form;
	}

	static markAsUntouched(form: FormGroup) {
		Object.values(form.controls).forEach((control) => {
			if (control instanceof FormControl) {
				control.markAsUntouched();
			} else if (control instanceof FormGroup) {
				this.markAsUntouched(control);
			}
		});

		return form;
	}
}
