import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { XltofirestoreService } from '../services/xltofirestore.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  public department: string;
  message = 'Uploading';
  showMessage: boolean = false;
  uploadMessage = 'Uploaded Successfully. Please check your application (https://sarkariguesthouse.com)';
  uploaded: boolean = false;
  constructor(private xlservice: XltofirestoreService) { }

  ngOnInit() {
  }

  fileChange(event): void {
    if (this.department) {
      const fileList: FileList = event.target.files;
      if (fileList.length > 0) {
        const file = fileList[0];
        this.showMessage = true;
        this.xlservice.uploadFile(file, this.department).then(() => {
          this.message = 'stored';
        })
      }
    }
  }

  uploadConvertedJson() {
    let departmentSelected = this.department;
    if (this.department) {
      this.xlservice.firestorethis(departmentSelected).then(() => {
        this.uploaded = true;
      })
    }
  }

  get departmentSelected() {
    return this.department;
  }
}
