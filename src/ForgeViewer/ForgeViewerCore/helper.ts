export const loadScripts = (version: string = '7.*', isMinFile: boolean = true, isLMV: boolean = false): Promise<any> =>
    new Promise((resolve, reject) => {
        let ready: boolean = false;
        const script: HTMLScriptElement = document.createElement('script');
        if (isLMV) {
            script.src = `https://autodeskviewer.com/viewers/${version === '7.*' ? 'latest' : version}/viewer3D${isMinFile ? '.min' : ''}.js`;
        } else {
            script.src = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/viewer3D${isMinFile ? '.min' : ''}.js`;
        }

        script.async = true;
        document.body.appendChild(script);
        const style: HTMLLinkElement = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        if (isLMV) {
            style.href = `https://autodeskviewer.com/viewers/${version === '7.*' ? 'latest' : version}/style.min.css`;
        } else {
            style.href = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/style.min.css`;
        }
        document.body.appendChild(style);

        script.onload = (): void => {
            if (!ready) {
                ready = true;
                resolve(script);
            }
        };
        script.onerror = (msg: any): void => {
            console.error(msg);
            reject(new Error('Error loading Forge script.'));
        };
        script.onabort = (msg: UIEvent): void => {
            console.error(msg);
            reject(new Error('Forge script loading aborted.'));
        };
    });