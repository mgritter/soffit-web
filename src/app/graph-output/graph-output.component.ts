import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { SoffitApiService } from '../soffit-api.service';

declare var d3: any;

@Component({
  selector: 'app-graph-output',
  templateUrl: './graph-output.component.html',
  styleUrls: ['./graph-output.component.css']
})
export class GraphOutputComponent implements OnInit {
    constructor( private soffit : SoffitApiService ) { }

    show_error = false
    error_html = ""
    
    @ViewChild('output_div') output_div;

    // This really only works with brackets, as a normal
    // HTML attribute it's always a string, and all strings
    // are true.
    @Input() show_node_names : boolean;
    
    ngOnInit(): void {
    }

    @Input() max_width : number = 0;
    @Input() max_height : number = 0;
    width : number = 0;
    height : number = 0;

    // TODO: add a callback or Observer so that we can show breakdown
    // between API response and rendering.
    soffitGraph( graph : string ) : void {
        // console.log( "Rendering " + graph )
        // console.log( "To object: " + this.output_div + " " + this.output_div.nativeElement )
        var myElement = this

        this.show_error = false
        var viz = d3.select( this.output_div.nativeElement ).graphviz();
        viz.onerror( (err) => {
            this.show_error = true
            this.error_html = err
            console.log( "Dot parsing error: " + err )
        })
        try {
            let dot = this.soffit.soffitToDot( graph, this.show_node_names );
            // console.log( "DOT file: " + dot );
            if ( viz.data() != null ) { 
                viz.resetZoom();
            }
            // Auto-size
            viz.width( null );
            viz.height( null );
            viz.dot( dot, function() {
                var svg = viz.data()
                var svg_width = Number( svg.attributes["width"].split( "pt" )[0] ) * 1.33;
                var svg_height = Number( svg.attributes["height"].split( "pt" )[0] ) * 1.33;
                myElement.width = svg_width;
                myElement.height = svg_height;
                var layout_again = false;
                if ( myElement.max_width != 0 && svg_width > myElement.max_width ) {
                    viz.width( myElement.max_width );
                    layout_again = true;
                }
                if ( myElement.max_height != 0 && svg_height > myElement.max_height ) {
                    viz.height( myElement.max_height );
                    layout_again = true;
                }
                if ( layout_again ) {
                    viz.fit( true );
                    viz.renderDot( dot );
                } else {
                    viz.render();
                }
            })
        } catch ( err ) {
            this.show_error = true
            this.error_html = "" + err
        }
    }
}
