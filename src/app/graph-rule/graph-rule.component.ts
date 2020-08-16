import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitTextareaComponent } from '../soffit-textarea/soffit-textarea.component'
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-graph-rule',
  templateUrl: './graph-rule.component.html',
  styleUrls: ['./graph-rule.component.css']
})

export class GraphRuleComponent implements OnInit {

    constructor() { }

    @Input() show_edit : boolean

    @ViewChild( 'left_text' ) input_left: SoffitTextareaComponent;
    @ViewChild( 'right_text' ) input_right : SoffitTextareaComponent;
    @ViewChild( 'left') output_left : GraphOutputComponent;
    @ViewChild( 'right') output_right : GraphOutputComponent;

    top_row : string = "1 / span 1";
    bottom_row : string = "2 / span 1";
    
    setRule( left : string, right : string ) {
        this.input_left.setText( left )
        this.input_right.setText( right )
    }

    getLeft() : string {
        return this.input_left.getText()
    }

    getRight() : string {
        return this.input_right.getText()
    }
    

    ngOnInit(): void {
    }

    ngAfterViewInit() : void {
        this.input_left.textObserver()
            .pipe( debounceTime( 500 ) )
            .subscribe( newValue => this.output_left.soffitGraph( newValue ) );
        this.input_right.textObserver()
            .pipe( debounceTime( 500 ) )
            .subscribe( newValue => this.output_right.soffitGraph( newValue ) );
    }
}
