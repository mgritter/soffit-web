import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitApiService, GrammarResponse } from '../soffit-api.service'

@Component({
  selector: 'app-interactive-output',
  templateUrl: './interactive-output.component.html',
  styleUrls: ['./interactive-output.component.css']
})
export class InteractiveOutputComponent implements OnInit {
    constructor( private api : SoffitApiService ) {}

    @ViewChild('start') start : GraphOutputComponent;
    @ViewChild('result') result : GraphOutputComponent;

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

    message = ""
    
    reset_graph() {
    }

    iteration = 0
    stopped = false
    
    iterate( num_steps : number ) {
        let component = this;
        this.api.runGrammar( this.grammar, this.resultGraphSoffit, num_steps)
            .subscribe( {
                next( g : GrammarResponse ) {
                    component.resultGraphSoffit = g.graph;
                    component.result.soffitGraph( g.graph );
                    component.iteration += g.iteration
                    if ( g.stopped ) {
                        component.message = "No more matches";
                        component.stopped = true
                        component.plus_button_class = "plus_disabled";
                    }
                },
                error( err ) {
                    this.message = "Error: " + err
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
