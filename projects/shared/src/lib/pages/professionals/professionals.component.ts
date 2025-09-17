import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';

import { 
    AlertService, 
    AuthenticationService, 
    DialogHealthProfessionalComponent, 
    DialogReceptionistComponent, 
    HealthProfessional, 
    HealthProfessionalService, 
    OperatorUtils, 
    Partner, 
    PhonePipe, 
    Receptionist, 
    ReceptionistService 
} from '@hobe/shared';

@Component({
    selector: 'app-professionals',
    templateUrl: './professionals.component.html',
    styleUrl: './professionals.component.scss',
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        MenuModule,
        TableModule,
        PhonePipe,
        RouterModule,
    ],
})
export class ProfessionalsComponent implements OnInit {
    
    partner!: Partner;
    healthProfessionals: Array<HealthProfessional> = [];
    receptionists: Array<Receptionist> = [];
    isLoading: boolean = false;
    isSubmitting: boolean = false;

    textFilter!: string;
    selectedHealthProfessional!: HealthProfessional;
    healthProfessionalMenuOptions: Array<MenuItem> = [];
    selectedReceptionist!: Receptionist;
    receptionistMenuOptions: Array<MenuItem> = [];

    selectedTab: 'health-professionals' | 'receptionists' =
        'health-professionals';

    page: number = 0;
    size: number = 10;
    sort: string = 'name';
    direction: string = 'asc';
    totalElements: number = 0;

    private _time!: any;

    constructor(
        private readonly _alertService: AlertService,
        private readonly _authenticationService: AuthenticationService,
        private readonly _changeDetector: ChangeDetectorRef,
        private readonly _dialogService: DialogService,
        private readonly _healthProfessionalService: HealthProfessionalService,
        private readonly _receptionistService: ReceptionistService
    ) {}

    ngOnInit(): void {
        this.healthProfessionalMenuOptions = [
            {
                label: 'Editar',
                command: () => this._onUpdateHealthProfessional(),
            },
            {
                label: 'Excluir',
                command: () => this._onDeleteHealthProfessional(),
            },
        ];

        this.receptionistMenuOptions = [
            {
                label: 'Editar',
                command: () => this._onUpdateReceptionist(),
            },
            {
                label: 'Excluir',
                command: () => this._onDeleteReceptionist(),
            },
        ];

        this._fetchData();
    }

    onAddHealthProfessional() {
        this._showDialogHealthProfessional();
    }

    onAddReceptionist() {
        this._showDialogReceptionist();
    }

    onInputChange() {
        clearTimeout(this._time);

        this._time = setTimeout(() => {
            if (this.selectedTab === 'health-professionals') {
                this._retrieveHealthProfessionals();
            } else {
                this._retrieveReceptionists();
            }
        }, 500);
    }

    onPageChange(event: any) {
        this.page = event.first / event.rows;
        
        if (this.selectedTab === 'health-professionals') {
            this._retrieveHealthProfessionals();
        } else {
            this._retrieveReceptionists();
        }
    }

    onSortChange(event: any) {
        this.sort = event.field;
        this.direction = event.order > 0 ? 'asc' : 'desc';
        
        if (this.selectedTab === 'health-professionals') {
            this._retrieveHealthProfessionals();
        } else {
            this._retrieveReceptionists();
        }
    }

    onTabChange(tab: 'health-professionals' | 'receptionists') {
        this.selectedTab = tab;
        this.page = 0;
        this.size = 10;
        this.sort = 'name';
        this.direction = 'asc';
        this.totalElements = 0;

        if (tab === 'health-professionals') {
            this._retrieveHealthProfessionals();
        } else {
            this._retrieveReceptionists();
        }
    }

    private async _fetchData() {
        this.partner = await this._authenticationService.retrieveUser();

        if (this.selectedTab === 'health-professionals') {
            this._retrieveHealthProfessionals();
        } else {
            this._retrieveReceptionists();
        }
    }

    private async _onDeleteHealthProfessional() {
        if (!this.selectedHealthProfessional) {
            return;
        }

        const confirmation = await this._alertService.confirmMessage(
            `Deseja excluir o profissional de saúde 
            ${this.selectedHealthProfessional!.name}? Essa ação é irreversível!`
        );

        if (confirmation) {
            this.isSubmitting = true;
            await OperatorUtils.delay(500);

            try {
                await this._healthProfessionalService.delete(this.selectedHealthProfessional!.id!);
                await this._retrieveHealthProfessionals();
            } finally {
                this.isSubmitting = false;
            }
        }
    }

    private async _onDeleteReceptionist() {
        if (!this.selectedReceptionist) {
            return;
        }

        const confirmation = await this._alertService.confirmMessage(
            `Deseja excluir o(a) recepcionista 
            ${this.selectedHealthProfessional!.name}? Essa ação é irreversível!`
        );

        if (confirmation) {
            this.isSubmitting = true;
            await OperatorUtils.delay(500);

            try {
                await this._receptionistService.delete(this.selectedHealthProfessional!.id!);
                await this._retrieveReceptionists();
            } finally {
                this.isSubmitting = false;
            }
        }
    }

    private _onUpdateHealthProfessional() {
        if (!this.selectedHealthProfessional) {
            return;
        }

        this._showDialogHealthProfessional(this.selectedHealthProfessional);
    }

    private _onUpdateReceptionist() {
        
        if (!this.selectedReceptionist) {
            return;
        }

        this._showDialogReceptionist(this.selectedReceptionist);
    }

    private async _retrieveHealthProfessionals() {
        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            const healthProfessionalsPage =
                await this._healthProfessionalService.search(
                    this.page,
                    this.size,
                    this.sort,
                    this.direction,
                    {
                        name: this.textFilter || undefined,
                        partnerId: this.partner.id,
                    }
                );

            this.healthProfessionals = healthProfessionalsPage.content;
            this.totalElements = healthProfessionalsPage.page.totalElements;
        } finally {
            this.isLoading = false;
            this._changeDetector.detectChanges();
        }
    }

    private async _retrieveReceptionists() {
        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            const receptionistsPage = await this._receptionistService.search(
                this.page,
                this.size,
                this.sort,
                this.direction,
                {
                    name: this.textFilter || undefined,
                    partnerId: this.partner.id,
                }
            );

            this.receptionists = receptionistsPage.content;
            this.totalElements = receptionistsPage.page.totalElements;
        } finally {
            this.isLoading = false;
            this._changeDetector.detectChanges();
        }
    }

    private _showDialogHealthProfessional(healthProfessional?: HealthProfessional) {
        this._dialogService
            .open(DialogHealthProfessionalComponent, {
                draggable: true,
                modal: true,
                header: 'Profissional de Saúde',
                closable: true,
                closeOnEscape: false,
                data: {
                    healthProfessional: healthProfessional,
                },
                styleClass: 'dialog-health-professional',
            })
            .onClose.subscribe((result) => {
                if (result && result.change) {
                    this._retrieveHealthProfessionals();
                }
            });
    }

    private _showDialogReceptionist(receptionist?: Receptionist) {
        this._dialogService
            .open(DialogReceptionistComponent, {
                draggable: true,
                modal: true,
                header: 'Recepcionista',
                closable: true,
                closeOnEscape: false,
                data: {
                    receptionist: receptionist,
                },
                styleClass: 'dialog-receptionist',
            })
            .onClose.subscribe((result) => {
                if (result && result.change) {
                    this._retrieveReceptionists();
                }
            });
    }
}
