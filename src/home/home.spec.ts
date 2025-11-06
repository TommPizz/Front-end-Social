import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { AuthService } from '../app/services/auth';
import { PostService } from '../app/services/post-service';
import { Router } from 'express';
import { of } from 'rxjs';

// Mock molto semplice
class MockAuthService {
  logout() {}
}

class MockPostService {
  getAllPosts() {
    return of([]);
  }
}

class MockRouter {
  navigate() {}
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: PostService, useClass: MockPostService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBeTrue();
    expect(component.posts).toEqual([]);
  });
});