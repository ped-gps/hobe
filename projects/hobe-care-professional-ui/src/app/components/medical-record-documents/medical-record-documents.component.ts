import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';

import {
	CERTIFICATE_MODELS,
	CERTIFICATE_TEMPLATES,
	MedicalAppointment,
	MedicalAppointmentService,
} from '@hobe/shared';

@Component({
	selector: 'app-medical-record-documents',
	templateUrl: './medical-record-documents.component.html',
	styleUrl: './medical-record-documents.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		EditorModule,
		FormsModule,
		SelectModule,
		DatePickerModule,
	],
})
export class MedicalRecordDocumentsComponent {
	@Input({ required: true }) medicalAppointment!: MedicalAppointment;

	public certificateDate!: any;
	public certificateModel!: string;
	public certificateText = '';
	public seletedTemplate!: any;

	public readonly certificateModelOptions = CERTIFICATE_MODELS;

	constructor(
		private readonly _medicalAppointmentService: MedicalAppointmentService,
	) {}

	onCertificateModelChange(modelKey: string) {
		this.seletedTemplate = CERTIFICATE_TEMPLATES[modelKey] || '';
		this.certificateText = this._fillTemplate(
			this.seletedTemplate,
			this._buildVars(),
		);
	}

	onDateChange() {
		const formattedDate = this.certificateDate
			? this.certificateDate.toLocaleDateString('pt-BR')
			: '__/__/___';

		this.certificateText = this._fillTemplate(this.seletedTemplate, {
			data: formattedDate,
		});
	}

	async onPrintDocuments(): Promise<void> {
		if (!this.medicalAppointment.id) {
			return;
		}

		let html = (this.certificateText || '').trim();

		if (!html) {
			const vars = this._buildVars();
			html = this._fillTemplate(this.seletedTemplate, vars);
		}

		html = `
            <div style="font-family: Arial, sans-serif; font-size: 14pt; line-height: 1.5;">
            ${html}
            </div>
        `;

		html = html.replace(
			/<h2([^>]*)>/,
			'<h2$1 align="center" style="font-size:18pt;">',
		);

		try {
			const blob: Blob =
				await this._medicalAppointmentService.printDocumentsCertificates(
					this.medicalAppointment.id,
					{ content: html },
				);

			const url = window.URL.createObjectURL(blob);
			window.open(url);
		} catch (err) {
			console.error('Erro ao gerar/baixar PDF:', err);
		}
	}

	private _buildVars(): Record<string, string> {
		const formattedDate = this.certificateDate
			? this.certificateDate.toLocaleDateString('pt-BR')
			: '__/__/____';
		return {
			data: formattedDate,
		};
	}

	private _fillTemplate(tpl: string, vars: Record<string, string>): string {
		return Object.entries(vars).reduce(
			(html, [key, val]) =>
				html.replace(new RegExp(`{{${key}}}`, 'g'), val),
			tpl,
		);
	}
}
