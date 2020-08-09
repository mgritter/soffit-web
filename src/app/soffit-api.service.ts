import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
                }
            } )
        })
    }   
}
