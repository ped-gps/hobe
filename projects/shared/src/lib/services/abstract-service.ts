import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap, catchError } from 'rxjs';

import { AlertService } from './alert.service';
import { Page } from '../models/page';

/**
 * Classe abstrata AbstractService
 *
 * @param <T> O tipo da entidade gerenciada por este serviço
 */
export abstract class AbstractService<T> {
	/**
	 * A URL base para as requisições HTTP deste serviço.
	 */
	protected abstract _baseURL: string;

	/**
	 * O cliente HTTP usado para fazer requisições.
	 */
	protected abstract _http: HttpClient;

	/**
	 * O serviço de alertas usado para exibir mensagens de sucesso ou erro.
	 */
	protected abstract _alertService: AlertService;

	/**
	 * Exclui uma entidade pelo seu ID.
	 *
	 * @param id O ID da entidade a ser excluída
	 * @param options Parâmetro opcional para exibição de mensagens de sucesso ou erro
	 * @return Uma Promise que resolve para um booleano indicando se a exclusão foi bem-sucedida
	 */
	delete(
		id: string,
		options?: { showSuccessMessage?: boolean; showErrorMessage?: boolean },
	): Promise<boolean> {
		options = {
			showSuccessMessage: true,
			showErrorMessage: true,
			...options,
		};

		return new Promise<boolean>((resolve, reject) => {
			this._http.delete(`${this._baseURL}/${id}`).subscribe({
				complete: () => {
					options.showSuccessMessage &&
						this._alertService.handleSuccess(
							'Excluído com sucesso!',
						);
					resolve(true);
				},
				error: (error) => {
					console.error(error);
					options.showErrorMessage &&
						this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	/**
	 * Encontra todas as entidades com paginação e ordenação.
	 *
	 * @param page O número da página a ser recuperada (padrão é 0)
	 * @param size O número de entidades por página (padrão é 10)
	 * @param sort O campo pelo qual as entidades devem ser ordenadas
	 * @param direction A direção da ordenação, 'asc' ou 'desc'
	 * @param options Parâmetro opcional para exibição de mensagens de erro
	 * @return Uma Promise que resolve para um objeto Page contendo as entidades
	 */
	findAll(
		page: number,
		size: number,
		sort: string,
		direction: string,
		options?: { showErrorMessage?: boolean },
	): Promise<Page<T>> {
		options = { showErrorMessage: true, ...options };

		return new Promise<Page<T>>((resolve, reject) => {
			const params: any = { page, size, sort, direction };

			this._http.get<Page<T>>(this._baseURL, { params }).subscribe({
				next: (items) => resolve(items),
				error: (error) => {
					console.error(error);
					options.showErrorMessage &&
						this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	/**
	 * Encontra uma entidade pelo seu ID.
	 *
	 * @param id O ID da entidade a ser encontrada
	 * @param options Parâmetro opcional para exibição de mensagens de erro
	 * @return Uma Promise que resolve para a entidade, ou null se não for encontrada
	 */
	findById(id: string, options?: { showErrorMessage?: boolean }): Promise<T> {
		options = { showErrorMessage: true, ...options };

		return new Promise<T>((resolve, reject) => {
			this._http.get<T>(`${this._baseURL}/${id}`).subscribe({
				next: (item) => resolve(item),
				error: (error) => {
					console.error(error);
					options.showErrorMessage &&
						this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	/**
	 * Salva uma nova entidade.
	 *
	 * @param object A entidade a ser salva
	 * @param options Parâmetro opcional para exibição de mensagens de sucesso ou erro
	 * @return Uma Promise que resolve para a entidade salva
	 */
	save(
		object: T,
		options?: { showSuccessMessage?: boolean; showErrorMessage?: boolean },
	): Promise<T> {
		options = {
			showSuccessMessage: true,
			showErrorMessage: true,
			...options,
		};
		object = this._removeEmptyProps(object);

		return firstValueFrom(
			this._http.post<T>(this._baseURL, object).pipe(
				tap(() => {
					options.showSuccessMessage &&
						this._alertService.handleSuccess(
							'Cadastrado com sucesso!',
						);
				}),
				catchError((error) => {
					options.showErrorMessage &&
						this._alertService.handleError(error);
					throw error;
				}),
			),
		);
	}

	/**
	 * Pesquisa por entidades com paginação, ordenação e filtragem opcional.
	 *
	 * @param page O número da página a ser recuperada (padrão é 0)
	 * @param size O número de entidades por página (padrão é 10)
	 * @param sort O campo pelo qual as entidades devem ser ordenadas
	 * @param direction A direção da ordenação, 'asc' ou 'desc'
	 * @param filters Campos opcionais de filtragem como um objeto
	 * @param options Parâmetro opcional para exibição de mensagens de erro
	 * @return Uma Promise que resolve para um objeto Page contendo as entidades
	 */
	search(
		page: number,
		size: number,
		sort: string,
		direction: string,
		filters: any,
		options?: { showErrorMessage?: boolean },
	): Promise<Page<T>> {
		options = { showErrorMessage: true, ...options };

		return new Promise<Page<T>>((resolve, reject) => {
			const validFilters = Object.fromEntries(
				Object.entries(filters).filter(([_, v]) => v !== undefined),
			);
			const params: any = {
				page,
				size,
				sort,
				direction,
				...validFilters,
			};

			this._http
				.get<Page<T>>(`${this._baseURL}/search`, { params })
				.subscribe({
					next: (items) => resolve(items),
					error: (error) => {
						console.error(error);
						options.showErrorMessage &&
							this._alertService.handleError(error);
						reject(error);
					},
				});
		});
	}

	/**
	 * Atualiza uma entidade existente.
	 *
	 * @param object A entidade a ser atualizada
	 * @param options Parâmetro opcional para exibição de mensagens de sucesso ou erro
	 * @return Uma Promise que resolve para a entidade atualizada
	 */
	update(
		object: T,
		options?: { showSuccessMessage?: boolean; showErrorMessage?: boolean },
	): Promise<T> {
		options = {
			showSuccessMessage: true,
			showErrorMessage: true,
			...options,
		};

		return firstValueFrom(
			this._http
				.put<T>(`${this._baseURL}/${(object as any).id}`, object)
				.pipe(
					tap(() => {
						if (options.showSuccessMessage) {
							this._alertService.handleSuccess(
								'Atualizado com sucesso!',
							);
						}
					}),
					catchError((error) => {
						console.error(error);
						if (options.showErrorMessage) {
							this._alertService.handleError(error);
						}
						throw error;
					}),
				),
		);
	}

	private _removeEmptyProps(obj: any): any {
		return Object.fromEntries(
			Object.entries(obj).filter(
				([, v]) =>
					v !== null &&
					v !== undefined &&
					(typeof v !== 'string' || v.trim() !== ''),
			),
		);
	}
}
