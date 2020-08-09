import { Component, OnInit, ViewChild } from '@angular/core';

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
  selector: 'app-graph-output',
  templateUrl: './graph-output.component.html',
  styleUrls: ['./graph-output.component.css']
})

export class GraphOutputComponent implements OnInit {
    constructor() { }

    @ViewChild('output_div') output_div;
    
    ngOnInit(): void {
    }

    soffitGraph( graph : string ) : void {
        // console.log( "Rendering " + graph )
        // console.log( "To object: " + this.output_div + " " + this.output_div.nativeElement )
        d3.select( this.output_div.nativeElement ).graphviz().renderDot( soffitToDot( graph ) )
    }

}
