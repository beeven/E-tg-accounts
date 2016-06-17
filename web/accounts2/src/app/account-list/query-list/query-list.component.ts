import { Component, OnInit, Input } from '@angular/core';
import {PAGINATION_DIRECTIVES} from 'ng2-bootstrap/components/pagination';
import { Account } from '../account';
import { AccountService } from '../account.service';

@Component({
  moduleId: module.id,
  selector: 'app-query-list',
  templateUrl: 'query-list.component.html',
  styleUrls: ['query-list.component.css'],
  directives: [PAGINATION_DIRECTIVES],
})
export class QueryListComponent implements OnInit {

  @Input() criteria:string;
  totalItems:number;
  currentPage:number = 1;
  pageSize:number = 5;
  errorMessage:string;
  accounts: Account[];
  pageStartIndex:number = 0;
  pageEndIndex:number = this.pageSize;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
  }

  pageChanged(event:any) {
    this.pageStartIndex = (event.page -1) * this.pageSize;
    this.pageEndIndex = this.pageStartIndex + this.pageSize;
  }

  public query(){
    if(this.criteria.length < 2) {
      this.errorMessage = "查询关键字长度必须大于2";
      return;
    }
    this.accountService.query(this.criteria)
                    .subscribe(
                      (accounts)=> { this.accounts = accounts; this.totalItems=accounts.length; },
                      (error) => this.errorMessage = <any>error
                    );
  }
}
