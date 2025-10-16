import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';

import { ModelAction } from '../../enums/model-action';
import { ModelType } from '../../enums/model-type';
import { UserProfile } from '../../enums/user-profile';
import { Chat } from '../../models/chat';
import { Message } from '../../models/message';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { AuthenticationService } from '../../services/authentication.service';
import { MessageService } from '../../services/message.service';
import { WebsocketService } from '../../services/websocket.service';
import { OperatorUtils } from '../../utils/operator.util';
import { LoadingComponent } from '../loading/loading.component';
import { MediaComponent } from '../media/media.component';
import { File } from './../../models/file';
import { User } from './../../models/user';
import { FileLoaded, FileUtils } from './../../utils/file.util';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrl: './chat.component.scss',
	imports: [
		CommonModule,
		ButtonModule,
		FormsModule,
		InputGroupModule,
		InputTextModule,
		ReactiveFormsModule,
		LoadingComponent,
		RelativeTimePipe,
		MediaComponent
	]
})
export class ChatComponent implements OnInit, OnChanges {

	@Input({ required: true }) chat!: Chat;

	public messageContent: string | undefined;
	public messageFiles: Array<FileLoaded> | undefined;
	public user!: User;
	
	public messages: Array<Message> = [];

	public isLoading: boolean = false;
	public isSubmitting: boolean = false;
	public isRefreshing: boolean = false;

	private _recipientId!: string;
	private _page: number = 0;
	private _size: number = 20;
	private _totalPages: number = 0;

	constructor(
		private readonly _authenticationService: AuthenticationService,
		private readonly _changeDetector: ChangeDetectorRef,
		private readonly _messageService: MessageService,
		private readonly _webSocketService: WebsocketService
	) { }

	async ngOnInit(): Promise<void> {
		await this._fetchData();
		this._listenMessages();
	}

	async ngOnChanges(changes: SimpleChanges): Promise<void> {

		if (changes['chat'] && !changes['chat'].firstChange) {
			this.messages = [];
			this.messageContent = undefined;
			this.messageFiles = undefined;
			this.isSubmitting = false;
			this.isLoading = false;

			this._page = 0;
			this._totalPages = 0;

			await this.ngOnInit();
		}
	}

	hasViewed(message: Message) {
		const views = message.views || [];
		return views.some(view => view === this.user.id);
	}

	hasRecipientViewed(message: Message) {
		const views = message.views || [];
		return views.some(view => view === this._recipientId);
	}

	isAuthor(message: Message) {
		return this.user.id === message.authorId;
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'copy';
	}

	async onDrop(event: DragEvent): Promise<void> {
		event.preventDefault();
		const files = event.dataTransfer!.files;

		this.messageFiles = await FileUtils.toFilesLoaded(files);

		if (this.messageFiles.length > 0) {
			this.onSubmit();
		}
	}

	async onFileSelected(event: Event): Promise<void> {
		const inputElement = event.target as HTMLInputElement;
		const files = inputElement.files;

		this.messageFiles = await FileUtils.toFilesLoaded(files!);

		if (this.messageFiles.length > 0) {
			this.onSubmit();
		}
	}

	onSendFile() {
		document.getElementById('chat-input-file')?.click();
	}

	async onScroll(event: Event): Promise<void> {
		const element = event.target as HTMLElement;

		if (element.scrollTop === 0 && !this.isLoading) {
			if (!this._totalPages || this._page < this._totalPages) {
				this._page = this._page < this._totalPages ? this._page + 1 : this._page;
				await this._refreshMessages();
			}
		}
	}

	async onSubmit() {

		if (this.messageContent || this.messageFiles) {

			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {

				const authorType = this._getAuthorType();

				const message: Message = {
					chat: this.chat,
					authorId: this.user.id!,
					authorType: authorType,
					createdDate: new Date()
				} as any;

				if (this.messageContent) {
					message.content = this.messageContent;
				}

				const temporaryMessage: Message = {...message, id: Date.now().toString() };
				this.messages.push(temporaryMessage);
				this._scrollToBottom();

				if (this.messageFiles && this.messageFiles.length > 0) {

					const files = this.messageFiles
						.filter(file => !file.saved && file.file !== undefined)
					;

					const response = await this._messageService.saveWithFiles(message, files, {
						showSuccessMessage: false
					});

					this._handleMessageSent(response, temporaryMessage);
				} else {

					const response = await this._messageService.save(message, {
						showSuccessMessage: false
					});

					this._handleMessageSent(response, temporaryMessage);
				}

				this.messageContent = undefined;
				this.messageFiles = undefined;
			} finally {
				this._changeDetector.markForCheck();
				this.isSubmitting = false;
			}
		}
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
		return files.map(this.toFileLoaded);
	}

	private async _fetchData() {
		this.user = await this._authenticationService.retrieveUser();
		this._recipientId = this.chat.members.filter(member => member.objectId !== this.user.id)[0].objectId;
		await this._refreshMessages();
		this._scrollToBottom();
	}

	private _getAuthorType() {

		switch(this.user.profile) {
			case UserProfile.ADMINISTRATOR:
				return ModelType.ADMINISTRATOR;
			case UserProfile.CLIENT:
				return ModelType.CLIENT;
			case UserProfile.HEALTH_PROFESSIONAL:
				return ModelType.HEALTH_PROFESSIONAL;
			case UserProfile.PARTNER:
				return ModelType.PARTNER;
			case UserProfile.RECEPTIONIST:
				return ModelType.RECEPTIONIST;
		}
	}

	private _handleMessageSent(message: Message, temporaryMessage: Message) {

		const index = this.messages.findIndex(m => m.id === temporaryMessage.id);

		if (index !== -1) {
			this.messages[index] = message;
		}
	}

	private async _listenMessages() {

		this._webSocketService.getMessage().subscribe(async webSocketMessage => {

			if (webSocketMessage) {

				if (webSocketMessage.type === ModelType.MESSAGE) {
					const message: Message = webSocketMessage.object;

					if (webSocketMessage.action === ModelAction.SAVE || webSocketMessage.action === ModelAction.UPDATE) {
						const hasViewed = this.hasViewed(message);
                        const isAuthor = this.isAuthor(message);
                        const index = this.messages.findIndex(m => m.id === message.id);

                        if (index === -1 && !isAuthor) {
                            this.messages.push(message);
                            this.messages = this.messages.sort((a, b) => new Date(a.createdDate!).getTime() - new Date(b.createdDate!).getTime());
                            this._scrollToBottom();
                        } else {
                            this.messages[index] = message;
                        }

                        if (!hasViewed) {
                            this._updateMessageView([message]);
                        }
					}
				}
			}
		});
	}

	private async _refreshMessages() {

		if (!this.isRefreshing) {

			this.isRefreshing = true;

			try {

				const messagesPage = await this._messageService.search(this._page, this._size, "createdDate", "desc", { chatId: this.chat.id });
				messagesPage.content.sort((a, b) => new Date(a.createdDate!).getTime() - new Date(b.createdDate!).getTime());
				this.messages.unshift(...messagesPage.content);
				this._totalPages = messagesPage.page.totalPages;

				const unreadMessages = messagesPage.content.filter(message => !message.views.some(view => view === this.user.id));
				this._updateMessageView(unreadMessages);
			} finally {
				this._changeDetector.detectChanges();
				this.isRefreshing = false;
			}
		}
	}

	private _scrollToBottom(): void {
		setTimeout(() => {
			const contentContainer = document.querySelector('#chat .content');

			if (contentContainer) {
				contentContainer.scrollTop = contentContainer.scrollHeight;
			}
		}, 50);
	}

	private async _updateMessageView(messages: Array<Message>) {

		for(const message of messages) {
			this._messageService.updateViews(message.id!, this.user.id!);
			await OperatorUtils.delay(500);
		}
	}
}
