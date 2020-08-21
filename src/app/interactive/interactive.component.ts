import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InteractiveOutputComponent } from '../interactive-output/interactive-output.component'
import { GraphRuleComponent } from '../graph-rule/graph-rule.component'
import { request } from '@octokit/request'

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

    gist_url_text = new FormControl( "" );
    dropdown_class : string = "dropdown-hidden";
    gist_open : boolean = false;
    gist_error : string = "";
    
    openGistPanel() {
        if ( this.gist_open ) {
            this.gist_open = false;
            this.dropdown_class = "dropdown-hidden";
            this.gist_error = "";
        } else {
            this.gist_open = true;
            this.dropdown_class = "dropdown-show";
            this.gist_error = "";
        }
    }

    async loadGist() {
        try {
            let url = this.gist_url_text.value;
            if ( url.trim() == "" ) {
                this.gist_error = "Please provide a GitHub Gist ID or URL.";
                return;
            }
            // Cheap way, doesn't validate URL
            let tokens = url.split( "/" );
            let id = tokens[tokens.length-1];
                
            let result = await request( "GET /gists/{gist_id}", {
                gist_id : id
            } );

            if ( result.status != 200 ) {
                this.gist_error = "HTTP error: " + result.status 
            } else {
                for ( var f in result.data.files ) {                
                    this.loadJsonText( result.data.files[f].content );
                    this.openGistPanel(); // Close it
                    return;
                }
            }
        } catch ( err ) {                 
            this.gist_error = err;
        }
    }
    
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
        this.loadJsonText( text );
    }
    
    loadJsonText( text ) {
        // FIXME: better error handling
        var grammar = JSON.parse( text );
        if ( Object.keys( grammar ).length > 0 ) {
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
