import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'time'
})
export class TimePipe implements PipeTransform {

	transform(value: string, mask: string = 'HH:mm'): string {
		if (!value) return value;
	
		// Divide a string de tempo em partes
		const parts = value.split(':');
		if (parts.length < 2) return value; // Retorna o valor original se não for válido
	
		// Mapeia a máscara para os valores correspondentes
		const formattedTime = mask
		  .replace('HH', parts[0]) // Substitui horas
		  .replace('mm', parts[1]) // Substitui minutos
		  .replace('ss', parts[2] || '00'); // Substitui segundos (ou 00 se não existir)
	
		return formattedTime;
	}
}