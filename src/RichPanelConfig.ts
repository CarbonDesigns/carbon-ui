import { LayoutDirection, LayoutDockPosition } from "carbon-core";

const version = 9; // update version if layout has to changed on the client

export default {
    edit: {
        version:version,
        direction: LayoutDirection.Row,
        fixed: true,
        children: [
            // {
            //     panelName: 'tools',
            //     fixed:true,
            //     width:55
            // },
            {
                direction: LayoutDirection.Column,
                width: 305,
                collapseDirection:LayoutDockPosition.Left,
                children: [
                    {
                        panelName: 'library',
                        height: 2 / 3
                    },
                    {
                        panelName: 'layers',
                        height: 1 / 3
                    }
                ]
            },
            {
                panelName: 'designer',
                fill:true,
                fixed:true
            },
            {
                panelName: 'comments',
                width: 250,
                collapsed: true,
                collapseDirection:LayoutDockPosition.Right
            },
            {
                direction: LayoutDirection.Column,
                width: 300,
                collapseDirection:LayoutDockPosition.Right,
                children: [
                    {
                        panelName: 'swatches',
                        height: 1 / 3
                    },
                    {
                        panelName: 'properties',
                        height: 2 / 3
                    }]
            }
        ]
    },
    prototype: {
        version:version,
        direction: LayoutDirection.Row,
        fixed: true,
        children: [
            // {
            //     width: 300,
            //     panelName: 'stories',
            //     collapseDirection:LayoutDockPosition.Left,
            // },
            // {
            //     panelName: 'tools',
            //     fixed:true,
            //     width:55
            // },
            {
                panelName: 'layers',
                width: 250,
                collapsed: true,
                collapseDirection:LayoutDockPosition.Left
            },
            {
                panelName: 'designer',
                fill:true,
                fixed:true
            }
        ]
    },
    preview: {
        version:version,
        direction: LayoutDirection.Row,
        fixed: true,
        children: [
            {
                width: 400,
                panelName: 'editor',
                collapseDirection:LayoutDockPosition.Left
            },
            {
                panelName: 'preview',
                fill:true,
                fixed:true
            },
            {
                width: 300,
                panelName: 'comments',
                collapsed:true,
                collapseDirection:LayoutDockPosition.Right,
            }
        ]
    },
    previewOnly: {
        version:version,
        panelName: 'preview',
        fill:true,
        fixed:true
    }
}