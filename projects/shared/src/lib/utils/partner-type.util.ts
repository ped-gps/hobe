import { PartnerType } from '../enums/partner-type';

export class PartnerTypeUtils {
	static getFriendlyName(type: PartnerType) {
		switch (type) {
			case PartnerType.CLINIC:
				return 'Clínica';
			case PartnerType.GYM:
				return 'Academia';
			case PartnerType.LABORATORY:
				return 'Laboratório';
			case PartnerType.PHARMACY:
				return 'Farmácia';
		}
	}
}
