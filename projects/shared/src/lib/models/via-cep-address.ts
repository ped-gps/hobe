export interface ViaCepAddress {
	erro: boolean;
	cep: string;
	logradouro: string;
	complemento: string;
	unidade: string;
	bairro: string;
	localidade: string;
	uf: string;
	estado: string;
	regiao: string;
	ibge: number;
	gia: string;
	ddd: number;
	siafi: number;
}
