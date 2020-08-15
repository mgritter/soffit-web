import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitApiService, GrammarResponse } from '../soffit-api.service'

enum ApiState {
    Ready,
    WaitingForResponse,
    NoMoreIterations
};

@Component({
  selector: 'app-interactive-output',
  templateUrl: './interactive-output.component.html',
  styleUrls: ['./interactive-output.component.css']
})
export class InteractiveOutputComponent implements OnInit {
    constructor( private api : SoffitApiService ) {}

    @ViewChild('start') start : GraphOutputComponent;
    @ViewChild('result') result : GraphOutputComponent;
    @ViewChild('outer_div') outer_div;

    startGraphSoffit = "X[root]; Y[leaf]; Z[leaf]; X->Y; X->Z"
    resultGraphSoffit = "X[root]; Y[leaf]; Z[leaf]; X->Y; X->Z"
    grammar = {
        "N[leaf]" : "N[internal]; L1[leaf]; L2[leaf]; N->L1; N->L2"
    }
    
    plus_button_class = "plus_enabled";
    starting_graph_class = "starting_graph_expanded";
    result_graph_class = "result_graph_normal";

    showhide_button_class = "hide"
    show_start_graph = true
    toggle_text = "< hide";
    toggle_start_graph() {
        if ( this.show_start_graph ) {
            this.show_start_graph = false;
            this.toggle_text = "show >";
            this.showhide_button_class="show";
            this.starting_graph_class = "starting_graph_collapsed";
            this.result_graph_class = "result_graph_expanded";
        } else {
            this.show_start_graph = true;
            this.toggle_text = "hide <";
            this.showhide_button_class="hide";
            this.starting_graph_class = "starting_graph_expanded";
            this.result_graph_class = "result_graph_normal";
        }
    }

    state : ApiState = ApiState.Ready
    iteration = 0
    message = ""

    changeApiState( new_state : ApiState ) : void {
        this.state = new_state;
        switch (this.state) {
            case ApiState.Ready:
                this.plus_button_class = "plus_enabled";
                this.message = "";
                break;
            case ApiState.WaitingForResponse:
                this.plus_button_class = "plus_disabled";
                this.message = "Waiting for response.";
                break;
             case ApiState.NoMoreIterations:
                this.plus_button_class = "plus_disabled";
                this.message = "No more matches.";
        }
    }
    
    reset_graph() {
        if ( this.state == ApiState.WaitingForResponse ) {
            // I don't know how to cancel the API call, so
            // this is better than having the response revert the reset?
            return
        }
        this.iteration = 0
        this.resultGraphSoffit = this.startGraphSoffit
        this.start.soffitGraph( this.startGraphSoffit )
        this.result.soffitGraph( this.resultGraphSoffit )
        this.changeApiState( ApiState.Ready );
    }

    
    iterate( num_steps : number ) {
        this.changeApiState( ApiState.WaitingForResponse );

        // Calculate a max_width for the graph.
        var max_width = this.outer_div.nativeElement.offsetWidth;
        if ( this.show_start_graph ) {
            max_width -= this.start.width;
        }
        this.result.max_width = max_width;
        
        let component = this;
        this.api.runGrammar( this.grammar, this.resultGraphSoffit, num_steps)
            .subscribe( {
                next( g : GrammarResponse ) {
                    component.resultGraphSoffit = g.graph;
                    component.result.soffitGraph( g.graph );
                    component.iteration += g.iteration
                    if ( g.stopped ) {
                        component.changeApiState( ApiState.NoMoreIterations );
                    } else {
                        component.changeApiState( ApiState.Ready );
                    }
                },
                error( err ) {
                    component.changeApiState( ApiState.Ready );
                    if ( err.error != undefined ) {
                        component.message = err.error
                        if ( err.grammarError != undefined ) {
                            component.message += "\n" + err.grammarError;
                        }
                        if ( err.parseError != undefined ) {
                            component.message += "\n" + err.parseError;
                        }
                    } else {
                        component.message = "Error: " + err.message
                    }
                }
            } )
    }                                                  

    
    ngOnInit(): void {
    }

    ngAfterViewInit() : void {
        this.start.soffitGraph( this.startGraphSoffit )
        this.result.soffitGraph( this.resultGraphSoffit )
    }
}
