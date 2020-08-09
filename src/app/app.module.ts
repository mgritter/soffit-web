import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphOutputComponent } from './graph-output/graph-output.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphOutputComponent
  ],
  imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
