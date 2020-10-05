import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {User} from "../models/user";
import {LocalStorageService} from "./local-storage.service";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User>
  public currentUser: Observable<User>
  private userApi: string
  constructor(
    private http: HttpClient,
    private storage: LocalStorageService
  ) {
    this.userApi = `${environment.apiUrl}/api/v1/users`
    this.currentUserSubject = new BehaviorSubject<User>(this.storage.getItem('curentUser'))
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value //returens the curentUser value to a component
  }

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user) // sets the currentUserSubject
  }

  login() {}

  signup(params) {
    return this.http.post<any>(`${this.userApi}/create`, params)
      .pipe(
        catchError(this.handleError), // catch and handle any errors returning from the api
        map(res => { // map the response before we return it to the component
          if (res && res.token) { // response is successful
            const newUser = new User(res) // map the res to the user model
            this.storage.setItem('accessToken', res.token) // set the res.token in the browser's local storage
            this.storage.setItem('currentUser', newUser) // set the newUser in the browser's local storage
            this.currentUserSubject.next(newUser) // set the newUser in the currentUser subject/observable
            return { success: true, user: res } // return the success res and user to the signup component
          }
        })
      )
  }

  logout() {}

  handleError(error) {
    let returnError
    if (error.error instanceof ErrorEvent) {
      // client-side error
      returnError = {statusCode: error.error.statusCode, message: `Error: ${error.error.message}`}
    } else {
      // server-side error
      returnError = { statusCode: error.error.statusCode, message: `Error Code: ${error.status}\nMessage: ${error.message}`}
    }
    return throwError(returnError)
  }
}

//private = not available outside of this service
//public = available outside of this service
