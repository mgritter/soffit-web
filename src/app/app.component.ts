import { Component, OnInit, Injectable } from '@angular/core';
import { SoffitApiService, GrammarResponse } from './soffit-api.service'
         
declare var d3: any;

function soffitToDot( g : string ) : string {
    let elements : string[] = g.split( ";" );
    let directed : boolean = true;

    let processed : string[] = elements.map( item => {
        let tokens : string[] = item.split( /[\[\]]/ )
        if ( tokens[0].includes( "->" ) ) {
            directed = true;
        }
        if ( tokens.length == 1 ) {
            // No tag
            return item;
        }
        let tag : string = tokens[1];
        if ( tag.includes( "=" ) ) {
            return tokens[0] + " [" + tokens[1] + "]\n";
        } else {
            return tokens[0] + " [label=" + tokens[1] + "]\n";
        }
    })
    
    if ( directed ) {
        return "digraph {\n" + processed.join( "" ) + "}\n";
    } else {
        return "graph {\n" + processed.join( "" ) + "}\n";
    }
}

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
    
    title = 'Soffit Web';

    ngOnInit() {
        var grammar = {
            "N[leaf]" : "N[internal]; L1[leaf]; L2[leaf]; N->L1; N->L2"
        }
        var graph : string = "X[root]; Y[leaf]; Z[leaf]; X->Y; X->Z"

        this.api.runGrammar( grammar, graph, 5 ).subscribe( {
            next( g : GrammarResponse ) {
                let tmp : String = soffitToDot( g.graph )
                console.log( tmp )
                d3.select("#output_graph")
                    .graphviz()
                    .renderDot(soffitToDot( g.graph ));
            }
        } )
    }
}
