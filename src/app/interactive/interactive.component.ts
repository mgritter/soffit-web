import { Component, OnInit, ViewChild } from '@angular/core';
import { InteractiveOutputComponent } from '../interactive-output/interactive-output.component'
import { GraphRuleComponent } from '../graph-rule/graph-rule.component'

@Component({
  selector: 'app-interactive',
  templateUrl: './interactive.component.html',
  styleUrls: ['./interactive.component.css']
})
export class InteractiveComponent implements OnInit {

    constructor() { }

    @ViewChild(InteractiveOutputComponent) output : InteractiveOutputComponent;
    @ViewChild(GraphRuleComponent) rule : GraphRuleComponent;
    @ViewChild("fileInput") fileInput;
    deferred_rule : GraphRuleComponent = null;

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
        var grammar = this.rule.generateGrammar();
        grammar["version"] = "0.1";
        // FIXME: run this through soffitToSoffit?
        grammar["start"] = this.output.startGraphSoffit;
        var data = JSON.stringify( grammar, null, 2 );
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

    loadJsonStart() {
        this.fileInput.nativeElement.click()
    }
    
    loadJson() {
        var c = this;
        var file = this.fileInput.nativeElement.files[0];
        var reader = new FileReader();
        reader.onload = function (e) { c.loadJsonFinish(e); }
        reader.onerror = function (e) {
            // FIXME; find a place for this on the page
            alert( "Failed to read file." );
            console.log( "File error: " + e );
        }
        reader.readAsText( file );
    }

    loadJsonFinish( e ) {
        var text = e.target.result;
        var grammar = JSON.parse( text );
        if ( Object.keys( grammar ).length > 0 ) {
            // FIXME: add a method to dothis
            this.rule.rules = [];
            for ( var left in grammar ) {
                if ( left == "version" ) {
                    continue;
                }
                if ( left == "start" ) {
                    this.output.start_edit.graph = grammar[left];
                    continue;
                }
                if ( Array.isArray( grammar[left] ) ) {
                    for ( var right of grammar[left] ) {
                        this.rule.addRule( left, right);
                    } 
                } else {
                    this.rule.addRule( left, grammar[left] );
                }
            }
            this.output.reset_graph();
        } else {
            console.log( "Bad grammar: " + grammar );
        }
    }


}