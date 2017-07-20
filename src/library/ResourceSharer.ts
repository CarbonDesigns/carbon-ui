import { app, IApp, Symbol, createUUID, Font, IJsonNode, IPage, IPrimitive, StyleType, DataNode, IArtboard } from "carbon-core";
import ToolboxConfiguration from "./ToolboxConfiguration";

export class ResourceSharer {
    exportPage(page) {
        var clone = page.mirrorClone();

        var promise;
        if(!page.props.toolboxConfigId || page.isToolboxConfigDirty){
            promise = ToolboxConfiguration.buildToolboxConfig(page);
        } else {
            promise = Promise.resolve();
        }

        var i = 10; // to avoid infinite recursion in case of bugs
        while(this.expandNestedControls(clone) && i >=0){
            i--;
        }

        var styles = [];
        var textStyles = [];
        var fontMetadata = [];
        this.populatePageStyles(clone, styles, textStyles, fontMetadata);

        return promise.then(()=>{
            clone.setProps({toolboxConfigUrl:page.props.toolboxConfigUrl, toolboxConfigId:page.props.toolboxConfigId});
            return {
                page:clone.toJSON(),
                styles:styles,
                textStyles:textStyles,
                fontMetadata: fontMetadata,
                publishDate:new Date(),
                publishedBy: page.app.companyId()
                // add here any external dependencies
            }
        });
    }

    private expandNestedControls(page){
        var rect = page.getContentOuterSize();
        var pageId = page.id();
        var delta = 100;
        var posY = rect.y + rect.height + delta;
        var found = false;
        page.applyVisitor(e=>{
            if(e instanceof Symbol) {
                var source = e.props.source;
                if(source.pageId != pageId){
                    // clone referenced artboard and insert it to the current page
                    var refPage = DataNode.getImmediateChildById(page.app, source.pageId);
                    var refArtboard = DataNode.getImmediateChildById<IArtboard>(refPage, source.artboardId, true);
                    var clone = refArtboard.clone();
                    clone.setProps({id:createUUID(), x:rect.y, y:posY});
                    page.add(clone);
                    // TODO: add all states if needed

                    // calculate position for the next element
                    posY += clone.height() + delta;

                    // replace source for the referencing control
                    e.source({pageId:pageId, artboardId:clone.id()});
                    found = true;
                }
            }
        });

        return found;
    }

    private populatePageStyles(page, styles, textStyles, fontMetadata){
        page.applyVisitor(e=>{
            var styleId = e.styleId();
            if(styleId){
                styles.push(app.styleManager.getStyle(styleId, StyleType.Visual));
            }

            var textStyleId = e.props.textStyleId;
            if(textStyleId){
                textStyles.push(app.styleManager.getStyle(textStyleId, StyleType.Text));
            }

            var font = e.props.font;
            if (font){
                if (font.family !== Font.Default.family){
                    let metadata = page.app.getFontMetadata(font.family);
                    if (metadata){
                        fontMetadata.push(metadata);
                    }
                }

                var content = e.props.content;
                if (content && Array.isArray(content)){
                    for (var i = 0; i < content.length; i++) {
                        var range = content[i];
                        if (range.family && range.family !== Font.Default.family){
                            let metadata = page.app.getFontMetadata(range.family);
                            if (metadata){
                                fontMetadata.push(metadata);
                            }
                        }
                    }
                }
            }
        })
    }

    importPage(data) {
        var pageJson = data.page as IJsonNode;
        var name = ' (' + pageJson.props.name + ')';
        if (data.styles) {
            for (let style of data.styles) {
                style.name += name;
                app.styleManager.registerStyle(style, StyleType.Visual)
            }
        }

        if (data.textStyles) {
            for (let style of data.textStyles) {
                style.name += name;
                app.styleManager.registerStyle(style, StyleType.Text)
            }
        }

        if (data.fontMetadata) {
            for (var metadata of data.fontMetadata) {
                app.saveFontMetadata(metadata);
            }
        }

        return app.importPage(pageJson);
    }
}

export default new ResourceSharer();