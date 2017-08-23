var SwatchesActions = {
    changeActiveSlot:(slot)=>{
        return {
            type:"SwatchesActions_changeActiveSlot",
            active:slot
        }
    },
    changeActiveColors:(fill, stroke) =>{
        return {
            type: "SwatchesActions_changeActiveColors",
            fill, stroke,
            async:true
        }
    }
};

export default SwatchesActions;
