import { Component, OnInit } from '@angular/core';
import {PAGINATION_DIRECTIVES} from 'ng2-bootstrap/components/pagination';
import { AccountService } from './account.service';
import { Account } from './account';

@Component({
  moduleId: module.id,
  selector: 'app-account-list',
  templateUrl: 'account-list.component.html',
  styleUrls: ['account-list.component.css'],
  directives: [PAGINATION_DIRECTIVES],
  providers: [AccountService]
})
export class AccountListComponent implements OnInit {
  totalItems:number;
  currentPage:number = 0;
  pageSize:number = 5;
  accounts: Account[];

  constructor(private accountService: AccountService) {

  }

  getAccounts(pageSize:number, currentPage:number) {
    this.accountService.getAccounts(this.pageSize,this.currentPage)
      .then((result)=>{
        this.accounts = result.records;
        this.totalItems = result.total;
      });
  }

  pageChanged(event:any):void {
  }
  ngOnInit() {
    this.getAccounts(this.pageSize, this.currentPage);
  }

}
