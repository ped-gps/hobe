import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'interactionsCount'
})
export class InteractionsCountPipe implements PipeTransform {

    transform(value: number): string {

        if (value == null || isNaN(value)) return '0';

        if (value < 1000) {
            return value.toString();
        }

        if (value < 1000000) {
            const thousands = value / 1000;
            return `${parseFloat(thousands.toFixed(1))}k`;
        }

        if (value < 1000000000) {
            const millions = value / 1000000;
            return `${parseFloat(millions.toFixed(1))}M`;
        }

        const billions = value / 1000000000;
        return `${parseFloat(billions.toFixed(1))}B`;
    }
}
