import {Injectable} from '@angular/core';
import {combineLatest, Observable, of} from "rxjs";
import {User} from "./user";
import {HttpClient} from "@angular/common/http";
import {map, shareReplay, take, tap} from "rxjs/operators";
import {ServiceCache} from "../serviceCache";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private cache = {
    getUser: new ServiceCache<number, User>()
  }

  constructor(private httpClient: HttpClient) {
  }

  public getUser(id: number): Observable<User | null> {
    // First, check if we can use the result from the last call.
    if(this.cache.getUser.shouldUseCache(id)) {
      console.info(`Cache hit on getUser for id ${id}`);
      return this.cache.getUser.observable$; // Cache hit!  Just return what we already have.
    }

    this.cache.getUser.clear(); // We couldn't use the cache, so we need to wipe it out.
    this.cache.getUser.previousInput = id; // Record the current input so we can compare against it next time.
    console.info(`Cache miss on getUser for id ${id}, making HTTP call`);
    return this.cache.getUser.observable$ = this.httpClient.get<User>(`https://reqres.in/api/users/${id}`)
        .pipe(
            map((response: any): User => response.data), // Map the response to a UserOutput.
            shareReplay() // Share the result of this pipe with the next caller instead of running it again.
        );
  }

  public updateUser(user: User): Observable<User> {
    return combineLatest([
      this.cache.getUser.observable$ ?? of(null),
      this.httpClient.put<User>(`https://reqres.in/api/users/${user.id}`, user)
    ]).pipe(
        take(1), // Only take the first result, then unsubscribe
        tap(([cachedUser]) => {
          // If we updated the user that is currently cached, we need to clear the cache.
          if(`${cachedUser?.id}` === `${user.id}`) {
            this.cache.getUser.clear();
            console.info(`Cache cleared due to update`);
          }
        }),
        map(([, updatedUser]): User => updatedUser)
    );
  }

  public removeUser(user: User): Observable<any> {
    return combineLatest([
      this.cache.getUser.observable$ ?? of(null),
      this.httpClient.delete<User>(`https://reqres.in/api/users/${user.id}`)
    ]).pipe(
        take(1), // Only take the first result, then unsubscribe
        tap(([cachedUser]) => {
          // If we removed the user that is currently cached, we need to clear the cache.
          if(cachedUser?.id === user.id) {
            this.cache.getUser.clear();
            console.info(`Cache cleared due to delete`);
          }
        }),
        map(([, removedUser]): User => removedUser)
    );
  }
}
