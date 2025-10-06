import ptBr from '@angular/common/locales/pt';
import Aura from '@primeuix/themes/aura';
import player from 'lottie-web';

import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
	ApplicationConfig,
	DEFAULT_CURRENCY_CODE,
	LOCALE_ID,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { provideLottieOptions } from 'ngx-lottie';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';

import { authenticationInterceptor, translation } from '@hobe/shared';

registerLocaleData(ptBr);

export const appConfig: ApplicationConfig = {
	providers: [
		CookieService,
		CurrencyPipe,
		DialogService,
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideAnimationsAsync(),
		providePrimeNG({
			theme: {
				preset: Aura,
			},
			translation: translation,
		}),
		provideHttpClient(withInterceptors([authenticationInterceptor])),
		provideLottieOptions({
			player: () => player,
		}),
		{
			provide: LOCALE_ID,
			useValue: 'pt',
		},
		{
			provide: DEFAULT_CURRENCY_CODE,
			useValue: 'BRL',
		},
	],
};
