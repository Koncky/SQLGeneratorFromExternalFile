import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { selectedParameter } from './Models/selectedParameter';
import * as $ from 'jquery';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  spinnerEnabled = false;
  keys: string[] = [];
  dataSheet = new Subject<any>();
  @ViewChild('inputFile') inputFile?: ElementRef;
  isExcelFile: boolean = false;
  selectedParameters: selectedParameter[] = [];
  sqlCreatorTxt: string = "";
  dataXLSX: any[] = [];
  testQuery: string = "";

  onChange(evt: any) {
    let data: any, header;
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.isExcelFile = !!target.files[0].name.match(/(.xls|.xlsx)/);
    if (target.files.length > 1) {
      if(this.inputFile) {
        this.inputFile.nativeElement.value = '';
      }
    }
    if (this.isExcelFile) {
      this.spinnerEnabled = true;
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        data = XLSX.utils.sheet_to_json(ws);
      };

      reader.readAsBinaryString(target.files[0]);

      reader.onloadend = (e) => {
        this.spinnerEnabled = false;
        this.keys = Object.keys(data[0]);
        //this.dataSheet.next(data);
        this.dataXLSX = data;
      }
    } else {
      if(this.inputFile) {
        this.inputFile.nativeElement.value = '';
      }
    }
  }

  removeData() {
    if(this.inputFile) {
      this.inputFile.nativeElement.value = '';
    }
    this.dataSheet.next(null);
    this.keys = [];
    this.selectedParameters = [];
    this.dataXLSX = [];
    this.testQuery = "";
  }

  onSelectedParam(column: any) {
    
    let maxPosition = -1;
    this.selectedParameters.forEach(param => {
      if(param.selectedPosition > maxPosition) {
        maxPosition = param.selectedPosition;
      }      
    });

    maxPosition += 1;
    this.selectedParameters.push( { key: column, selectedPosition: maxPosition });
    this.setParameterToCurrentPos("{" + maxPosition + "}");
    //this.sqlCreatorTxt += "{" + maxPosition + "}";
    console.log(this.dataXLSX[0][column]);
  }

  onTest() {
    let message = "";
    this.testQuery = "";
    if(this.sqlCreatorTxt) {
      if(this.dataXLSX&& this.dataXLSX.length > 0) {
        this.dataXLSX.slice(0, 5).forEach(xlsx => {
          let params: string[] = [];
          this.selectedParameters.forEach(param => {
            params.push((xlsx[param.key]).toString());
          });
          this.testQuery += FormatString(this.sqlCreatorTxt, params);
        });
      }
      else {
        message = "Brak danych";
      }

    }
    else {
      message = "Brak wzorca";
    }

    if(message && message != "") {
      alert(message);
    }
  }

  onGenerateAll() {
    let message = "";
    this.testQuery = "";
    if(this.sqlCreatorTxt) {
      if(this.dataXLSX && this.dataXLSX.length > 0) {
        this.dataXLSX.forEach(xlsx => {
          let params: string[] = [];
          this.selectedParameters.forEach(param => {
            params.push((xlsx[param.key]).toString());
          });
          this.testQuery += FormatString(this.sqlCreatorTxt, params);
        });
      }
      else {
        message = "Brak danych";
      }

    }
    else {
      message = "Brak wzorca";
    }

    if(message && message != "") {
      alert(message);
    }
  }

  setParameterToCurrentPos(textToInsert: string) {
    let curPos = $('#sqlCreator').prop("selectionStart");
    if(curPos) {    
      console.log(curPos);
      let x = this.sqlCreatorTxt;
      
      this.sqlCreatorTxt = this.sqlCreatorTxt.slice(0, curPos) + textToInsert + this.sqlCreatorTxt.slice(curPos);
    }
  }

}

export function FormatString(str: string, val: string[]) {
  for (let index = 0; index < val.length; index++) {
    str = str.replace(`{${index}}`, val[index]);
  }
  return str + "\n";
}