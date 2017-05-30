export default {
    inserted: (item)=> {
        return {
            type: "StoriesActions_inserted",
            item
        }
    },
    changed: (item)=> {
        return {
            type: "StoriesActions_changed",
            item
        }
    },
    removed: (item)=> {
        return {
            type: "StoriesActions_removed",
            item
        }
    },
    activeStoryChanged: (item)=> {
        return {
            type: "StoriesActions_activeStoryChanged",
            item
        }
    }
}

