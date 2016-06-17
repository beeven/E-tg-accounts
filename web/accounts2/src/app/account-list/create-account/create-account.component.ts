import { Component, OnInit } from '@angular/core';
import { AlertComponent } from 'ng2-bootstrap/components/alert';

@Component({
  moduleId: module.id,
  selector: 'app-create-account',
  templateUrl: 'create-account.component.html',
  styleUrls: ['create-account.component.css'],
  directives: [AlertComponent]
})
export class CreateAccountComponent implements OnInit {

  private companyId:string;
  private message:string;

  alerts: Array<Object>;

  constructor() {
    this.alerts = [
      {message:"test1", type:"success"},
      {message:"test2", type:"danger"}
    ]
  }

  closeAlert(i:number) {
    this.alerts.splice(i,1);
  }

  ngOnInit() {
  }

  createAccount(email:string, companyId:string, mobile:string) {
    // if(!email || !companyId || !mobile) { return; }
    // this.accountService.createAccount(email, companyId, mobile)
    //                    .subscribe(
    //                      account => { console.log(account) },
    //                      error => this.errorMessage = <any>error
    //                    );
  }

}
