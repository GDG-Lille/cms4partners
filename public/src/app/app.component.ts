import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, TitleStrategy } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'cms-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoggedIn: boolean | undefined;
  title = environment.title;
  private auth: Auth = inject(Auth);
  private titleService: Title = inject(Title);
  constructor() {
    this.titleService.setTitle(environment.title);
    this.auth.onAuthStateChanged((state) => {
      this.isLoggedIn = !!state?.email?.endsWith('@' + environment.emailDomain);
    });
  }

  login() {
    signInWithPopup(
      this.auth,
      new GoogleAuthProvider().setCustomParameters({
        hd: environment.emailDomain,
      }),
    );
  }

  logout() {
    this.auth.signOut();
  }
}
