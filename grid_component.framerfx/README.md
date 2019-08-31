# Stateful grid (_βeta_)

This FramerX component is aimed at rendering the data grids and lists with the stateful logic behind it.
It supports the `default`, `active` and `hover` states so far.

> This component is still under the development so use it at your own risk.
> Keep in mind that any of the further changes might break some stuff in your prototype ☠️

### Table of content

- **How to use**
  - Passing desing states
  - Passing options
  - Using text templates
  - Passing other props
- **API overview**
- **Override examples**



## How to use

### Passing states

To use the component you need to pass it at least one design state - `default`. It could be some frame from your canvas or design component. Use vertical '...' sign at the right side to attach the desired component to it. The same way you can pass another state of the component like `active` or `hover` if you need one. 

> It's recommended to use `design components` for the states to maintain the same children order and hierarchy which is crucial for the component to work properly.

But while keeping the structure intact between the states you are free to make any adjustments to your state's children: change position, rotation, opacity, color, etc.. All those changes should be reflected in state change during the user interaction.

### Passing options

There are several ways of populate items inside the grid component. 
Briefly `numbers generator`, `options` or `JSON` .

By default, the component uses `numbers generator` to populate items. It's useful if you want to render the fixed number of elements, eg. images grid. You can override this behavior passing the `options` item. It accepts an array of strings to populate items. It's useful if you want a simple list eg. ToDo, where each item has only one text element you want to override. If you'd like to render complex items with several texts and other properties to override use `JSON` instead.

> If you pass both `options` and `JSON` the `JSON` will have the priority.

### Using text templates

To render the text from your `options` or `JSON` inside your design component you should use a special template sign `$` in a text. While using `JSON` it's also required to name your texts accordingly. 

For example, if we're making the tracklist for some music band (eg. Pantera), we probably would have the `name`, `album` in our `JSON` data. So to render that data in our design component we should use the following design component structure:

```json
"default": [
  {
    "text": {"name": "Walk", "album": "Vulgar Display of Power"},
  },
]
```
![design_component](https://github.com/akosarch/stateful-grid/blob/master/readme_images/design_component.png?raw=true)  

As you may noticed we named our text `$name` and `$album` so the component knows where to render the appropriate data from `JSON`. 

### Passing other props

You can pass other properties unlike text. To display the album cover, for example, I used the [Remote Image component](https://store.framer.com/package/ehmorris/remote-image-images-via-url)  which accepts a url property to display an image. So to pass the url I simply added `url` prop to my `JSON` scheme.

```json
"default": [
  {
    "text": {"name": "Walk", "album": "Vulgar Display of Power"},
    "url": "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/PanteraVulgarDisplayofPower.jpg/220px-PanteraVulgarDisplayofPower.jpg"
	},
]
```

The component checks if a `url` prop in the child component exists and isn't `null`. Then it will pass the link I provided via the `JSON`.  

**Here is another example:**

To create the tab bar with icons I used another great store component, [Icon Generator](https://store.framer.com/package/benjamin/icon-generator). It accepts the `icon` prop — a string with icon's name. Also I wanted the background and text color on each tab to be different when active. So my `JSON` schema for one tab is the following:

```json
"default": [
 	{
    "text": {"tab": "Activity"}, 
    "icon": "activity",
    "background": "#EAB00E",
    "textColor": "#CCC"
  }, 
],
"active": [
	{
    "text": {"tab": "Activity"},
    "icon": "activity",
    "background": "#EAB00E",
    "color": "#EAB00E",
    "textColor": "#EAB00E"
  },
]
```

![tab_bar](https://github.com/akosarch/stateful-grid/blob/master/readme_images/tab_bar.png?raw=true)    

![tab_bar_live](https://github.com/akosarch/stateful-grid/blob/master/readme_images/tab_bar_live?raw=true) 
As you can see here I also pass data for the `active` state, so the component knows how the item should look after the state change.



## API overview

Here is a basic component API.

| Prop name         | Value type                                                   | Description                                                  |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `isMultiselect`   | `Boolean`                                                    | Defines whether couple of items could be selected simultaneously (consider the checkboxes vs radio buttons) |
| `itemsNumber`     | `Number`                                                     | If options or JSON aren't passed component will generate the fixed number of items. Use case - images grid |
| `initialOptions`  | `String[]`                                                   | Use to only pass the *initial properties* to the component. Will cause the component's reset. To change options dynamicaly use `updatedOptions` instead |
| `json`            | `JSON`                                                       | Accepts JSON object with props and texts in a format of `{"default": [...], "active": [...], "hover": [...]}` where "active" and "hover" are optional. See the *How to use section* for an example |
| `jsonPath`        | `String`                                                     | Accepts a URL to fetch a JSON object in a format described above. Make sure you're passing a valid JSON (keys and values should be wrapped in quotes) or it will throw an error |
| `activeIds`       | `Number[]`                                                   | Use to only pass the *initial properties* to the component. Will cause the component's reset. To change the active items dynamically use `activeItems` instead |
| `onMount`         | `function(active, options)`                                  | This callback provides you with the `options` and `active` items when component 'mounts'. It means not the actual component lifecycle 'mount', but rather the state when the first options and active items are obtained and rendered. This is a good way of grabbing the options to modify them later |
| `onActiveChange`  | `function(active)`                                           | This callback provides you with the `active` items when they change. For example when a user taps on some item |
| `onHoverChange`   | `function(hover)`                                            | This callback provides you with the `hover` item when it changes. For example when a user hovers over some item |
| `itemTapped`      | `function(lastTapped`)                                       | This callback provides you with the `lastTapped` item when it changes. For example when a user hovers over some item |
| `onResize`        | `function(width, height)`                                    | This callback provides you with the actual `width` and `height` of the content when it changes. Eg when you add or remove the item |
| `updatedOptions`  | `null | Object[]`                                            | Each item is an object with `key` and `data` keys on the top level. You can modify the options array obtained from the `onMount` callback and push it back to the component via the `updatedOptions` prop. If you want to push new item in an array make sure it has a unique `key`. If `null` is passed component will opt-out from updated options render |
| `activeItems`     | `Object[]`                                                   | You can dynamicaly pass the selected items. The items you pass should be valid objects with the `key` and `data` props. The best way is to modify the items array you obtained from the `onMount` callback |
| `ignoreEvents`    | `{tap:boolean, hover:boolean, stateChange:boolean}`          | You can explicitly block some events when needed. Just pass an `ignoreEvents` object with desired keys. Eg if you want to prevent a user from tapping just pass the `ignoreEvents: {tap: true}` and ignore the rest keys |
| `animateChildren` | `{variants:{}, initial:{}, animate:{}, transition:{}, positionTransition:{}}` | Use this property to pass the animation options to the children inside the component |
| `direction`       | `'horizontal' |'vertical'`                                   | This property defines the direction of the items in the layout. Similar to [flex-direction](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction) CSS property |
| `wrap`            | `boolean`                                                    | Use this property to allow line wrap if you want to make an items grid [flex-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap) |



## Override examples