import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphRuleComponent } from './graph-rule.component';

describe('GraphRuleComponent', () => {
  let component: GraphRuleComponent;
  let fixture: ComponentFixture<GraphRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
