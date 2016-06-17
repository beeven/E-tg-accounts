import { Component, OnInit } from '@angular/core';
import {PAGINATION_DIRECTIVES} from 'ng2-bootstrap/components/pagination';
import { Account } from '../account';
import { AccountService } from '../account.service';

@Component({
  moduleId: module.id,
  selector: 'app-browsing-list',
  templateUrl: 'browsing-list.component.html',
  styleUrls: ['browsing-list.component.css'],
  directives: [PAGINATION_DIRECTIVES],
})
export class BrowsingListComponent implements OnInit {
  totalItems:number;
  currentPage:number = 1;
  pageSize:number = 5;
  errorMessage:string;

  accounts: Account[];
  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.getAccounts(this.pageSize, this.currentPage);
  }
  getAccounts(pageSize:number, currentPage:number) {
    this.accountService.getAccounts(this.pageSize,this.currentPage)
    .subscribe(
      (result:any)=>{
        this.accounts = result.records;
        this.totalItems = result.total;
        console.log(this.accounts);
        console.log(this.totalItems);
      },
      (error) => {this.errorMessage = <any>error;}
    );

  }

  pageChanged(event:any):void {
    this.getAccounts(this.pageSize,this.currentPage);
  }

  deleteAccount(account){
    this.accountService.deleteAccount(account.userId).subscribe(
        ()=>{
          var index = this.accounts.indexOf(account);
          if(index != -1) {
            this.accounts.splice(index,1);
          }
        },
        error => this.errorMessage = <any>error
      );
  }
}
