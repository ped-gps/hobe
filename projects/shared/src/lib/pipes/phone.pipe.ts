import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
})
export class PhonePipe implements PipeTransform {

    transform(value: string | number | undefined): string {
        if (!value) return '';

        const cleaned = value.toString().replace(/\D/g, '');

        if (cleaned.length === 11) {
            // Celular: (XX) XXXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            // Fixo: (XX) XXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return value.toString(); // Retorna como está se o número não for 10 ou 11 dígitos
        }
    }
}
