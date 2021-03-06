declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void, chunkName: string | null) => void;
};

declare function clone(object:any):any;
declare function extend(...objects:object[]):any;
declare function EventHandler(target, method):any;

declare var DEBUG: boolean;

declare interface ISimpleReactElementProps {
    id?: string;
    className?: string;
    style?: any;
    key?: any;
    tabIndex?:number;
    title?:string;
}
declare interface IReactElementProps<T extends HTMLElement = HTMLElement> extends ISimpleReactElementProps, React.DOMAttributes<HTMLElement>{
    children?:any[]|any;
}

declare module "bem"{
    function bem(block, element?, mods?, mix?): string;
    export = bem;
}

declare module "react-color"{
    import {ComponentClass} from "react";
    export interface SketchPickerProps{
        display?: boolean;
        color?: any;
        positionCSS?: any;
        onChangeComplete?: any;
        presetColors?: any;
    }
    interface SketchPicker extends React.ComponentClass<SketchPickerProps> {}
    const SketchPicker: SketchPicker;

    export function CustomPicker(e:any);
}

declare module "react-color/lib/components/common/Hue"{
    var Hue: any;
    export = Hue;
}
declare module "react-color/lib/components/common/Alpha"{
    var Alpha: any;
    export = Alpha;
}
declare module "react-color/lib/components/common/Saturation"{
    // class SaturationType extends React.Component<any, any> {
    //     new(props);
    //     protected handleMouseDown:any;
    //     protected handleMouseUp:any;
    // }
    var Saturation: any;
    export = Saturation;
}
declare module "react-color/lib/components/common/EditableInput"{
    var EditableInput: any;
    export = EditableInput;
}
declare module "react-color/lib/components/common/Checkboard"{
    var Checkboard: any;
    export = Checkboard;
}

declare module 'react-color/lib/helpers/color' {
    interface IColor {
        isValidHex:(hex:any)=>boolean;
    }
    var color:IColor;

    export = color;
}

declare module 'react-color/lib/components/sketch/SketchPresetColors' {
    export default function SketchPresetColors();
}

declare module "unsplash-js"{
    interface IUnsplash{
        photos: any;
    }
    interface IUnsplashConstructor{
        new(options: any): IUnsplash;
    }
    const Unsplash: IUnsplashConstructor;
    export default Unsplash;
    export function toJson(value: any): any;
}

declare module "*.w.js" {
    class WebpackWorker extends Worker {
      constructor();
    }

    export = WebpackWorker;
  }