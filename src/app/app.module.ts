import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphOutputComponent } from './graph-output/graph-output.component';
import { GraphRuleComponent } from './graph-rule/graph-rule.component';
import { InteractiveOutputComponent } from './interactive-output/interactive-output.component';
import { SoffitTextareaComponent } from './soffit-textarea/soffit-textarea.component';
import { InteractiveComponent } from './interactive/interactive.component';
import { AboutSoffitComponent } from './about-soffit/about-soffit.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphOutputComponent,
    GraphRuleComponent,
    InteractiveOutputComponent,
    SoffitTextareaComponent,
    InteractiveComponent,
    AboutSoffitComponent
  ],
  imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
