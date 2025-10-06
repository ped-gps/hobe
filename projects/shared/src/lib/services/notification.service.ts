import { Injectable } from '@angular/core';
import { ModelType } from './../enums/model-type';
import { Notification as AppNotification } from './../models/notification';

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	constructor() {}

	open(
		notification: AppNotification,
		options: { showNotification?: boolean; playSound?: boolean } = {},
	) {
		const { showNotification = true, playSound = true } = options;

		if ('Notification' in window) {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted' && showNotification) {
					new Notification(notification.sender.name, {
						body: notification.content,
						icon: notification.sender.picture
							? notification.sender.picture.path
							: '/assets/svgs/profile.svg',
					});
				}
			});

			if (playSound) {
				this._playSound(notification.type);
			}
		}
	}

	private _playSound(type: ModelType) {
		if (type === ModelType.MESSAGE) {
			new Audio('/assets/audio/notification_message.mp3').play();
		}
	}
}
