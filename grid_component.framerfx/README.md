# Statefull grid component (_βeta_)

This component is aimed at rendering the data grids and lists with the stateful logic behind it.
It supports the `default`, `active` and `hover` states so far.


**NOTE**: 
`This component is still under the development so use it at your own risk.
Keep in mind that any of the further changes might break some stuff in your prototype ☠️`

## Table of content
- **How to use**
  - Passing desing states
  - Passing options
  - Logic and other adjustments
- **API guide and override examples**

## How to use
### Passing states

To use the component you need to pass it at least one design state - `default`. It could be some frame from your canvas or design component. Use vertical '...' sign at the right side to attach the desired component to it. The same way you can pass another state of the component like `active` or `hover` if you need one. 

**NOTE:**
It's recommended to use `design components` for the states to maintain the same children order and hierarchy which is crucial for the component to work properly.

But while keeping the structure intact between the states you are free to make any adjustments to your state's children: change position, rotation, opacity, color, etc.. All those changes should be reflected in state change during the user interaction.

### Passing options

There are several ways of populate items inside the grid component. Briefly `numbers generator`, `options` or `JSON` .

By default, the component uses `numbers generator` to populate items. It's useful if you want to render the fixed number of elements, eg. images grid. You can override this behavior passing the `options` item. It accepts an array of strings to populate items. It's useful if you want a simple list eg. ToDo, where each item has only one text element you want to override. If you'd like to render complex items with several texts and other properties to override use `JSON` instead.
If you pass both `options` and `JSON` the `JSON` will have the priority over `options` 

To render the text from your `options` or `JSON` rendered inside your design component you should use a special template sign `$` in a text. While using `JSON` it's also required to name your texts accordingly. 

For example, if we're making the tracklist for some music band (eg. Pantera), we probably would have the `name`, `album` in our `JSON` data.
 
```json
{
"default": [
        {
            "text": {"name": "Walk", "album": "Vulgar Display of Power"},
        }
]}
```
So to render that data in our design component we should use the following design component structure.
 
![design_component](readme_images/design_component.png)
