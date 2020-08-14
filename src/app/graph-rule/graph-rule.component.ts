import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-graph-rule',
  templateUrl: './graph-rule.component.html',
  styleUrls: ['./graph-rule.component.css']
})

export class GraphRuleComponent implements OnInit {

    constructor() { }

    @Input() show_edit : boolean
    
    rule_left = new FormControl("")
    rule_right = new FormControl("")

    setRule( left : string, right : string ) {
        this.rule_left.setValue( left )
        this.rule_right.setValue( right )
    }

    getLeft() : string {
        return this.rule_left.value
    }

    getRight() : string {
        return this.rule_right.value
    }
    
    @ViewChild('left') output_left : GraphOutputComponent;
    @ViewChild('right') output_right : GraphOutputComponent;

    ngOnInit(): void {
        this.rule_left.valueChanges
            .pipe( debounceTime( 500 ) )
            .subscribe( newValue => this.output_left.soffitGraph( newValue ) );
        this.rule_right.valueChanges
            .pipe( debounceTime( 500 ) )
            .subscribe( newValue => this.output_right.soffitGraph( newValue ) );
    }
}
