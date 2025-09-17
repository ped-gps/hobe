import { Component } from '@angular/core';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
	selector: 'app-loading',
	templateUrl: './loading.component.html',
	styleUrl: './loading.component.scss',
	imports: [
		LottieComponent
	]
})
export class LoadingComponent {

	public options: AnimationOptions = {
		path: '../../../assets/animations/loading.json',
	};
}