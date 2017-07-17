import {backend} from "carbon-core";

const PageSize = 50;
const base = "https://api.iconfinder.com/v2";
const fetchOptions: RequestInit = {method: "GET", mode: 'cors'};

export default class IconFinderApi {
    search(term: string, start: number, stop: number){
        var data = {
            query: term,
            count: stop - start,
            offset: start,
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
    error["response"] = response;
    throw error;
}

function parseJSON(response){
    return response.json();
}
