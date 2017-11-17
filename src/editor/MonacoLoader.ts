let loadPromise = null;
export function ensureMonacoLoaded():Promise<void> {
    loadPromise = loadPromise || new Promise<void>(resolve => {
        // Fast path - monaco is already loaded
        if (typeof ((window as any).monaco) === 'object') {
            resolve();
            return;
        }

        const onGotAmdLoader = () => {
            (window as any)["require"].config({ paths: { 'vs': '/target/vs' } });
            (window as any)["require"](['vs/editor/editor.main'], () => {
                resolve();
            });
        };

        // Load AMD loader if necessary
        if (!(window as any)["require"]) {
            const loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = '/target/vs/loader.js';
            loaderScript.async = true;
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    });

    return loadPromise;
}