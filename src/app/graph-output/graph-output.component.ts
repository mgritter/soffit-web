import { Component, OnInit, ViewChild, Input } from '@angular/core';
import type { PEG } from 'pegjs'

declare var d3: any;

import * as parser from '../../assets/js/soffit-grammar';

class Node {
    id: string;
    tag: string;
    merged_nodes: Map<string,string>;
};

class Edge {
    src: string;
    dst: string;
    tag: string;
};

class Graph {
    directed: boolean;
    merge: Map<string,string>;
    nodes: Map<string,Node>;
    edges: Edge[]

    // Crappy union-find implementation.
    add_set( s: string ) : void {
        if ( this.merge.get( s ) === undefined ) {
            this.merge.set( s, s );
        }
    }
    
    find( s : string ) : string {
        var curr : string = s;
        while ( true ) {
            var next : string = this.merge.get( curr );
            if (next === undefined) {
                return curr;
            }
            if (next == curr) {
                if (curr != s ) {
                    this.merge.set( s, curr );
                }
                return curr;
            }
            curr = next;
        }
    }

    union( a : string, b : string ) : void {
        let a_set : string = this.find( a );
        let b_set : string = this.find( b );
        // Let the tree grow large, who cares?
        this.merge.set( a_set, b_set );
    }
};

function parseSoffitGraph( orig : string ) : Graph {
    var elems = parser.parse( orig ); // Might throw syntax error
    var g = new Graph()
    g.directed = false;
    g.nodes = new Map<string,Node>();
    g.edges = [];
    g.merge = new Map<string,string>();
    
    // Find all merges first
    for ( let e of elems ) {
        if ( e['type'] == 'node' ) {
            g.add_set( e['id'] )
            for ( let m of e['merge'] ) {
                g.add_set( m );
                g.union( m, e['id'] );
            }
        }
    }
    // Then add all object to the graph
    for ( let e of elems ) {
        if ( e['type'] == 'node' ) {
            let m = g.find( e['id'] )
            // console.log( "Canonical name for " + e['id'] + " is " + m )
            let n = g.nodes.get( m );
            if ( n === undefined ) {
                n = new Node();
                n.id = m;
                if ( e['tag'] == null ) {
                    n.tag = "";;
                } else {
                    n.tag = e['tag'];
                }
                n.merged_nodes = new Map();
                g.nodes.set( m, n )
            }
            if ( n.id != e['id'] ) {
                if ( n.tag == "" && e['tag'] != null && e['tag'] != "" ) {
                    // FIXME: is this an error in real Soffit?
                    n.tag = e.tag;
                }
                n.merged_nodes.set( e['id'],  e['id'] );
            }
            for ( let m of e['merge'] ) {
                if ( m != n.id ) {
                    n.merged_nodes.set( m, m );
                }
            }
        } else if ( e['type'] == 'edge' ) {
            let src : string = e['src'];
            for ( let target of e['dests'] ) {
                let edge = new Edge();
                if ( target['direction'] == '--' ) {
                    edge.src = g.find( src );
                    edge.dst = g.find( target['node'] );
                } else if ( target['direction'] == '->' ) {
                    g.directed = true;
                    edge.src = g.find( src );
                    edge.dst = g.find( target['node'] );
                } else if ( target['direction'] == '<-' ) {
                    g.directed = true;
                    edge.src = g.find( target['node'] );  // swapped
                    edge.dst = g.find( src );
                }
                if ( e['tag'] == null ) {
                    edge.tag = "";
                } else {
                    edge.tag = e['tag'];
                }
                g.edges.push( edge );
                src = target['node'];
            }
        }
    }
    return g;
}

function old_soffitToDot( g : string ) : string {
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

function soffitToDot( g : string, show_ids : boolean ) : string {
    let x = parseSoffitGraph( g ) 
    let elements : string[] = [];
    for ( const kv of x.nodes ) {
        const n = kv[1];
        let mergedNodes = n.id;
        for ( let m of n.merged_nodes ) {
            mergedNodes += "^" + m[0];
        }
        var attributes = "";
        if ( show_ids ) {
            // TODO: quote tag?
            attributes = '[label="' + mergedNodes + "\\n" + n.tag + '"]';
        } else if ( n.tag.includes( "=" ) ) {
            attributes = '[' + n.tag + ']';
        } else {
            attributes = '[label="' + n.tag + '"]';
        }
        elements.push( '"' + n.id + '" ' + attributes )
    }

    for ( let e of x.edges ) {
        if ( x.directed ) {
            elements.push( '"' + e.src + '"->"' + e.dst + '" [label="' + e.tag + '"]' );
        } else {
            elements.push( '"' + e.src + '"--"' + e.dst + '" [label="' + e.tag + '"]' );
        }
    }
    
    if ( x.directed ) {
        return "digraph {\n" + elements.join( "\n" ) + "}\n";
    } else {
        return "graph {\n" + elements.join( "\n" ) + "}\n";
    }
}

@Component({
  selector: 'app-graph-output',
  templateUrl: './graph-output.component.html',
  styleUrls: ['./graph-output.component.css']
})

export class GraphOutputComponent implements OnInit {
    constructor() { }

    show_error = false
    error_html = ""
    
    @ViewChild('output_div') output_div;

    // This really only works with brackets, as a normal
    // HTML attribute it's always a string, and all strings
    // are true.
    @Input() show_node_names : boolean;
    
    ngOnInit(): void {
    }

    @Input() max_width : number = 0;
    @Input() max_height : number = 0;
    width : number = 0;
    height : number = 0;
    
    soffitGraph( graph : string ) : void {
        // console.log( "Rendering " + graph )
        // console.log( "To object: " + this.output_div + " " + this.output_div.nativeElement )
        var myElement = this

        this.show_error = false
        var viz = d3.select( this.output_div.nativeElement ).graphviz();
        viz.onerror( (err) => {
            this.show_error = true
            this.error_html = err
            console.log( "Dot parsing error: " + err )
        })
        try {
            let dot = soffitToDot( graph, this.show_node_names );
            // console.log( "DOT file: " + dot );
            if ( viz.data() != null ) { 
                viz.resetZoom();
            }
            // Auto-size
            viz.width( null );
            viz.height( null );
            viz.dot( dot, function() {
                var svg = viz.data()
                var svg_width = Number( svg.attributes["width"].split( "pt" )[0] ) * 1.33;
                var svg_height = Number( svg.attributes["height"].split( "pt" )[0] ) * 1.33;
                myElement.width = svg_width;
                myElement.height = svg_height;
                var layout_again = false;
                if ( myElement.max_width != 0 && svg_width > myElement.max_width ) {
                    viz.width( myElement.max_width );
                    layout_again = true;
                }
                if ( myElement.max_height != 0 && svg_height > myElement.max_height ) {
                    viz.height( myElement.max_height );
                    layout_again = true;
                }
                if ( layout_again ) {
                    viz.fit( true );
                    viz.renderDot( dot );
                } else {
                    viz.render();
                }
            })
        } catch ( err ) {
            this.show_error = true
            this.error_html = "" + err
        }
    }
}
