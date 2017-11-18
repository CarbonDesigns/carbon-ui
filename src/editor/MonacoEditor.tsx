import * as React from 'react';
import { ensureMonacoLoaded } from './MonacoLoader';
import EditorStore from "./EditorStore";

interface Props {
    value: string;
    language: string;
    onChange: (newValue: string) => any;
}

export class MonacoEditor extends React.Component<Props, {}> {
    editor: monaco.editor.IStandaloneCodeEditor;

    constructor(props, context) {
        super(props, context);

    }

    render(): JSX.Element {
        return <div className='monaco-editor' ref='editor'></div>;
    }

    componentDidMount() {
        ensureMonacoLoaded().then(() => {
            this.editor = monaco.editor.create(this.refs['editor'] as HTMLDivElement, {
                language: "typescript",
                lineNumbers: "on",
                theme: "vs-dark",
                automaticLayout: true
            });

            EditorStore.initialize(this.editor);
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