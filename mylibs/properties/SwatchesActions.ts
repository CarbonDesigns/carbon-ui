var SwatchesActions = {
    changeActiveSlot:(slot)=>{
        return {
            type:"SwatchesActions_changeActiveSlot",
            active:slot
        }
    },
    changeActiveColors:(fill, stroke, font) =>{
        return {
            type: "SwatchesActions_changeActiveColors",
            fill, stroke, font,
            async:true
        }
    }
};

export default SwatchesActions;
