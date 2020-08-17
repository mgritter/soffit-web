import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { SoffitApiService, GrammarResponse } from './soffit-api.service'
import { InteractiveOutputComponent } from './interactive-output/interactive-output.component'
import { GraphRuleComponent } from './graph-rule/graph-rule.component'
         
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class AppComponent implements OnInit {
    constructor( private api : SoffitApiService ) {}
    
    @ViewChild(InteractiveOutputComponent) output : InteractiveOutputComponent;
    @ViewChild(GraphRuleComponent) rule : GraphRuleComponent;

    deferred_rule : GraphRuleComponent = null;
    title = 'Soffit Web';

    ngOnInit(): void {
    }
    
    ngAfterViewInit() : void {
        setTimeout( () => {
            var left1 = "N[leaf]";
            var right1 = "N[internal]; L1[leaf]; L2[leaf]; N->L1; N->L2";

            this.rule.addRule( left1, right1 );
            this.output.start_edit.graph = "X[root]; Y[leaf]; Z[leaf]; X->Y; X->Z";
            this.deferred_rule = this.rule;
        } );
    }

    saveAsJson() {
        // Courtesy of stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
        var filename = "soffit.json";
        var data = JSON.stringify( this.rule.generateGrammar(), null, 2 );
        var blob = new Blob( [data], {type: 'text/json'} );
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
