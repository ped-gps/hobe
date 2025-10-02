export interface DropdownOption {
    value: string;
    label: string;
}

export const CERTIFICATE_MODELS: DropdownOption[] = [
    { value: 'atestado-medico', label: 'Atestado Médico' },
    { value: 'atestado-comparecimento', label: 'Atestado de Comparecimento' },
    { value: 'declaracao-saude', label: 'Declaração de Saúde' },
    { value: 'laudo-medico', label: 'Laudo Médico' },
    { value: 'atestado-incapacidade', label: 'Atestado de Incapacidade Laboral' }
];
