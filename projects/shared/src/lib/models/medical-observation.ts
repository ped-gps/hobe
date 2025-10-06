import { AbstractModel } from './abstract-model';

export interface MedicalObservation extends AbstractModel {
	general: string;
	hypothesesClinicalAnalyses: string;
	therapeuticStrategiesUsed: string;
	forwardingFuturePlans: string;
}
