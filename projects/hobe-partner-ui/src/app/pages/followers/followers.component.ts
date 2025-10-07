import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';

import {
    AlertService,
    AlertType,
    AuthenticationService,
    Chat,
    ChatService,
    DialogAlertComponent,
    Follower,
    FollowerService,
    ModelType,
    OperatorUtils,
    PageHeaderComponent,
    Partner,
    UUIDUtils,
} from '@hobe/shared';

@Component({
    selector: 'app-followers',
    templateUrl: './followers.component.html',
    styleUrls: ['./followers.component.scss'],
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        TableModule,
        PageHeaderComponent
    ]
})
export class FollowersComponent implements OnInit {

    public followers: Array<Follower> = [];
    public partner!: Partner;

    public searchText: string = '';
    public filterOptions: Array<any> = [];
    public selectedFilter!: 'MOST_RECENT' | 'OLDEST';

    public sortOptions: Array<any> = [];
    public directionOptions: Array<any> = [];

    public isSubmitting: boolean = false;
    public isLoading: boolean = false;

    public page: number = 0;
    public size: number = 10;
    public sort: string = 'createdDate';
    public direction: string = "desc";
    public totalElements: number = 0;

    private _time!: any;

    constructor(
        private readonly _alertService: AlertService,
        private readonly _authenticationService: AuthenticationService,
        private readonly _changeDetector: ChangeDetectorRef,
        private readonly _chatService: ChatService,
        private readonly _dialogService: DialogService,
        private readonly _followerService: FollowerService,
        private readonly _router: Router
    ) { }

    async ngOnInit(): Promise<void> {

        this.sortOptions = [
            {
                label: 'Nome',
                value: 'name'
            },
            {
                label: 'Data de Início',
                value: 'createdDate'
            }
        ];

        this.directionOptions = [
            {
                label: 'Crescente',
                value: 'asc'
            },
            {
                label: 'Decrescente',
                value: 'desc'
            }
        ];

        await this._fetchData();
    }

    onDirectionChange() {
        this._refreshFollowers();
    }

    async onFollowerChat(follower: Follower) {

        const code = await UUIDUtils.generateUniqueCode(follower.followerId, this.partner.id!);

        try {
            const chat = await this._chatService.findByCode(code, { showErrorMessage: false });
            this._handleChatExists(chat);
        } catch (error: any) {

            if (error.status === 404) {
                this._handleChatNotExists(follower);
            }
        }
    }

    async onFollowerRemove(follower: Follower) {

        const confirmed = await this._alertService.confirmMessage(
			`Tem certeza que deseja remover ${follower.followerName} dos seus seguidores?`
		);

		if (confirmed) {

			this.isSubmitting = true;
			await OperatorUtils.delay(500);

			try {
				await this._followerService.delete(follower.id!);
                this._refreshFollowers();
			} finally {
				this.isSubmitting = false;
			}
		}
    }

    onSortChange() {
        this._refreshFollowers();
    }

    onSearchTextChange() {
        clearTimeout(this._time);
        this._time = setTimeout(() => {
            this._refreshFollowers();
        }, 500);
    }

    onPageChange(event: any) {
        this.page = event.page;
        this.size = event.rows;
        this._refreshFollowers();
    }

    private async _fetchData() {

        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            this.partner = await this._authenticationService.retrieveUser();
            await this._refreshFollowers();
        } finally {
            this.isLoading = false;
        }
    }

    private _handleChatExists(chat: Chat) {
		this._router.navigate(['/chats', chat.id]);
	}

	private _handleChatNotExists(follower: Follower) {

		this._dialogService.open(DialogAlertComponent, {
			data: {
				type: AlertType.ATTENTION,
				title: 'Iniciar Conversa',
				message: 'Nenhuma conversa foi encontrada. Deseja iniciar uma nova conversa com este seguidor?',
				isConfirmation: true
			}
		})
		.onClose.subscribe(async (confirmed) => {

			if (confirmed) {
				let chat: Chat = {
					members: [
						{
							objectId: follower.followerId!,
							type: follower.followerType
						},
						{
							objectId: this.partner.id!,
							type: ModelType.PARTNER
						}
					]
				}
				
				chat = await this._chatService.save(chat);
				this._handleChatExists(chat);
			}
		});
	}

    private async _refreshFollowers() {
        const followersPage = await this._searchFollowers();
        this.followers = followersPage.content;
        this.totalElements = followersPage.page.totalElements;
        this._changeDetector.markForCheck();

    }

    private async _searchFollowers() {
        const profileId = this.partner.id!;
        const followerName = this.searchText.trim() || undefined;
        const followersPage = await this._followerService.search(this.page, this.size, this.sort, this.direction, { 
            profileId,
            followerName,
        });
        return followersPage;
    }
}
