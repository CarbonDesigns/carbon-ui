import { LayoutStore } from '../../../layout/LayoutStore';
import panelConfig from "../../../RichPanelConfig";

function getLocation(panel) {
    return `${panel.x}:${panel.y}:${panel.width}:${panel.height}`;
}

var Direction = {
    Row: 1,
    Column: 0
}

describe("Layout tests", function () {
    beforeEach(function (done) {
        delete localStorage['layout:test'];
        LayoutStore.lastIndex = 0;
        done();
    });


    describe("Rendering tree tests", function () {
        it("Should set intial sizes (simple row)", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", {
                direction: 1,
                fixed: true,
                children: [
                    {
                        width: 300,
                        panelName: 'test1',
                        index: 2
                    },
                    {
                        panelName: 'test2',
                        fill: true,
                        index: 3
                    }
                ]
            });

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var panel1 = layoutStore.getRenderedPanelByIndex(2);
            assert.equal('0:0:300:1000', getLocation(panel1), 'Incorrect panel 1 size');

            var panel2 = layoutStore.getRenderedPanelByIndex(3);
            assert.equal('303:0:697:1000', getLocation(panel2), 'Incorrect panel 2 size');

            var tree = layoutStore.getRenderingTree();
            assert.equal(3, tree.children.size, "Should be one splitter inserted");
        });

        it("Should set intial sizes (simple column)", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", {
                direction: Direction.Column,
                fixed: true,
                children: [
                    {
                        height: 300,
                        panelName: 'test1',
                        index: 2
                    },
                    {
                        panelName: 'test2',
                        fill: true,
                        index: 3
                    }
                ]
            });

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var panel1 = layoutStore.getRenderedPanelByIndex(2);
            assert.equal('0:0:1000:300', getLocation(panel1), 'Incorrect panel 1 size');

            var panel2 = layoutStore.getRenderedPanelByIndex(3);
            assert.equal('0:303:1000:697', getLocation(panel2), 'Incorrect panel 2 size');

            var tree = layoutStore.getRenderingTree();
            assert.equal(3, tree.children.size, "Should be one splitter inserted");
        });

        it("Should set intial sizes (multiple splitters)", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", {
                direction: Direction.Row,
                fixed: true,
                children: [
                    {
                        panelName: 'test1'
                    },
                    {
                        panelName: 'test2'
                    },
                    {
                        panelName: 'test3',
                        fill: true
                    },
                    {
                        panelName: 'test4'
                    }
                ]
            });

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var tree = layoutStore.getRenderingTree();
            assert.equal(2, tree.children.get(1).type, "First splitter");
            assert.equal(2, tree.children.get(3).type, "Second splitter");
            assert.equal(2, tree.children.get(5).type, "Third splitter");
        });

        it("Should set intial sizes (simple grid)", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", {
                direction: Direction.Row,
                fixed: true,
                children: [
                    {
                        width: 300,
                        direction: Direction.Column,
                        children: [
                            {
                                panelName: 'test1',
                                height: 1 / 2
                            },
                            {
                                panelName: 'test2',
                                height: 1 / 2
                            }
                        ]
                    },
                    {
                        fill: true,
                        direction: Direction.Column,
                        children: [
                            {
                                panelName: 'test3'
                            },
                            {
                                panelName: 'test4'
                            }
                        ]
                    }
                ]
            });

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var panel1 = layoutStore.getRenderedPanelByName('test1');
            assert.equal('0:0:300:498.5', getLocation(panel1), 'Incorrect panel 1 size');
            var panel2 = layoutStore.getRenderedPanelByName('test2');
            assert.equal('0:501.5:300:498.5', getLocation(panel2), 'Incorrect panel 2 size');
        });

        it("Should load default config", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", panelConfig.edit);

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var tree = layoutStore.getRenderingTree();
            assert.notEqual(null, tree);

            var panel1 = layoutStore.getRenderedPanelByName('library');
            assert.equal('0:0:305:664.6666666666666', getLocation(panel1), 'Incorrect panel 1 size');
            var panel2 = layoutStore.getRenderedPanelByName('layers');
            assert.equal('0:667.6666666666666:305:332.3333333333333', getLocation(panel2), 'Incorrect panel 2 size');
        });

        it("Should collapse panel to the right side", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", {
                direction: Direction.Row,
                fixed: true,
                children: [
                    {
                        collapseDirection: 1,//left
                        panelName: 'test1',
                        collapsed: true,
                        width: 300
                    },
                    {
                        panelName: 'test2'
                    },
                    {
                        direction: Direction.Row,
                        collapseDirection: 3,//right
                        width: 250,
                        children: [
                            {
                                panelName: 'test3',
                                collapsed: true
                            },
                        ]
                    }
                ]
            });

            // act
            layoutStore.resize(1000, 1000);

            // assert
            var tree = layoutStore.getRenderingTree();
            var panel2 = layoutStore.getRenderedPanelByName('test2');
            assert.equal('35:0:930:1000', getLocation(panel2), "panel test 2");
            var panel1 = layoutStore.getRenderedPanelByName('test1');
            assert.equal('35:0:300:1000', getLocation(panel1), "panel test 1");
            var panel3 = layoutStore.getRenderedPanelByName('test3');
            assert.equal('715:0:250:1000', getLocation(panel3), "panel test 3");
        });

        it("Should collapse nested to right side and size", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", panelConfig.edit);

            // act
            layoutStore.resize(1000, 1000);
            layoutStore.togglePanelByName('library');

            // assert
            var panel = layoutStore.getRenderedPanelByName('library');
            assert.equal('35:0:305:1000', getLocation(panel), "library panel");
            assert.equal(true, panel.collapsed, "library panel");

            panel = layoutStore.getRenderedPanelByName('layers');
            assert.equal('35:0:305:1000', getLocation(panel), "layers panel");
        });

        it("Floating should not break other panels", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", panelConfig.edit);

            // act
            layoutStore.resize(1000, 1000);
            layoutStore.togglePanelByName('swatches');
            var originalPanelLocation = getLocation(layoutStore.getRenderedPanelByName('swatches'));

            layoutStore.detachPanelByName("properties", 100, 100, 200, 300);

            // assert
            var panel = layoutStore.getRenderedPanelByName('swatches');

            assert.equal(originalPanelLocation, getLocation(panel), "library panel");
        });

        it("Dock to root should keep correct sizes", function () {
            //arrange
            var layoutStore = new LayoutStore(null);
            layoutStore.setLayout("test", panelConfig.edit);
            layoutStore.resize(1000, 1000);
            layoutStore.detachPanelByName('swatches', 0, 0, 100, 100);

            var sourceIndex = layoutStore.getRenderedPanelByName('swatches').index;

            // act
            layoutStore.attachPanel(sourceIndex, layoutStore.state.renderingTree.index, 2);

            // assert
            var tree = layoutStore.getRenderingTree();
            assert.equal(1000-35, tree.width, "Root width");
            assert.equal(1000, tree.height, "Root height");
            assert.equal(0, tree.direction, "Root direction");

            assert.equal(200, tree.children.get(0).height, "Swatches height");
            assert.equal(965, tree.children.get(0).width, "Swatches width");

            assert.equal(1000 - 3 - 200, tree.children.get(2).height, "Rest height");
            assert.equal(965, tree.children.get(2).width, "Rest width");
        });

    });

});