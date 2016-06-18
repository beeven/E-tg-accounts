import { Injectable } from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Account } from './account';
import './rxjs-operators';

@Injectable()
export class AccountService {
  constructor(private http: Http) {}
  private accountsUrl = 'api/accounts';

  getAccounts(pageSize:number, currentPage:number): Observable<any> {
    return this.http.get(`${this.accountsUrl}/${pageSize}/${currentPage}`)
                    .map((res: Response)=>{
                      let body = res.json();
                      console.log(body);
                      return {
                        total: body.data.length,
                        records: body.data
                      }
                    })
                    .catch(this.handleError);
  }
  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  query(criteria:string):Observable<Account[]> {
    return this.http.get(`${this.accountsUrl}/query/${criteria}`)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  setPassword(userId:string, password:string) {
      let body = JSON.stringify({userId, password});
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers });
      return this.http.post(`${this.accountsUrl}/setPassword`, body, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }
  createAccount(email:string, companyId:string, mobile:string):Observable<Account> {
    let body = JSON.stringify({email, companyId, mobile});
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.accountsUrl, body, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  createTemporaryAccount(companyId:string):Observable<Object> {
    let body = JSON.stringify({companyId});
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${this.accountsUrl}/temporary`, body, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  deleteAccount(userId:string){
    return this.http.delete(`${this.accountsUrl}/${userId}`).catch(this.handleError);
  }

}
