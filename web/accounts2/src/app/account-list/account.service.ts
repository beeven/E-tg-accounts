import { Injectable } from '@angular/core';
import { ACCOUNTS } from './mock-accounts';

@Injectable()
export class AccountService {

  constructor() {}

  getAccounts(pageSize:number, currentPage:number) {
    return Promise.resolve({total:ACCOUNTS.length, records:ACCOUNTS});
  }

  query(criteria:string) {

  }

  setPassword(userId:string, password:string) {}
  createAccount(email:string, companyId:string, mobile:string) {

  }

  deleteAccount(userId:string){

  }

}
