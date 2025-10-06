import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
	AlertService,
	AlertType,
	AuthenticationService,
	LoadingComponent,
	OauthService,
	OperatorUtils,
	PartnerService,
	User,
} from '@hobe/shared';

@Component({
	selector: 'app-mercado-pago-callback',
	templateUrl: './mercado-pago-callback.component.html',
	styleUrl: './mercado-pago-callback.component.scss',
	imports: [
		LoadingComponent
	],
})
export class MercadoPagoCallbackComponent implements OnInit {
	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _alertService: AlertService,
		private readonly _authenticationService: AuthenticationService,
		private readonly _partnerService: PartnerService,
		private readonly _OauthService: OauthService,
		private readonly _router: Router,
	) {}

	async ngOnInit(): Promise<void> {
		await OperatorUtils.delay(500);

		const code = this._activatedRoute.snapshot.queryParamMap.get('code');

		if (code) {
			const isSync = await this._OauthService.generate(code);

			if (isSync) {
				const { id: partnerId } =
					await this._authenticationService.retrieveUser();
				const partner = await this._partnerService.findById(partnerId!);
				this._authenticationService.setUser(partner as User);
				this._alertService.showMessage(
					AlertType.SUCCESS,
					'Confirmação',
					'Conta vinculada com sucesso!',
				);
			} else {
				this._alertService.showMessage(
					AlertType.ERROR,
					'Erro',
					'Não foi possível vincular a conta, por favor, contate o suporte técnico!',
				);
			}
		}

		this._router.navigate(['/profile/update']);
	}
}
