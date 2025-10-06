import { FileType } from '../enums/file-type';
import { FileTypeUtils } from './file-type.util';

export type FileLoaded = {
	id: string | number | undefined;
	file?: File;
	path: any;
	name: string;
	type: FileType;
	position?: number;
	saved: boolean;
};
export class FileUtils {
	static toBase64(image: File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.readAsDataURL(image);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	/**
	 * Handles file by processing them according to the specified options.
	 *
	 * @param {FileList} files - The list of files to be processed.
	 * @param {Object} [options] - Optional settings for handling media.
	 * @param {number} [options.maxSize] - The maximum allowed size for the files in megabytes.
	 * @param {string[]} [options.types] - The allowed file types (e.g., ['image', 'video']).
	 * @returns {Promise<Media[]>} A promise that resolves to an array of Media objects.
	 */
	static async toFileLoaded(
		file: File,
		options?: { maxSize?: number; types?: string[] },
	): Promise<FileLoaded | null> {
		const maxFileSize = options?.maxSize
			? options.maxSize * 1024 * 1024
			: Infinity;
		const isTypeAllowed =
			!options?.types ||
			options.types.some((type) => file.type.startsWith(type));

		if (file.size > maxFileSize || !isTypeAllowed) return null;

		const data = await FileUtils.toBase64(file);

		return {
			id: new Date().getTime(),
			file,
			path: data,
			name: file.name,
			type: FileTypeUtils.getType(file.name),
			saved: false,
		};
	}

	/**
	 * Handles files by processing them according to the specified options.
	 *
	 * @param {FileList} files - The list of files to be processed.
	 * @param {Object} [options] - Optional settings for handling media.
	 * @param {number} [options.maxSize] - The maximum allowed size for the files in megabytes.
	 * @param {string[]} [options.types] - The allowed file types (e.g., ['image', 'video']).
	 * @returns {Promise<Media[]>} A promise that resolves to an array of Media objects.
	 */
	static async toFilesLoaded(
		files: FileList,
		options?: { maxSize?: number; types?: string[] },
	): Promise<FileLoaded[]> {
		const promises: Promise<FileLoaded | null>[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			promises.push(FileUtils.toFileLoaded(file, options));
		}

		const resolvedFiles = await Promise.all(promises);

		return resolvedFiles
			.filter(
				(fileLoaded): fileLoaded is FileLoaded => fileLoaded !== null,
			)
			.map((fileLoaded, index) => ({
				...fileLoaded,
				position: index + 1,
				id: fileLoaded.id ?? `${Date.now()}_${index}`,
			}));
	}
}
