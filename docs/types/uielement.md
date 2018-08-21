There are properties which all elements has:

## Properties ##
name:string - (readonly) name of the element, visible in the [layers](../ui/layers.md) panel.
id:string - (readonly) unique element identificator
parent:UIElement - (readonly) parent of the current element.
x:number - horizontal position of the element
y:number - vertical position of the element
width:number - width of the element
height:number - height of the element
angle:number - gets or sets angle of the element.
visible:number - gets or sets element visibility.
fill:color|gradient - gets or sets element fill. Can be a color or an gradient.
stroke:color|gradient - gets or sets element stroke color or gradient.
opacity:number - gets or sets element opacity. Can be any value from 0 to 1.

Learn more about [element transformations](../concepts/transformations.md)

## Methods ##
### animate ###

_Example:_
### boundaryRect ###
Returns rectangle containing the element.

_Return value_
Instance of the [TRect](trect.md)

_Arguments:_
No arguments

_Example:_
``var rect = element.boundaryRect();

### clone ###

_Example:_

### center ###

_Example:_

### setProperties ###

_Example:_

### registerEventHandler ###

_Example:_

### raiseEvent ###

_Example:_

## Mixins ##
draggable
