export function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
    return fetch(url, options)
        .then(checkStatus)
        .then(response => response.json())
}

function checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    var error = new Error(response.statusText);
    error['response'] = response;
    throw error;
}