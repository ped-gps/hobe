import { CommonModule } from '@angular/common';
import {
	Component,
	ElementRef,
	EventEmitter,
	Output,
	ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-upload-files',
	imports: [CommonModule, ButtonModule],
	templateUrl: './upload-files.component.html',
	styleUrl: './upload-files.component.scss',
})
export class UploadFilesComponent {
	
	@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
	@Output() fileSelected = new EventEmitter<FileList>();

	triggerFileInput() {
		this.fileInput.nativeElement.click();
	}

	onFileSelected(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (files) {
			this.fileSelected.emit(files);
		}
	}
}
