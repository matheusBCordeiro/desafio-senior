import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

const httpOption = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const apiUrl = "http://localhost:3000";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url: String;
  constructor(private http: HttpClient) {
    this.url = 'products'
  }

  getProductPending(): Observable<any> {
    return this.http.get(`${apiUrl}/${this.url}/pending`, httpOption).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  getProductsParams(filter?: string, status?: string, page?: number): Observable<any> {
    let params = "?"
    if (filter) params += `filter=${filter}&`
    if (status) params += `status=${status}&`
    if (page) params += `page=${page}`
    let url = `${apiUrl}/${this.url}${params}`
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  postProduct(data): Observable<any> {
    return this.http.post(`${apiUrl}/${this.url}`, data, httpOption)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateProduct(data, id): Observable<any> {
    return this.http.patch(`${apiUrl}/${this.url}/response/${id}`, data, httpOption)
      .pipe(
        catchError(this.handleError)
      );
  }

  private extractData(res: Response) {
    let body = res;
    return body || {};
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.log(error)
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(error.error);
  }
}
