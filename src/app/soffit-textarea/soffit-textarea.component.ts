import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// This is really not the right modern way to do things;
// we should use an editable component instead so we can
// highlight area and such, but (A) that seems like a lot of work, and
// (B) all the existing components seem super-heavyweight.

@Component({
  selector: 'app-soffit-textarea',
  templateUrl: './soffit-textarea.component.html',
  styleUrls: ['./soffit-textarea.component.css']
})
export class SoffitTextareaComponent implements OnInit {

    constructor() { }

    // Use to find the right components in the rules array
    @Input() index : number = 999;

    text_class : string = "editable";
    rows : number = 1;
    max_rows : number = 5;

    text = new FormControl( "" );

    @Input() get graph() : string {
        return this.text.value;
    }
    set graph( newValue : string ) {
        // console.log( "New graph: " + newValue );
        this.text.setValue( newValue );
    }
    
    @Output() graphChange  = new EventEmitter<string>();
    
    onValueChanged( newValue ) {
        var rows = newValue.split( "\n" );
        if ( rows.length != this.rows ) {
            if ( rows.length > this.max_rows ) {
                this.rows = this.max_rows;
            } else {
                this.rows = rows.length;
            }
        }
        this.graphChange.emit( newValue );
    }

    textObserver() {
        return this.text.valueChanges        
    }
    
    ngOnInit(): void {
        this.text.valueChanges
            .pipe( debounceTime( 100 ) )
            .subscribe( newValue => this.onValueChanged( newValue ) );
    }

}
