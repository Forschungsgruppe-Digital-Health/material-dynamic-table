import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CellService, DynamicTableModule } from 'material-dynamic-table';
import { AppComponent } from './app.component';
import { OptionsCellComponent } from './cells/options-cell/options-cell.component';

@NgModule({
    declarations: [
        AppComponent,
        OptionsCellComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        DynamicTableModule,
        FormsModule,
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        MatNativeDateModule,
        MatMenuModule,
        MatIconModule,
        MatPaginatorModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private readonly cellService: CellService) {
    cellService.registerCell('options', OptionsCellComponent);
  }
}
