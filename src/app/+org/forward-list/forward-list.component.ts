import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-forward-list',
  templateUrl: './forward-list.component.html',
  styleUrls: ['./forward-list.component.scss'],
})
export class ForwardListComponent implements OnChanges {

  @Input() public items;
  @Input() public onlineUsers?: { [id: string]: string }
  @Input() public title: string;
  @Output() public itemSelected: EventEmitter<string> = new EventEmitter<any>();

  public selectedItems = [];
  public selectedItemsEntities = {};
  public itemsAll;
  public searchText: string;


  constructor(
    private modalController: ModalController,
  ) {}

  ionViewWillEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('items' in changes) {
      this.itemsAll = cloneDeep(this.items)
    }
  }

  ngOnInit() {
    this.itemsAll = cloneDeep(this.items)
  }

  public searchItems() {
    if (this.searchText?.length) {
      const searchText = this.searchText.toLowerCase()
      this.items = this.itemsAll.filter(item => {
        let initials = (item?.firstName?.toLowerCase()?.[0]) + (item?.lastName?.toLowerCase()?.[0]);
        const fullName = item?.firstName + ' ' + item?.lastName
        if (
          (initials && initials.includes(searchText)) ||
          fullName.toLowerCase().includes(searchText) ||
          item?.jobRole?.toLowerCase().includes(searchText) ||
          item?.itemname?.toLowerCase().includes(searchText) ||
          item?.displayName?.toLowerCase().includes(searchText) ||
          item?.purpose?.toLowerCase().includes(searchText)
        ) {
          return true
        }

      })
    } else {
      this.items = this.itemsAll;
    }
  }

  public itemSelect(selectedItem) {
    let itemId = selectedItem._id ? selectedItem._id : selectedItem.id;
    let idKey = selectedItem._id ? "_id" : "id";
    if (this.selectedItemsEntities[itemId]) {
      const index = this.selectedItems.findIndex(item => item[idKey] === itemId);
      this.selectedItems.splice(index, 1);
      this.selectedItemsEntities[itemId] = false;
    } else {
      this.selectedItems.push(selectedItem);
      this.selectedItemsEntities[itemId] = true;
    }
  }

  public doneSelection() {
    this.modalController.dismiss(this.selectedItems);
  }

  public cancelSelection() {
    this.modalController.dismiss();
  }

  public dismissModal() {
    this.modalController.dismiss();
  }

}
