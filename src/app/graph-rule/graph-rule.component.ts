import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitTextareaComponent } from '../soffit-textarea/soffit-textarea.component'
import { debounceTime } from 'rxjs/operators';

class Rule {
    left : string;
    right : string;
    init : boolean;
};

function compareByIndex( a, b ) {
    if ( a.index < b.index ) {
        return -1;
    }
    if ( a.index > b.index ) {
        return 1;
    }
    return 0;
}

@Component({
  selector: 'app-graph-rule',
  templateUrl: './graph-rule.component.html',
  styleUrls: ['./graph-rule.component.css']
})
export class GraphRuleComponent implements OnInit {
    constructor() { }

    rules : Rule[] = [];
    
    @Input() show_edit : boolean

    @ViewChildren( 'left_text' ) input_left: QueryList<SoffitTextareaComponent>;
    @ViewChildren( 'right_text' ) input_right : QueryList<SoffitTextareaComponent>;
    @ViewChildren( 'left') output_left : QueryList<GraphOutputComponent>;
    @ViewChildren( 'right') output_right : QueryList<GraphOutputComponent>;

    addRule( left : string, right : string ) : void {
        let r : Rule = new Rule;
        r.left = left;
        r.right = right;
        r.init = false;
        this.rules.push( r );
    }

    deleteRule( i : number ) {
        this.rules.splice( i, 1 );
    }

    setRight( i : number ) {
        var x = this.input_right.toArray()[i]
        this.rules[i].right = x.graph;
    }

    setLeft( i : number ) {
        var x = this.input_left.toArray()[i]
        this.rules[i].left = x.graph;
    }

    generateGrammar() {
        var g = {}
        for ( let r of this.rules ) {
            if ( r.left in g ) {
                if ( Array.isArray( g[r.left] ) ) {
                    g[r.left].push( r.right );
                } else {
                    g[r.left] = [ g[r.left], r.right ];
                }
            } else {
                g[r.left] = r.right;
            }
        }
        return g;
    }
    
    ngOnInit(): void {
    }

    connect( text : SoffitTextareaComponent, graph : GraphOutputComponent ) : void {
        text.textObserver()
            .pipe( debounceTime( 500 ) )
            .subscribe( newVal => graph.soffitGraph( newVal ) );
    }
        
    childChanged() : void {
        if ( this.input_left.length != this.input_right.length ||
             this.input_left.length != this.output_left.length ||
             this.input_left.length != this.output_right.length ||
             this.input_left.length != this.rules.length ) {
            // not ready yet
            return;
        }

        var il = this.input_left.toArray();
        il.sort( compareByIndex )
        var ir = this.input_right.toArray();
        ir.sort( compareByIndex )
        var ol = this.output_left.toArray();
        ol.sort( compareByIndex )
        var or = this.output_right.toArray();
        or.sort( compareByIndex )
        for ( var i : number = 0; i < this.rules.length; i++ ) {
            if ( !this.rules[i].init ) {
                // console.log( "Uninitialized rule: " + i );
                if ( i != il[i].index ||
                     i != ir[i].index ||
                     i != ol[i].index ||
                     i != or[i].index ) {
                    console.log( "Mismatched children for index " + i );
                    return;
                }
                // Need to create a new function scope for the closure.
                this.connect( il[i], ol[i] );
                this.connect( ir[i], or[i] );
                ol[i].soffitGraph( il[i].graph );
                or[i].soffitGraph( ir[i].graph );
                this.rules[i].init = true;
            }
        }        
    }
    
    ngAfterViewInit() : void {
        var c = this;
        // We can't predict which order these will show up.
        this.input_left.changes.subscribe( newVal => c.childChanged() );
        this.input_right.changes.subscribe( newVal => c.childChanged() );
        this.output_left.changes.subscribe( newVal => c.childChanged() );
        this.output_right.changes.subscribe( newVal => c.childChanged() );
    }
}
