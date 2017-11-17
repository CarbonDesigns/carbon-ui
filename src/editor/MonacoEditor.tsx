/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

import * as React from 'react';

declare const require: any;

interface Props {
    value: string;
    language: string;
    onChange: (newValue: string) => any;
}

export class MonacoEditor extends React.Component<Props, {}> {
    editor: monaco.editor.IStandaloneCodeEditor;
    _loadPromise: Promise<void>;
    _loaded: boolean;

    constructor(props, context) {
        super(props, context);
        this._loadPromise = new Promise<void>(resolve => {
            // Fast path - monaco is already loaded
            if (typeof ((window as any).monaco) === 'object') {
                resolve();
                return;
            }

            const onGotAmdLoader = () => {
                // Load monaco
                (window as any)["require"].config({ paths: { 'vs': '/target/vs' } });
                (window as any)["require"](['vs/editor/editor.main'], () => {
                    this._loaded = true;
                    resolve();
                });
            };

            // Load AMD loader if necessary
            if (!(window as any)["require"]) {
                const loaderScript = document.createElement('script');
                loaderScript.type = 'text/javascript';
                loaderScript.src = '/target/vs/loader.js';
                loaderScript.addEventListener('load', onGotAmdLoader);
                document.body.appendChild(loaderScript);
            } else {
                onGotAmdLoader();
            }
        });
    }

    render(): JSX.Element {
        return <div className='monaco-editor' ref='editor'></div>;
    }

    componentDidMount() {
        this._loadPromise.then(() => {
            //monaco.editor

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                allowJs: false,
                noLib: true,
                alwaysStrict: true,
                allowNonTsExtensions: true
            });


            let dd = monaco.languages.typescript.typescriptDefaults.addExtraLib([
                'declare class Facts {',
                '    /**',
                '     * Returns the next fact',
                '     */',
                '    static next():string',
                '}',
            ].join('\n'), 'filename/facts.d.ts');

            var model = monaco.editor.createModel(`
                    export class Model2 {
                        run() {
                            let a = new Facts();
                        }
                    }
                `, "typescript", monaco.Uri.parse("model.ts"));


            this.editor = monaco.editor.create(this.refs['editor'] as HTMLDivElement, {
                language: "typescript",
                lineNumbers: "off",
                theme: "vs-dark",
                automaticLayout: true
            });

            this.editor.setModel(model);

            setTimeout(function () {
                alert('test');
                // dd.dispose();
                // monaco.languages.typescript.typescriptDefaults.addExtraLib([
                //     'declare class Facts {',
                //     '    /**',
                //     '     * Returns the next fact',
                //     '     */',
                //     '    static next2():string;',
                //     '    foo():string;',
                //     '}',
                // ].join('\n'), 'filename/facts.d.ts');

                monaco.languages.typescript.getTypeScriptWorker().then(worker => {
                    worker(model.uri).then(client => {
                        client.getEmitOutput(model.uri.toString()).then(result => {
                            alert(result);
                        });
                    });
                });
            }, 15000)


            this.editor.onDidChangeModelContent(event => {
                this.props.onChange(this.editor.getValue());
            });
        })
    }

    componentWillUnmount() {
        this.editor.dispose();
        this.editor = null;
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value !== this.props.value && this.editor) {
            this.editor.setValue(this.props.value);
        }

        if (prevProps.language !== this.props.language) {
            throw new Error('<MonacoEditor> language cannot be changed.');
        }
    }
}