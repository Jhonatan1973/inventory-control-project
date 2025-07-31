import { Component } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';

@Component({
  selector: 'app-stock',
  imports: [TopbarComponent, MenuDesktopComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent {

}
