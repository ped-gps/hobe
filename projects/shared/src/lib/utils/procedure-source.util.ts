import { ProcedureSource } from '../enums/procedure-source';

export abstract class ProcedureSourceUtils {
	static getFriendlyName(value: ProcedureSource) {
		switch (value) {
			case ProcedureSource.CLINIC:
				return 'Clínica';
			case ProcedureSource.MARKETPLACE:
				return 'Marketplace';
		}
	}
}
