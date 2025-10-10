import { Component, Input } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';

import { FileType } from '../../enums/file-type';
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
	
	@Input({ required: false }) files: Array<FileLoaded> = [];
	@Input({ required: false }) hasDownload: boolean = false;
	@Input({ required: false }) height: string = '100%';
	@Input({ required: false }) width: string = '100%';

	FileType = FileType;
}