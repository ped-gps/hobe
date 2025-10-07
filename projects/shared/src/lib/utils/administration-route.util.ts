import { AdministrationRoute } from '../enums/administration-route';

export abstract class AdministrationRouteUtils {
	static getFriendlyName(value: AdministrationRoute) {
		switch (value) {
			case AdministrationRoute.INTRAVENOUS:
				return 'Intravenosa';
			case AdministrationRoute.ORAL:
				return 'Oral';
			case AdministrationRoute.OTHER:
				return 'Outro';
			case AdministrationRoute.TOPIC:
				return 'Tópica';
			default:
				return 'Desconhecida';
		}
	}
}
