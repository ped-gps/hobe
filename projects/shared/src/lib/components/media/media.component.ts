import { Component, Input } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';

import { FileType } from '../../enums/file-type';
import { File } from './../../models/file';
import { FileLoaded } from './../../utils/file.util';

@Component({
	selector: 'app-media',
	templateUrl: './media.component.html',
	styleUrl: './media.component.scss',
	imports: [
		GalleriaModule,
		ImageModule
	]
})
export class MediaComponent {
	
	@Input({ required: false }) files: Array<File> = [];
	@Input({ required: false }) medias: Array<FileLoaded> = [];
	@Input({ required: false }) hasDownload: boolean = false;
	
	public FileType = FileType;
}