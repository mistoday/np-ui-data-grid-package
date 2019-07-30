import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DataSource, CustomStore, DataTypes, NpUiDataGridComponent, SortDirections } from 'projects/np-ui-data-grid/src/public-api';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  gridColumns: any[];
  gridDataSource: DataSource;
  gridDataSource1: DataSource;
  @ViewChild("actionButtonsTemplate", { static: true }) actionButtonsTemplate: TemplateRef<any>;
  @ViewChild("birthDateColumnTemplate", { static: true }) birthDateColumnTemplate: TemplateRef<any>;

  @ViewChild("serverSideGrid", { static: true }) serverSideGrid: NpUiDataGridComponent;

  _toggleColumn: boolean = true;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    var that = this;

    this.gridColumns = [
      { dataField: "Id", visible: true, width: 100, caption: "Id", dataType: DataTypes.number, sortEnabled: true, filterEnabled: true, onCellClick: this.cellClicked },
      { dataField: "FirstName", visible: true, width: 150, caption: "First Name", dataType: DataTypes.string, sortEnabled: true, filterEnabled: true },
      { dataField: "LastName", visible: true, width: 150, caption: "Last Name", dataType: DataTypes.string },
      { dataField: "BirthDate", visible: true, width: 150, caption: "Birth Date", dataType: DataTypes.date, filterEnabled: true, cellTemplate: this.birthDateColumnTemplate },
      { dataField: "Age", visible: true, width: 100, dataType: DataTypes.number, sortEnabled: true, filterEnabled: true, styleClass: "color-red" },
      { dataField: "Active", visible: true, width: 150, caption: "Is Active?", dataType: DataTypes.boolean, filterEnabled: true, },
      { visible: true, width: 100, cellTemplate: this.actionButtonsTemplate }];

    this.dataService.getAll().subscribe((data: any) => {
      /** for client side grid */
      this.gridDataSource = new DataSource();
      this.gridDataSource.data = data;
    });

    /** for server side grid */
    this.gridDataSource1 = new DataSource();
    this.gridDataSource1.isServerOperations = true;
    this.gridDataSource1.load = function (pageNumber, pageSize, sortColumns, filterColumns) {
      return new Promise((resolve, reject) => {
        var reqBody = { pageNumber: pageNumber, pageSize: pageSize, sortColumns: sortColumns, filterColumns: filterColumns }
        that.dataService.getDataUsingLoadOptions(reqBody).subscribe((data: any) => {
          var result = new CustomStore();
          result.data = data.data;
          result.total = data.total;
          resolve(result)
        });
      });
    }
  }

  cellClicked(event: any, column: any, row: any) {
    alert("column " + column.dataField + " clicked. Value is " + row[column.dataField]);
  }

  onActionClick(rowData: any, event: any, $event) {
    $event.stopPropagation();
    if (event == "Edit") {
      alert('Edit button click for row: ' + rowData.Id);
    }
    if (event == "Delete") {
      alert('Delete button click for row: ' + rowData.Id);
    }
  }

  closeAllChild() {
    this.serverSideGrid.closeAllChild();
  }

  getSelectedRowKeys() {
    var keys = this.serverSideGrid.getSelectedRowKeys();
    alert(keys);
  }

  toggleFirstColumn() {
    this._toggleColumn = !this._toggleColumn;
    if (this._toggleColumn) {
      this.serverSideGrid.showColumnByIndex(1);
    } else {
      this.serverSideGrid.hideColumnByIndex(1);
    }
  }

  changeColumns() {
    var columns = this.serverSideGrid.getColumns();
    columns[1].visible = false;
    columns[2].visible = false;
    columns[0].sortDirection = SortDirections.Descending;    
    this.serverSideGrid.setColumns(columns);
  }

}
