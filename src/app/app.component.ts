import { Component } from '@angular/core';
import { User } from './service/user/user';
import { UserService } from './service/user/user.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public selectedId = '';

  public result$: Observable<User | null> = of(null);

  constructor(private userService: UserService) {}

  public getUserClick() {
    if (!this.selectedId || this.selectedId === '') {
      alert('Select a user from the dropdown first!');
    } else {
      this.result$ = this.userService.getUser(+this.selectedId);
    }
  }

  public updateUserClick() {
    if (!this.selectedId) {
      alert('Select a user from the dropdown first!');
    } else {
      this.userService.updateUser({ id: +this.selectedId } as User).subscribe();
    }
  }

  public deleteUserClick() {
    if (!this.selectedId) {
      alert('Select a user from the dropdown first!');
    } else {
      this.userService.removeUser({ id: +this.selectedId } as User).subscribe();
    }
  }
}
