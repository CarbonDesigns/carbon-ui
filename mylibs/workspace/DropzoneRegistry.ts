interface IRegistry{
    "workspace": Dropzone,
    "panel": Dropzone
}

export type DropzoneType = keyof IRegistry;

export default {
    register(type: DropzoneType, zone: Dropzone){
        this[type] = zone;
    },
    get(type: DropzoneType): Dropzone{
        return this[type];
    }
}