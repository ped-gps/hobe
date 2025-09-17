import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AlertType } from '../../enums/alert-type';

@Component({
	selector: 'app-dialog-alert',
	templateUrl: './dialog-alert.component.html',
	styleUrl: './dialog-alert.component.scss',
	imports: [
		ButtonModule,
		CommonModule
	],
})
export class DialogAlertComponent {

	public type!: AlertType;
    public title!: string;
    public message!: string;
    public isConfirmation: boolean = false;

    constructor(
        private readonly _dialogConfig: DynamicDialogConfig,
        private readonly _dialogRef: DynamicDialogRef
    ) { }

    ngOnInit(): void {
        this.type = this._dialogConfig.data['type'];
        this.title = this._dialogConfig.data['title'];
        this.message = this._dialogConfig.data['message'];
        this.isConfirmation = this._dialogConfig.data['isConfirmation'] || false;
    }

    confirm() {
        this._dialogRef.close(true);
    }

    cancel() {
        this._dialogRef.close(false);
    }

    close() {
        this._dialogRef.close();
    }
}