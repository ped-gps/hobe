export abstract class DateUtils {
	static formatDateWithoutTimezone = (date: Date): string => {
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
	};

	static toLocaleDateString(dateStr: string): string {
		const date = new Date(dateStr.split('T')[0] + 'T00:00:00');
		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
		});
	}

	static plusHours(date: any, hours: number) {
		const newDate = new Date(date);
		newDate.setHours(newDate.getHours() + hours);
		return newDate;
	}
}
