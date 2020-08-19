import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
         
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class AppComponent implements OnInit {
    constructor() {}
    
    ngOnInit(): void {
    }
    
}
