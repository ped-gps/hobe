import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

	transform(value: number): string {

        if (value == null || isNaN(value)) return '0 bytes';

        const units = ['bytes', 'KB', 'MB', 'GB'];
        let size = value;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size = size / 1024;
            unitIndex++;
        }

        return `${parseFloat(size.toFixed(2))} ${units[unitIndex]}`;
    }
}