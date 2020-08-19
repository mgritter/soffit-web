import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphOutputComponent } from '../graph-output/graph-output.component'
import { SoffitTextareaComponent } from '../soffit-textarea/soffit-textarea.component'
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-about-soffit',
  templateUrl: './about-soffit.component.html',
  styleUrls: ['./about-soffit.component.css']
})
export class AboutSoffitComponent implements OnInit {
  constructor() { }

    @ViewChild('example_edit') example_edit : SoffitTextareaComponent;
    @ViewChild('example') example : GraphOutputComponent;

    exampleGraphSoffit : string = "";

    ngAfterViewInit() : void {
        let c = this;
        this.example_edit.textObserver()
            .pipe( debounceTime( 500 ) )
            .subscribe( newValue => {
                c.example.soffitGraph( newValue );
            } );
        this.example_edit.graph = "X[foo]; Y[bar]; X->Y [label]; \n이모티콘[☺️️]";
    }

    ngOnInit(): void {
    }

}
