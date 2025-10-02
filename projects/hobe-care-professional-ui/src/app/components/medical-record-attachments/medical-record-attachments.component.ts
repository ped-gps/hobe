import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { 
    FileSizePipe, 
    FileUtils, 
    UploadFilesComponent 
} from '@hobe/shared';

@Component({
    selector: 'app-medical-record-attachments',
    templateUrl: './medical-record-attachments.component.html',
    styleUrl: './medical-record-attachments.component.scss',
    imports: [
        ButtonModule, 
        CommonModule, 
        UploadFilesComponent, 
        FileSizePipe
    ],
})
export class MedicalRecordAttachmentsComponent {

    @Input({ required: true }) attachments: any[] = [];
    @Input({ required: true }) readonly: boolean = false;
    @Output() attachmentsChange = new EventEmitter<any[]>();

    onAttachmentRemove(media: any) {
        this.attachments = this.attachments.filter((m) => m.id !== media.id);
        this.onAttachmentsChange();
    }

    async onFilesReceived(files: FileList) {
        const medias = await FileUtils.toFilesLoaded(files, {
            types: ['image', 'video'],
        });
        const lastPosition = Math.max(
            0,
            ...this.attachments.map((media) => media.position)
        );

        medias.forEach((media, index) => {
            media.position = lastPosition + (index + 1);
        });

        this.attachments = [...this.attachments, ...medias];
        this.onAttachmentsChange();
    }

    onAttachmentsChange() {
        this.attachmentsChange.emit(this.attachments);
    }
}
