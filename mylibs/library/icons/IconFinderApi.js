import {backend} from "carbon-core";

const PageSize = 50;
const base = "https://api.iconfinder.com/v2";
const fetchOptions = {method: "GET", mode: 'cors'};

export default class IconFinderApi {
    search(term, page){
        var data = {
            query: term,
            count: PageSize,
            offset: PageSize*(page - 1),
            premium: false
        };
        var url = base + "/icons/search?" + backend.encodeUriData(data);
        return fetch(url, fetchOptions)
            .then(checkStatus)
            .then(parseJSON);
    }
    listIconsInSet(set){
        var data = {
            count: 100
        };
        var url = base + "/iconsets/" + set + "/icons?" + backend.encodeUriData(data);
        return fetch(url, fetchOptions)
            .then(checkStatus)
            .then(parseJSON);
    }
    static Base = base;
}

function checkStatus(response){
    if (response.status >= 200 && response.status < 300){
        return response;
    }
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
}

function parseJSON(response){
    return response.json();
}
