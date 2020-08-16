import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PEG } from 'pegjs'
import * as parser from '..//assets/js/soffit-grammar';


// Parser structures for Soffit

export class Node {
    id: string;
    tag: string;
    merged_nodes: Map<string,string>;
};

export class Edge {
    src: string;
    dst: string;
    tag: string;
};

export class Graph {
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

class Execute {
    grammar: any;
    iterations: number;
    graph: string;
}

interface ExecuteResponse {
    // success response
    message: string,
    request: any;
    iteration: number,
    graph: string;

    // failure response
    error: string;
    body: string;
    pos: number;
    lineno: number;
    colno: number;
    left: string;
    right: string;
    parseError: string;
    parseErrorColumn: number;
    grammarError: string;
}

export class GrammarResponse {
    graph: string;
    stopped: boolean;
    iteration: number;
}

@Injectable({
  providedIn: 'root'
})
export class SoffitApiService {
    api_url = "https://api.combinatorium.com/soffit/soffit_execute"
    
    constructor( private http: HttpClient ) {}

    parseSoffitGraph( orig : string ) : Graph {
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

    soffitToDot( g : string, show_ids : boolean ) : string {
        let x = this.parseSoffitGraph( g ) 
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

    soffitToSoffit( g : string ) : string {
        let x = this.parseSoffitGraph( g ) 
        let elements : string[] = [];
        for ( const kv of x.nodes ) {
            const n = kv[1];
            let mergedNodes = n.id;
            for ( let m of n.merged_nodes ) {
                mergedNodes += "^" + m[0];
            }
            if ( n.tag == "" ) {
                elements.push( mergedNodes );
            } else {
                elements.push( mergedNodes + " [" + n.tag + "]" )
            }
        }
        
        for ( let e of x.edges ) {
            var tag = "";
            if ( e.tag != "" ) {
                tag = " [" + e.tag + "]"
            }
            if ( x.directed ) {
                elements.push( e.src + ' -> ' + e.dst + tag );
            } else {
                elements.push( e.src + ' -- ' + e.dst + tag );
            }
        }
        
        return elements.join( "; " );
    }

    
    runGrammar( grammar : any, g : string, num_iterations : number ) : Observable<GrammarResponse> {
        var req : Execute = new Execute()
        req.grammar = grammar
        req.iterations = num_iterations
        req.graph = g
        var httpObservable = this.http.post<ExecuteResponse>( this.api_url, req )
                                    
        return new Observable<GrammarResponse>( subscriber => {
            httpObservable.subscribe( {
                next( r : ExecuteResponse ) {
                    var result : GrammarResponse = new GrammarResponse();
                    result.graph = r.graph
                    result.iteration = r.iteration
                    if ( r.message == "Stopped due to iteration limit" ) {
                        result.stopped = false
                    } else {
                        result.stopped = true
                    }
                    subscriber.next( result )
                    subscriber.complete()
                },
                error( err ) {
                    console.error( "API error: " + err.message )
                    if ( err.error === undefined ) {
                        subscriber.error( err )
                    } else {
                        subscriber.error( err.error )
                    }
                }
            } )
        })
    }   
}
