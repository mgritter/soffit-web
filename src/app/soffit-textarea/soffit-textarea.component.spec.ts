import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoffitTextareaComponent } from './soffit-textarea.component';

describe('SoffitTextareaComponent', () => {
  let component: SoffitTextareaComponent;
  let fixture: ComponentFixture<SoffitTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoffitTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoffitTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
