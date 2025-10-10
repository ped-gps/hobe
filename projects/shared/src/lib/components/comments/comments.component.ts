import { Component, Input } from '@angular/core';
import { RelativeTimePipe } from "../../pipes/relative-time.pipe";
import { Comment } from './../../models/comment';

@Component({
	selector: 'app-comments',
	templateUrl: './comments.component.html',
	styleUrl: './comments.component.scss',
 	imports: [
		RelativeTimePipe
	]
})
export class CommentsComponent {
	@Input({ required: true }) comments: Array<Comment> = [];
}