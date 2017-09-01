import { IDataProvider, Text, TextMode } from "carbon-core";

export default class CustomDataProvider implements IDataProvider {
    data: any;
    format: string;

    constructor(public id: string, public name: string, data, format) {
        this.data = data;
        this.format = format;
    }
    fetch(fields, rowCount) {
        var result = [];
        if (this.data.length === 0) {
            return Promise.resolve(result);
        }
        if (this.format === "list") {
            var field = fields[0];
            var dataIndex = 0;
            for (var i = 0; i < rowCount; ++i) {
                result.push({ [field]: this.data[dataIndex] });

                if (++dataIndex === this.data.length) {
                    dataIndex = 0;
                }
            }
        }
        return Promise.resolve(result);
    }
    getConfig() {
        return {
            groups: [
                {
                    name: "",
                    examples: this.data.slice(0, 2)
                }
            ]
        }
    }
    createElement(app, field) {
        var element = new Text();
        element.prepareAndSetProps({
            content: "= " + this.name,
            mode: TextMode.Label,
            font: app.props.defaultTextSettings.font,
            textStyleId: app.props.defaultTextSettings.textStyleId,
            dp: this.id,
            df: field
        });
        element.runtimeProps.isDataElement = true;
        return element;
    }

    toJSON() {
        return { id: this.id, name: this.name, data: this.data, format: this.format };
    }
    static fromJSON(json) {
        return new CustomDataProvider(json.id, json.name, json.data, json.format);
    }
}
