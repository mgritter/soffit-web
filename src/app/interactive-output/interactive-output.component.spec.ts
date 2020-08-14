import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveOutputComponent } from './interactive-output.component';

describe('InteractiveOutputComponent', () => {
  let component: InteractiveOutputComponent;
  let fixture: ComponentFixture<InteractiveOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
