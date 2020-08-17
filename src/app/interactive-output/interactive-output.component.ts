import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitTextareaComponent } from '../soffit-textarea/soffit-textarea.component'
import { SoffitApiService, GrammarResponse } from '../soffit-api.service'
import { debounceTime } from 'rxjs/operators';

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

    @ViewChild('start_edit') start_edit : SoffitTextareaComponent;
    @ViewChild('start') start : GraphOutputComponent;
    @ViewChild('result') result : GraphOutputComponent;
    @ViewChild('outer_div') outer_div;

    startGraphSoffit : string = "";
    resultGraphSoffit : string  = "";
    debugGraph : boolean = false;

    @Input() grammarSource;
    
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

    setResultToStart() {
        // Put it in a form the API will be happy with.
        let fixed : string = this.api.soffitToSoffit( this.startGraphSoffit );
        this.resultGraphSoffit = fixed;
        this.result.soffitGraph( fixed );        
    }
    
    reset_graph() {
        if ( this.state == ApiState.WaitingForResponse ) {
            // I don't know how to cancel the API call, so
            // this is better than having the response revert the reset?
            return
        }
        this.iteration = 0
        this.setResultToStart();
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
        // FIXME: warn if grammar changed while running.
        var grammar = this.grammarSource.generateGrammar();
        this.api.runGrammar( grammar, this.resultGraphSoffit, num_steps)
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
        let c = this;
        this.start_edit.textObserver()
            .pipe( debounceTime( 500 ) )
            .subscribe( newVal => {
                // FIXME: startGraphSoffit should already match the new value?
                c.startGraphSoffit = newVal;
                c.start.soffitGraph( this.startGraphSoffit );
                if ( c.iteration == 0 && !c.start.show_error ) {
                    // Only update the result if we haven't advanced yet.
                    c.setResultToStart();
                }
            } )
    }

    saveAsSvg() {
        var filename = "graph-output.svg";
        // FIXME: add an accessor?
        var data = this.result.output_div.nativeElement.innerHTML;
        var blob = new Blob( [data], {type: 'image/svg+xml'} );
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob( blob, filename );
        } else {
            var elem = window.document.createElement( 'a' );
            elem.href = window.URL.createObjectURL( blob );
            elem.download = filename;
            document.body.appendChild( elem );
            elem.click();
            document.body.removeChild( elem );
            window.URL.revokeObjectURL( elem.href );
        }

    }
}
