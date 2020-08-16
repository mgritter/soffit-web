import { Component, OnInit } from '@angular/core';
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
    
    text_class : string = "editable";
    rows : number = 1;
    max_rows : number = 5;
    
    text = new FormControl( "" );

    onValueChanged( newValue ) {
        var rows = newValue.split( "\n" );
        if ( rows.length != this.rows ) {
            if ( rows.length > this.max_rows ) {
                this.rows = this.max_rows;
            } else {
                this.rows = rows.length;
            }
        }
    }

    setText( newValue : string ) {
        this.text.setValue( newValue );
    }

    getText() : string {
        return this.text.value
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
