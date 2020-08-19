import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InteractiveComponent } from './interactive/interactive.component'
import { AboutSoffitComponent } from './about-soffit/about-soffit.component'

const routes: Routes = [
    { path: "grammar", component: InteractiveComponent },    
    { path: "about", component: AboutSoffitComponent },    
    { path: "", redirectTo: "/grammar", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
