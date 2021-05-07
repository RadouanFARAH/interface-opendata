import { Component,Inject ,OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-second',
  templateUrl: './dialog-second.component.html',
  styleUrls: ['./dialog-second.component.scss']
})
export class DialogSecondComponent implements OnInit {
  data:any
  dataToSend={
    selectedAgence:'',
    selectedAgent:''
  }
  constructor(
    public dialogRef: MatDialogRef<DialogSecondComponent>,
    @Inject(MAT_DIALOG_DATA) public agences) {
      this.data = agences.agences
     }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
