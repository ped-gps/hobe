import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';

import { DialogAlertComponent } from '../components/dialog-alert/dialog-alert.component';
import { AlertType } from '../enums/alert-type';
import { HttpErrorUtils } from '../utils/http-error.util';

@Injectable({
	providedIn: 'root',
})
export class AlertService {
	constructor(private readonly _dialogService: DialogService) {}

	handleError(error: any) {
		this.showMessage(
			AlertType.ERROR,
			'Erro',
			HttpErrorUtils.getErrorMessage(error),
		);
	}

	handleSuccess(message: string) {
		this.showMessage(AlertType.SUCCESS, 'Confirmação', message);
	}

	showMessage(type: AlertType, title: string, message: string) {
		this._dialogService.open(DialogAlertComponent, {
			draggable: true,
			modal: true,
			closeOnEscape: false,
			data: {
				type,
				title,
				message,
			},
			styleClass: 'dialog-alert',
		});
	}

	confirmMessage(message: string) {
		return new Promise<boolean>((resolve) => {
			const dialogRef = this._dialogService.open(DialogAlertComponent, {
				draggable: true,
				modal: true,
				closeOnEscape: false,
				data: {
					type: AlertType.ATTENTION,
					title: 'Confirmação',
					message,
					isConfirmation: true,
				},
				styleClass: 'dialog-alert',
			});

			dialogRef.onClose.subscribe((result) => resolve(result));
		});
	}
}
