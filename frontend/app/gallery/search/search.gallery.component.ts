///<reference path="../../../browser.d.ts"/>

import {Component} from "@angular/core";
import {AutoCompleteService} from "./autocomplete.service";
import {AutoCompleteItem, AutoCompeleteTypes} from "../../../../common/entities/AutoCompleteItem";
import {Message} from "../../../../common/entities/Message";
import {GalleryService} from "../gallery.service";
import {FORM_DIRECTIVES} from "@angular/common";
import {Config} from "../../config/Config";

@Component({
    selector: 'gallery-search',
    templateUrl: 'app/gallery/search/search.gallery.component.html',
    styleUrls: ['app/gallery/search/search.gallery.component.css'],
    providers: [AutoCompleteService],
    directives: [FORM_DIRECTIVES]
})
export class GallerySearchComponent {

    autoCompleteItems:Array<AutoCompleteRenderItem> = [];
    private searchText:string = "";

    constructor(private _autoCompleteService:AutoCompleteService, private _galleryService:GalleryService) {
    }

    onSearchChange(event:KeyboardEvent) {

        let searchText = (<HTMLInputElement>event.target).value;

        if (Config.Client.Search.autocompleteEnabled) {
            this.autocomplete(searchText);
        }

        if (Config.Client.Search.instantSearchEnabled) {
            this._galleryService.instantSearch(searchText);
        }
    }

    public onSearch() {
        if (Config.Client.Search.searchEnabled) {
            this._galleryService.search(this.searchText);
        }
    }

    public search(item:AutoCompleteItem) {
        console.log("clicked");
        this.searchText = item.text;
        this.onSearch();
    }



    public onFocusLost(event) {
        this.autoCompleteItems = [];
    }

    public onFocus(event) {
        this.autocomplete(this.searchText);
    }

    private emptyAutoComplete() {
        this.autoCompleteItems = [];
    }

    private autocomplete(searchText:string) {
        if (!Config.Client.Search.autocompleteEnabled) {
            return
        }
        if (searchText.trim().length > 0) {
            this._autoCompleteService.autoComplete(searchText).then((message:Message<Array<AutoCompleteItem>>) => {
                if (message.error) {
                    //TODO: implement
                    console.error(message.error);
                    return;
                }
                this.showSuggestions(message.result, searchText);
            });
        } else {
            this.emptyAutoComplete();
        }
    }

    private showSuggestions(suggestions:Array<AutoCompleteItem>, searchText:string) {
        this.emptyAutoComplete();
        suggestions.forEach((item:AutoCompleteItem)=> {
            let renderItem = new AutoCompleteRenderItem(item.text, searchText, item.type);
            this.autoCompleteItems.push(renderItem);
        });
    }

}

class AutoCompleteRenderItem {
    public preText:string = "";
    public highLightText:string = "";
    public postText:string = "";
    public type:AutoCompeleteTypes;

    constructor(public text:string, searchText:string, type:AutoCompeleteTypes) {
        let preIndex = text.toLowerCase().indexOf(searchText.toLowerCase());
        if (preIndex > -1) {
            this.preText = text.substring(0, preIndex);
            this.highLightText = text.substring(preIndex, preIndex + searchText.length);
            this.postText = text.substring(preIndex + searchText.length);
        } else {
            this.postText = text;
        }
        this.type = type;
    }
}
