import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
    AlertService,
    AuthenticationService,
    DialogProcedureComponent,
    OperatorUtils,
    Partner,
    Procedure,
    ProcedureService,
    ProcedureSource,
    ProcedureSourceUtils,
    Service,
    ServiceService
} from '@hobe/shared';

@Component({
    selector: 'app-procedures',
    templateUrl: './procedures.component.html',
    styleUrl: './procedures.component.scss',
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        MenuModule,
        SelectModule,
        TableModule,
    ],
})
export class ProceduresComponent implements OnInit {
    
    partner!: Partner;
    procedures: Array<Procedure | Service> = [];
    isLoading: boolean = false;
    isSubmitting: boolean = false;

    textFilter!: string;
    selectedProcedureSource: ProcedureSource = ProcedureSource.CLINIC;
    procedureSourceOptions: Array<SelectItem> = [];
    procedureMenuOptions: Array<MenuItem> = [];
    selectedProcedure: Procedure | Service | null = null;

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
        private readonly _procedureService: ProcedureService,
        private readonly _serviceService: ServiceService
    ) {}

    ngOnInit(): void {
        this.procedureSourceOptions = Object.values(ProcedureSource).map(
            (value) => ({
                label: ProcedureSourceUtils.getFriendlyName(value),
                value: value,
            })
        );

        this.procedureMenuOptions = [
            {
                label: 'Editar',
                command: () => this.onUpdateProcedure(),
            },
            {
                label: 'Excluir',
                command: () => this.onDeleteProcedure(),
            },
        ];

        this._fetchData();
    }

    onAddProcedure() {
        this._showDialogProcedure();
    }

    async onDeleteProcedure() {
        if (
            this.selectedProcedure &&
            this.selectedProcedure?.type === 'PROCEDURE'
        ) {
            const confirmation = await this._alertService.confirmMessage(
                `Deseja excluir o procedimento ${
                    this.selectedProcedure!.name
                }? Essa ação é irreversível!`
            );

            if (confirmation) {
                this.isSubmitting = true;
                await OperatorUtils.delay(500);

                try {
                    await this._procedureService.delete(
                        this.selectedProcedure!.id!
                    );
                    await this._retrieveProcedures();
                } finally {
                    this.isSubmitting = false;
                }
            }
        }
    }

    onInputChange() {
        clearTimeout(this._time);

        this._time = setTimeout(() => {
            this._retrieveProcedures();
        }, 500);
    }

    onPageChange(event: any) {
        this.page = event.first / event.rows;
        this._retrieveProcedures();
    }

    onSortChange(event: any) {
        this.sort = event.field;
        this.direction = event.order > 0 ? 'asc' : 'desc';
        this._retrieveProcedures();
    }

    onSourceChange() {
        this._retrieveProcedures();
    }

    onUpdateProcedure() {
        if (
            this.selectedProcedure &&
            this.selectedProcedure.type === 'PROCEDURE'
        ) {
            this._showDialogProcedure(this.selectedProcedure);
        }
    }

    private async _fetchData() {
        this.partner = await this._authenticationService.retrieveUser();
        this._retrieveProcedures();
    }

    private async _retrieveProcedures() {
        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            if (this.selectedProcedureSource === ProcedureSource.CLINIC) {
                const proceduresPage = await this._procedureService.search(
                    this.page,
                    this.size,
                    this.sort,
                    this.direction,
                    {
                        name: this.textFilter || undefined,
                        code: this.textFilter || undefined,
                        partnerId: this.partner.id,
                    }
                );

                this.procedures = proceduresPage.content.map((procedure) => ({
                    ...procedure,
                    type: 'PROCEDURE',
                }));
                this.totalElements = proceduresPage.page.totalElements;
            }

            if (this.selectedProcedureSource === ProcedureSource.MARKETPLACE) {
                const servicesPage = await this._serviceService.search(
                    this.page,
                    this.size,
                    this.sort,
                    this.direction,
                    {
                        name: this.textFilter || undefined,
                        code: this.textFilter || undefined,
                        partnerId: this.partner.id,
                    }
                );

                this.procedures = servicesPage.content.map((service) => ({
                    ...service,
                    type: 'SERVICE',
                }));
                this.totalElements = servicesPage.page.totalElements;
            }
        } finally {
            this.isLoading = false;
            this._changeDetector.detectChanges();
        }
    }

    private _showDialogProcedure(procedure?: Procedure) {
        this._dialogService
            .open(DialogProcedureComponent, {
                draggable: true,
                modal: true,
                header: 'Procedimento',
                closable: true,
                closeOnEscape: false,
                data: {
                    procedure: procedure,
                },
                styleClass: 'dialog-procedure',
            })
            .onClose.subscribe((result) => {
                if (result && result.change) {
                    this._retrieveProcedures();
                }
            });
    }
}
