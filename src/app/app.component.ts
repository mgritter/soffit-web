import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { SoffitApiService, GrammarResponse } from './soffit-api.service'
import { GraphOutputComponent } from './graph-output/graph-output.component'
         
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class AppComponent implements OnInit {
    constructor( private api : SoffitApiService ) {}
    
    @ViewChild(GraphOutputComponent) output : GraphOutputComponent;

    title = 'Soffit Web';

    ngOnInit(): void {
    }
    
    ngAfterViewInit() : void {
        var grammar = {
            "N[leaf]" : "N[internal]; L1[leaf]; L2[leaf]; N->L1; N->L2"
        }
        var graph : string = "X[root]; Y[leaf]; Z[leaf]; X->Y; X->Z"

        let out_component = this.output
        this.api.runGrammar( grammar, graph, 5 ).subscribe( {
            next( g : GrammarResponse ) {
                out_component.soffitGraph( g.graph )
            }
        } )
    }
}
