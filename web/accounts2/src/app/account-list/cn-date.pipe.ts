import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';



@Pipe({
  name: 'cnDate'
})
export class CnDatePipe implements PipeTransform {

  transform(value: any, format?: any): any {
    console.log(format);
    return moment(value).locale('zh-cn').format(format || 'YYYY-MM-DD');
  }

}
