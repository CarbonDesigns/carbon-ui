export type LayerAction =
    { type:"Layers_toggleExpand", index: number } |
    { type:"Layers_dropped", targetId: string, targetIndex: number };