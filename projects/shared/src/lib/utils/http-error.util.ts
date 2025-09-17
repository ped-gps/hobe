export abstract class HttpErrorUtils {

    static getErrorMessage(error: any): string {

		if (error.status === 400) {

			if (Array.isArray(error.error)) {
				return error.error[0].message;
			}

			return error.error.message;
		}

		if (error.status === 0) {
			// window.location.href = "/under-maintenance"
			return "Servidores offline, por favor, contate o suporte técnico!";
		}

		if (error.status === 401) {
			// window.location.href = '/';
			return error.error?.message || "";
		}

		if (error.status === 403) {
			return "Permissão negada!";
		}

		if (error.status === 404) {
			return error.error?.message ?? "Conteúdo não encontrado!";
		}

		if (error.status === 413) {
			return "Tamanho máximo de arquivo para upload excedido!";
		}

		if (error.status === 500) {
			return error.message ?? "";
		}

		if (error.status === 501) {
			return "Operação não permitida!";
		}
		if (error.status === 409) {
			return error.error?.message ?? "Este item não pode ser excluído, pois está vinculado a outros elementos no sistema.";
		}

		return error.message || error.error.message || "Erro inesperado!";
    }
}