import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
    addPropertyControls,
    ControlType,
    Frame,
    AnimatePresence,
} from "framer"
import useResizeObserver from "use-resize-observer"

// Define type of property

interface Props {
    isMultiselect: boolean
    itemsNumber: number
    direction: string
    wrap: boolean
    margin: number
    marginPerSide: boolean
    initialOptions: string[]
    updatedOptions: { key: number | string; data: object }[]
    json: string
    activeIds: number[]
    animationCurve: string
    animationDuration: number
    defaultState: React.ReactElement
    activeState: React.ReactElement
    hoverState: React.ReactElement
    onMount(active: object[], options?: object[]): void
    onActiveChange(active: any[]): void
    onResize(width: number, height: number): void
    onHoverChange(hover: object[]): void
    itemTapped(item: any)
    ignoreEvents: {
        tap: boolean
        hover: boolean
        drag: boolean
        stateChange: boolean
    }
    resetSelected: boolean
    width: number | string
    height: number | string
    top: number
    left: number
    right: number
    bottom: number
    animatePresence: {
        initial: any
        animate: any
        exit: any
        transition: any
    }
}

export const StatefulGrid: React.FC<Props> = props => {
    const [options, setOptions] = useState([])
    const [active, setActive] = useState([])
    const [hover, setHover] = useState({ key: null, data: null })

    // Generate unique ID based on timestamp

    const getTimeStamp = () => {
        const date = new Date()
        return Math.floor(date.getTime() * Math.random())
    }

    // Get options

    const setInitialOptions = (
        options: any[],
        onMountCallback: (options: any[]) => void
    ) => {
        if (options) {
            let optionsArray = []

            // Check if options is passed by user
            // Else, use plain numbers to populate options

            if (options.length) {
                optionsArray = Array.from(options, (x, i) => {
                    return { key: getTimeStamp(), data: x }
                })
            } else {
                optionsArray = Array.from(Array(props.itemsNumber), (x, i) => {
                    return { key: getTimeStamp(), data: i }
                })
            }
            setOptions(optionsArray)
            onMountCallback(optionsArray)
        }
    }

    const setActiveItem = (key: number | string) => {
        // Define initial variables

        const activeItems = [...active]

        // Toggle selected based on input indexes

        const itemId = options.findIndex(item => item.key === key)
        const item = options[itemId]
        const activeId = activeItems.findIndex(item => item.key === key)

        // Return selected item

        props.itemTapped(item)

        // If type of logic is multiselect

        if (props.isMultiselect) {
            if (activeId < 0) {
                activeItems.push(item) // Select item
            } else {
                activeItems.splice(activeId, 1) // Deselect item
            }
        }

        // If type of logic is singleselect

        if (!props.isMultiselect) {
            activeItems[0] = item // Select item
        }

        // Finaly, set the new state of selected items

        if (!props.ignoreEvents.stateChange) {
            setActive(activeItems)

            // After callback is fired (to use with Overrides)

            props.onActiveChange(activeItems)
        }
    }

    const setActiveByDefault = (activeIds: number[], options: object[]) => {
        const active = []
        for (let i = 0; i < activeIds.length; i++) {
            const index = activeIds[i]
            if (index < options.length) {
                active.push(options[index])
            }
            if (!props.isMultiselect) {
                break
            }
        }
        setActive(active)

        // callback is fired (to use via Overrides)

        props.onMount(options, active)
    }

    const setHoverItem = (key: number | string, condition: true | false) => {
        if (props.hoverState[0]) {
            const itemId = options.findIndex(item => item.key === key)

            const item = condition ? options[itemId] : { key: null, data: null }

            if (hover["key"] !== item.key) {
                setHover(item)
                props.onHoverChange(item)
            }
        }
    }

    const fetchJSON = async (jsonPath: string) => {
        return await fetch(jsonPath).then(response => {
            return response
        })
    }

    // Helper function to check is object is empty

    const objectIsntEmpy = obj => {
        for (let key in obj) {
            return key
        }
    }

    const getJSONOptions = (json: {}) => {
        const optionsArray = []

        if (objectIsntEmpy(json)) {
            for (let key in json) {
                const value = json[key]
                if (value.length > 0) {
                    value.map((val, i) => {
                        const obj = {}
                        obj[key] = val
                        optionsArray[i] = { ...optionsArray[i], ...obj }
                    })
                }
            }
            return optionsArray
        }
    }

    // Fetch and process data from JSON or Options

    useEffect(() => {
        fetchJSON(props.json).then(response => {
            const contentType = response.headers.get("content-type")

            // Check if request returns a JSON
            // Set initial options and selected items

            if (contentType && contentType.includes("application/json")) {
                response.json().then(json => {
                    const JSONOptions = getJSONOptions(json)
                    setInitialOptions(JSONOptions, options => {
                        setActiveByDefault(props.activeIds, options)
                    })
                })
            } else {
                setInitialOptions(props.initialOptions, options => {
                    setActiveByDefault(props.activeIds, options)
                })
            }
        })
    }, [props.initialOptions, props.itemsNumber, props.json])

    // Check if JSON or Options was updated

    useEffect(() => {
        if (props.updatedOptions) {
            // if item was removed => remove it from selected as well
            const activeItems = active.filter((original, i) => {
                const id = props.updatedOptions.findIndex(
                    updated => updated.key === original.key
                )
                return id >= 0
            })
            setActive(activeItems)
            setOptions(props.updatedOptions)
        }
    }, [props.updatedOptions])

    // The function bellow handel the props change to the desired
    // Eg text, colors, icons etc

    const updateProps = (fromState, to, item, transition) => {
        const [toState, toProps] = to
        let props = toState.props
        let newProps = {}
        let newProp = {}
        let newStyle = {
            ...props.style,
            transition: transition,
        }

        // Iterate throught all the props from json
        // If prop exists - assing newProp

        let newChildren = []

        for (let key in toProps) {
            if (props[key]) {
                newProp[key] = toProps[key]
                newProps = { ...newProps, ...newProp }
            }
        }

        // Replace text with the given options

        if (props.rawHTML) {
            let rawHTML = props.rawHTML
            rawHTML = new DOMParser().parseFromString(rawHTML, "text/xml")
            let textNode = rawHTML.getElementsByTagName("span")

            // Assigning new text to the span

            let text = textNode[1].textContent

            // If text is populated through json
            // else use options

            if (toProps.text) {
                for (let key in toProps.text) {
                    if (text === key) {
                        textNode[1].textContent = toProps.text[key]
                    }
                }
            } else {
                textNode[1].textContent = item.data
            }

            // If text color is defined in json - asign it to the wrapper span

            if (toProps.textColor) {
                let style = {}
                let styleString = textNode[0].getAttribute("style")
                let attributes = styleString.split(";")

                attributes.map(attribute => {
                    let entry = attribute.split(":")
                    style[entry.splice(0, 1)[0]] = entry.join(":")
                })

                style["-webkit-text-fill-color"] = toProps.textColor

                styleString = Object["entries"](style).reduce(
                    (styleString, [propName, propValue]) => {
                        return `${styleString}${propName}:${propValue};`
                    },
                    ""
                )

                textNode[0].setAttribute("style", styleString)
            }

            rawHTML = new XMLSerializer().serializeToString(rawHTML)
            newProps = { ...newProps, rawHTML: rawHTML }
        }

        // Assian all the new props newProp to the object props

        props = { ...props, ...newProps, style: newStyle }

        // Iterate through each of the child if there is any

        if (props["children"] && props["children"].length > 0) {
            React.Children.map(props["children"], (toChild, id) => {
                let fromChild = fromState.props["children"][id]

                // Recursively call the function to update props on child elements
                // Assing returned object as a new child

                let newChild = updateProps(
                    fromChild,
                    [toChild, toProps],
                    item,
                    transition
                )

                // Update parent object children array with new children

                newChildren.push(newChild)
            })
        }

        // Return new object with updated props

        return React.cloneElement(fromState, props, newChildren)
    }

    // Render childen with the updated props and desired state and return it

    const renderChildren = (item: any) => {
        const defaultState = props.defaultState[0]
        const activeState = props.activeState[0]
            ? props.activeState[0]
            : defaultState
        const hoverState = props.hoverState[0]
        const resCoord = true

        // Is custom props was passed

        const defaultStateProps = item.data.default ? item.data.default : {}
        const activeStateProps = item.data.selected
            ? item.data.selected
            : defaultStateProps
        const hoverStateProps = item.data.hover
            ? item.data.hover
            : activeStateProps

        const states = {
            default: [defaultState, defaultStateProps],
            active: [activeState, activeStateProps],
            hover: [hoverState, hoverStateProps],
        }

        // Decide which state to return based on the selectedItems

        const activeId = active.findIndex(elem => elem.key == item.key)
        const transition = `all ${props.animationDuration}s ${props.animationCurve}`

        const currState =
            activeId < 0
                ? hover.key === item.key
                    ? "hover"
                    : "default"
                : "active"
        return updateProps(defaultState, states[currState], item, transition)
    }

    // Calculate the width and height of the container

    const width = props.margin
        ? props.marginPerSide
            ? -props.right + -props.left
            : -props.margin * 2
        : "auto"

    const height = props.margin
        ? props.marginPerSide
            ? -props.top + -props.bottom
            : -props.margin * 2
        : "auto"

    // Use resize observer to calculate the exact content size

    const [ref, updatedWidth, updatedHeight] = useResizeObserver({
        defaultWidth: width,
        defaultHeight: height,
    })

    // On content size change pass it to the callback

    useEffect(() => {
        if (updatedWidth >= 0 && updatedHeight >= 0) {
            props.onResize(updatedWidth, updatedHeight)
        }
    }, [updatedWidth, updatedHeight])

    return (
        <Frame
            ref={ref}
            width={width}
            height={height}
            style={
                props.defaultState[0]
                    ? containerCSS(props)
                    : emptyContainer(props)
            }
        >
            <AnimatePresence initial={false}>
                {props.defaultState[0] ? (
                    options.map(option => {
                        const key = option.key
                        const element = renderChildren(option)
                        const itemHeight = element.props.height
                        const itemWidth = element.props.width

                        // Create a Frame for the react component
                        return (
                            <Frame
                                onTap={event =>
                                    !props.ignoreEvents.tap &&
                                    setActiveItem(key)
                                }
                                onMouseEnter={() =>
                                    !props.ignoreEvents.hover &&
                                    setHoverItem(key, true)
                                }
                                onMouseLeave={() =>
                                    !props.ignoreEvents.hover &&
                                    setHoverItem(key, false)
                                }
                                width={itemWidth}
                                height={itemHeight}
                                style={elementCSS(props)}
                                positionTransition={{
                                    duration: props.animationDuration,
                                    curve: props.animationCurve,
                                }}
                                initial={props.animatePresence.initial}
                                animate={props.animatePresence.animate}
                                exit={props.animatePresence.exit}
                                transition={props.animatePresence.transition}
                                key={key}
                            >
                                {element}
                            </Frame>
                        )
                    })
                ) : (
                    <span>Connect a DEFAULT state</span>
                )}
            </AnimatePresence>
        </Frame>
    )
}

const emptyContainer = (props): React.CSSProperties => ({
    padding: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8855FF",
    background: "rgba(136, 85, 255, 0.1)",
    fontSize: 14,
    lineHeight: 1,
    height: "100%",
    width: "100%",
})

const containerCSS = (props): React.CSSProperties => ({
    display: "flex",
    flexDirection: props.direction == "horizontal" ? "row" : "column",
    flexWrap: props.wrap ? "wrap" : "nowrap",
    justifyContent: "start",
    alignContent: "start",
    background: null,
    margin: props.marginPerSide
        ? `${-props.top}px ${-props.right}px ${-props.bottom}px ${-props.left}px`
        : -props.margin,
})

const elementCSS = (props): React.CSSProperties => ({
    flex: "0 0 auto",
    position: "relative",
    margin: props.marginPerSide
        ? `${props.top}px ${props.right}px ${props.bottom}px ${props.left}px`
        : props.margin,
    background: null,
})

// Set default properties

StatefulGrid.defaultProps = {
    onMount: function() {},
    itemTapped: function() {},
    onActiveChange: function() {},
    onHoverChange: function() {},
    onResize: function() {},
    updatedOptions: null,
    initialOptions: null,
    json: null,
    ignoreEvents: {
        tap: false,
        hover: false,
        drag: true,
        stateChange: false,
    },
    width: "100%",
    height: "100%",
    marginPerSide: false,
    margin: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animationCurve: "ease",
    animationDuration: 0.2,
    animatePresence: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { curve: "ease", time: 0.2 },
    },
}

// Items shown in property panel

addPropertyControls(StatefulGrid, {
    isMultiselect: {
        type: ControlType.Boolean,
        title: "Select type",
        enabledTitle: "Multi",
        disabledTitle: "Single",
        defaultValue: false,
    },
    initialOptions: {
        type: ControlType.Array,
        title: "Options",
        propertyControl: { type: ControlType.String },
        defaultValue: [],
    },
    itemsNumber: {
        type: ControlType.Number,
        title: "Items",
        defaultValue: 3,
        hidden(props) {
            return props.initialOptions && props.json
        },
    },
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        defaultValue: "vertical",
        options: ["horizontal", "vertical"],
    },
    wrap: {
        type: ControlType.Boolean,
        title: "Wrap items",
        enabledTitle: "Wrap",
        disabledTitle: "Nowrap",
        defaultValue: false,
    },
    margin: {
        type: ControlType.FusedNumber,
        title: "Margin",
        defaultValue: 0,
        toggleKey: "marginPerSide",
        toggleTitles: ["All", "Sides"],
        valueKeys: ["top", "left", "right", "bottom"],
        valueLabels: ["T", "L", "R", "B"],
        min: 0,
    },
    animationCurve: {
        type: ControlType.String,
        title: "Curve",
        defaultValue: "ease",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Duration",
        step: 0.1,
        min: 0,
        max: 10,
        defaultValue: 0.2,
        displayStepper: true,
    },
    defaultState: {
        type: ControlType.ComponentInstance,
        title: "Default",
    },
    activeState: {
        type: ControlType.ComponentInstance,
        title: "Active",
    },
    hoverState: {
        type: ControlType.ComponentInstance,
        title: "Hover",
    },
    json: {
        type: ControlType.File,
        title: "JSON",
        allowedFileTypes: ["json"],
    },
    activeIds: {
        type: ControlType.Array,
        title: "Active Ids",
        propertyControl: { type: ControlType.Number },
        defaultValue: [],
    },
})
