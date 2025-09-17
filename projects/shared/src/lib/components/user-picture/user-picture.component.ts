import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { Client } from '../../models/client';
import { HealthProfessional } from '../../models/health-professional';
import { Partner } from '../../models/partner';
import { Receptionist } from '../../models/receptionist';
import { FileLoaded, FileUtils } from '../../utils/file.util';

@Component({
    selector: 'app-user-picture',
    templateUrl: './user-picture.component.html',
    styleUrl: './user-picture.component.scss',
    imports: [
        ButtonModule,
        CommonModule
    ]
})
export class UserPictureComponent {
    
    @Input({ required: true }) user!: Client | Partner | HealthProfessional | Receptionist | undefined;
    @Input({ required: false }) height: number = 24;
    @Input({ required: false }) width: number = 24;
    @Input({ required: false }) upload: boolean = false;

    @Output() fileSelected = new EventEmitter<FileLoaded>();
    @ViewChild('pictureInput') fileInput!: ElementRef<HTMLInputElement>;

    public pictureSelected!: FileLoaded;

    onDropAreaClick(): void {
        this.fileInput.nativeElement.click();
    }

    async onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        
        if (input && input.files && input.files.length > 0) {
            const file = input.files[0];
            const fileLoaded = await FileUtils.toFileLoaded(file);
            
            if (fileLoaded) {
                this.pictureSelected = fileLoaded;
                this.fileSelected.emit(fileLoaded);
            }
        } else {
            console.error('Nenhum arquivo selecionado.');
        }
    }
}