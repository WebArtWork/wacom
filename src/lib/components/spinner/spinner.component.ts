import { Component, OnInit } from '@angular/core';
import {SpinnerService} from '../../services/spinner.service';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
	private id;
	public full;
	public cover;
	public header;
	public content;

	close(){
		this.spin.close(this.id);
	}

  constructor(private spin: SpinnerService) { }
  
  ngOnInit() {
	}
}