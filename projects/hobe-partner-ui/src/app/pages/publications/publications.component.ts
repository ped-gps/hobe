import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import {
	AlertService,
	AuthenticationService,
	ClientService,
	Comment,
	CommentsComponent,
	CommentService,
	File,
	FileLoaded,
	InteractionsCountPipe,
	LoadingComponent,
	MediaComponent,
	ModelAction,
	ModelType,
	NoContentComponent,
	OperatorUtils,
	PageHeaderComponent,
	Partner,
	Publication,
	PublicationFilter,
	PublicationFilterUtils,
	PublicationService,
	RelativeTimePipe,
	UserPictureComponent,
	WebsocketService,
} from '@hobe/shared';

import { DialogPublicationComponent } from '../../components/dialog-publication/dialog-publication.component';

@Component({
	selector: 'app-publications',
	templateUrl: './publications.component.html',
	styleUrl: './publications.component.scss',
	imports: [
		ButtonModule,
		CommonModule,
		CommentsComponent,
		FormsModule,
		InteractionsCountPipe,
		LoadingComponent,
		MediaComponent,
		MenuModule,
		NoContentComponent,
		PageHeaderComponent,
		PaginatorModule,
		SelectModule,
		RelativeTimePipe,
		UserPictureComponent,
	],
})
export class PublicationsComponent implements OnInit, OnDestroy {
	public opt!: Array<MenuItem>;
	public partner!: Partner;
	public publicationSelected!: Publication | null;
	public selectedFilter!: PublicationFilter;
	public selectedDirection!: string;
	public directionOptions!: Array<any>;

	public filterOptions: Array<any> = [];
	public publications: Array<Publication> = [];
	public comments: Array<Comment> = [];

	public publicationPage = 0;
	public commentPage = 0;
	public size = 5;
	public totalElements = 0;
	public isLoading: boolean = false;

	private _wsTopics: string[] = [];
	private _subscriptions: Subscription[] = [];

	constructor(
		private readonly _alertService: AlertService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _clientService: ClientService,
		private readonly _commentService: CommentService,
		private readonly _dialogService: DialogService,
		private readonly _publicationService: PublicationService,
		private readonly _webSocketService: WebsocketService
	) {}
	
	async ngOnInit(): Promise<void> {
		this.selectedFilter = PublicationFilter.DATE;
		this.selectedDirection = 'desc';

		this.directionOptions = [
			{ label: 'Crescente', value: 'asc' },
			{ label: 'Descendente', value: 'desc' },
		];

		this.filterOptions = Object.values(PublicationFilter).map((filter) => ({
			label: PublicationFilterUtils.getFriendlyName(filter),
			value: filter,
		}));

		this.opt = [
			{
				label: 'Opções',
				items: [
					{
						label: 'Editar',
						icon: 'pi pi-pen-to-square',
						command: () => this._handlePublicationUpdate(),
					},
					{
						label: 'Excluir',
						icon: 'pi pi-trash',
						command: () => this._handlePublicationDelete(),
					},
				],
			},
		];

		await this._fetchData();
		this._listenWebSocketConnection();
	}

	ngOnDestroy(): void {
		// Cancela listeners RxJS
		this._subscriptions.forEach((sub) => sub.unsubscribe());

		// Cancela listeners no WebSocket
		this._wsTopics.forEach((topic) => {
			this._webSocketService.unsubscribe(topic);
		});
	}

	getPartnerName(): string {
		return this.partner && this.partner.name
			? this.partner.name
			: 'Parceiro';
	}

	onAddPublicationPress() {
		this._showDialogPublication();
	}

	async onPageChange(event: any) {
		this.publicationPage = event.first / event.rows;
		this.publicationSelected = null;
		await this._unsubscribePagedPublications();
		await this._refreshPublications();
	}

	async onPublicationPress(publication: Publication) {
		this.publicationSelected = publication;
		await this._loadComments();
	}

	onUpdatePublicationPress() {
		this._showDialogPublication(this.publicationSelected!);
	}

	async handleSituationFilterChange() {
		await this._refreshPublications();
	}

	isSelected(publication: Publication) {
		if (!this.publicationSelected) {
			return false;
		}
		return publication.id === this.publicationSelected.id;
	}

	async handleDirectionChange() {
		await this._refreshPublications();
	}

	toFileLoaded(file: File): FileLoaded {
		return {
			id: file.id,
			name: file.name,
			type: file.type,
			path: file.path,
			position: file.position,
			saved: true,
		} as FileLoaded;
	}

	toFilesLoaded(files: Array<File>): Array<FileLoaded> {
		return files.map((file) => this.toFileLoaded(file));
	}

	private async _fetchData() {
		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			this.partner = await this._authenticationService.retrieveUser();
			await this._refreshPublications();
		} finally {
			this.isLoading = false;
		}
	}

	private async _handlePublicationDelete() {
		const confirmed = await this._alertService.confirmMessage(
			`Tem certeza que deseja excluir a publicação?`,
		);

		if (confirmed) {
			await OperatorUtils.delay(500);
			await this._publicationService.delete(this.publicationSelected!.id!);
			this.publicationSelected = null;
			await this._refreshPublications();
		}
	}

	private _handlePublicationUpdate() {
		this._showDialogPublication(this.publicationSelected!);
	}

	private async _addListener(publication: Publication) {
		const topicPath = `/publications/${publication.id}`;

		if (this._wsTopics.some(t => t.includes(topicPath))) {
			return;
		}

		const topic = await this._webSocketService.subscribe(topicPath);
		if (topic) {
			this._wsTopics.push(topic);
		}
	}

	private async _addListeners() {
		for (const publication of this.publications) {
			await this._addListener(publication);
		}
	}

	private _listenWebSocketConnection() {
		const subscription = this._webSocketService
			.getConnected()
			.subscribe(async (connected) => {
				if (connected) {
					this._listemWebSocketMessages();
				}
			});

		this._subscriptions.push(subscription);
	}

	private _listemWebSocketMessages() {

		this._webSocketService.getMessage().subscribe(message => {

			if (message) {
				if (message.type === ModelType.PUBLICATION) {
					const publication = message.object as Publication;
					const index = this.publications.findIndex(p => p.id === publication.id);

					if (message.action === ModelAction.SAVE) {
						if (index === -1) {
							this.publications.unshift(publication);
							this.totalElements++;
							this._addListener(publication);
						}
					}

					if (message.action === ModelAction.UPDATE) {
						if (index !== -1) {
							this.publications[index] = publication;
						}
					}

					if (this.publicationSelected && this.publicationSelected.id === publication.id) {
						this.publicationSelected = publication;
					}
				} 

				this._changeDetector.markForCheck();
			}
		});
	}

	private async _loadComments() {
		if (this.publicationSelected) {
			try {
				const commentsPage = await this._commentService.search(
					this.commentPage,
					10,
					'createdDate',
					'desc',
					{
						publicationId: this.publicationSelected.id!,
					},
				);

				this.comments = commentsPage.content;

				for (let comment of this.comments) {
					const author = await this._clientService.findById(
						comment.authorId,
					);
					comment.authorName = author.name;
					comment.authorPicture = author.picture;
				}
			} finally {
				this._changeDetector.markForCheck();
			}
		}
	}

	private async _refreshPublications() {
		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			const filter = this.selectedFilter;
			const authorId = this.partner.id!;

			let sortBy = 'createdDate';
			if (filter === PublicationFilter.LIKES) {
				sortBy = 'likesCount';
			} else if (filter === PublicationFilter.COMMENTS) {
				sortBy = 'commentsCount';
			}

			const sortDirection = this.selectedDirection;
			const publicationsPage = await this._publicationService.search(
				this.publicationPage,
				this.size,
				sortBy,
				sortDirection,
				{ authorId },
			);

			publicationsPage.content.forEach((publication) =>
				publication.files.sort((a, b) => a.position - b.position),
			);

			this.publications = publicationsPage.content;
			this.totalElements = publicationsPage.page.totalElements;

			await this._addListeners();

		} finally {
			this._changeDetector.markForCheck();
			this.isLoading = false;
		}
	}

	private _showDialogPublication(publication?: Publication) {

		this._dialogService.open(DialogPublicationComponent, {
			data: {
				publication
			},
			header: publication ? 'Editar publicação' : 'Nova publicação',
			closable: true,
			modal: true,
			draggable: true,
			focusOnShow: false,
			styleClass: 'dialog-publication',
		})
		.onClose.subscribe(result => {

			if (result && result.change) {
				this._refreshPublications();
			}
		});
	}

	private async _unsubscribePagedPublications() {
		await Promise.all(
			this._wsTopics.map(topic => this._webSocketService.unsubscribe(topic))
		);
		this._wsTopics = [];
	}
}
