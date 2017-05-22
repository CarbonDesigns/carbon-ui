export default {
    navigateTo:(artboardId, animation) =>{
        return {
            type:'PreviewActions_navigateTo',
            artboardId, animation
        }
    },
    navigateBack:() =>{
        return {
            type:'PreviewActions_navigateBack'
        }
    },
    changeDevice:(device) =>{
        return {
            type:'PreviewActions_changeDevice',
            device
        }
    }
}