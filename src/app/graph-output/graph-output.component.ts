import { Component, OnInit, ViewChild, Input } from '@angular/core';

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

function soffitIsEdge( g : string ) {
    return g.includes( "->" ) || g.includes( "--" ) || g.includes( "<-" )
}

function soffitToDotWithNodeNames( g : string ) : string {
    let elements : string[] = g.split( ";" );
    let directed : boolean = true;

    let processed : string[] = elements.map( item => {
        let tokens : string[] = item.split( /[\[\]]/ )
        if ( tokens[0].includes( "->" ) ) {
            directed = true;
        }
        if ( tokens.length == 1 ) {
            // No tag
            return item
        }
        let tag : string = tokens[1];
        return tokens[0] + ' [label="' + tokens[0] + '\n' + tokens[1] + '"]\n';
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

    nodeList = []
    
    @ViewChild('output_div') output_div;

    // This really only works with brackets, as a normal
    // HTML attribute it's always a string, and all strings
    // are true.
    @Input() show_node_names : boolean;
    
    ngOnInit(): void {
    }

    soffitGraph( graph : string ) : void {
        // console.log( "Rendering " + graph )
        // console.log( "To object: " + this.output_div + " " + this.output_div.nativeElement )
        var myElement = this
        myElement.output_div.nativeElement.innerHTML = ""

        var viz = d3.select( this.output_div.nativeElement ).graphviz()
        //viz.on( 'dataProcessEnd', function() {
        //    myElement.update_nodeList( this.data() );
        //})
        viz.onerror( (err) => {
            myElement.output_div.nativeElement.innerHTML = err
            console.log( "Dot parsing error: " + err )
        })
        if ( this.show_node_names ) {
            viz.renderDot( soffitToDotWithNodeNames( graph ) )
        } else {
            viz.renderDot( soffitToDot( graph ) )
        }
    }

    update_nodeList(data) {
        if (!("children" in data)) {
            return [];
        }
        var nodes = [];
        
        // This code sucks, don't do it this way,
        // I was trying to get titles, but they're buried even one level deeper,
        // as #text nodes *within* the title elmement.
        for ( var i in data.children ) {
            var g = data.children[i];
            // for ( var a in g.attributes ) {
            //    console.log( "Child attribute: " + a + "=" + g.attributes[a] )            
            // }
            if ( g.attributes["class"] == "graph" ) {
                for ( var i2 in g.children ) {
                    var n = g.children[i2];
                    if ( n.attributes["class"] == "node" ) {
                        for ( var i3 in n.children ) {
                            var elem = n.children[i3];
                            if ( elem.tag == "title" ) {
                                for ( var a in elem ) {
                                    console.log( "Title attribute: " + a + "=" + elem[a] )                                      }
                            }
                        }
                        nodes.push( n )
                    }
                }
            }
        }
        this.nodeList = nodes;
    }
}
