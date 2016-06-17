import { Component } from '@angular/core';
import { AccountListComponent } from './account-list';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [AccountListComponent]
})
export class AppComponent {
  title = 'app works!';
}
