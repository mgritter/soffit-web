import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSoffitComponent } from './about-soffit.component';

describe('AboutSoffitComponent', () => {
  let component: AboutSoffitComponent;
  let fixture: ComponentFixture<AboutSoffitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutSoffitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutSoffitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
