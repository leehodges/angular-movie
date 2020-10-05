import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { Router } from '@angular/router';
import { MustMatch } from './must-match.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  form: FormGroup
  formValues: any
  submitting = false
  hasError = false
  errorMsg: string
  currentUser: User
  private subs = new Subscription()
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.createFormControls()
    this.createForm()
  }

  createFormControls() {
    this.formValues = {
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      nickName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30)])],
      passwordConfirmation: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30)])],
    }
  }

  createForm() {
    this.form = this.fb.group(this.formValues, { validator: MustMatch('password', 'passwordConfirmation') })
  }

  // convenience getter for form controls
  get f() {
    if (this.form && this.form.controls) {
      return this.form.controls
    }
  }

  submitForm() {
    this.hasError = false
    this.submitting = true
    if (this.form.invalid) {
      this.hasError = true
      this.submitting = false
      return
    }
    const form = this.form.value
    const params = {
      firs_name: form.firstName, last_name: form.lastName,
      nickname: form.nickName, email: form.email,
      password: form.password, passwordConfirmation: form.passwordConfirmation
    }
    this.subs.add(
      this.userService.signup(params).subscribe(data => {
        if (data && data.success && data.user) {
          this.currentUser = data.user
          debugger
          this.submitting = false
          this.router.navigate(['/home'])
        }
      }, error => {
        if (error) {
          debugger
          console.log(error)
          this.submitting = false
          this.hasError = false
          this.errorMsg = 'User already exists in this system! Please login!'
        }
      })
    )
  }

  cancelForm() {
    this.form.reset()
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

}

