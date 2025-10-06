export interface Page<T> {
	content: Array<T>;
	page: {
		size: number;
		number: number;
		totalElements: number;
		totalPages: number;
	};
}
