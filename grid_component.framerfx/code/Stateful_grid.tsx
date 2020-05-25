import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
    addPropertyControls,
    ControlType,
    Frame,
    AnimatePresence,
} from "framer"
import useResizeObserver from "use-resize-observer"

// COPYRIGHT 2019, ANTON KOSARCHYN, ALL RIGHTS RESERVED
// If YOU'D LIKE TO CONTRIBUTE — WELCOME HERE:
// https://github.com/akosarch/stateful-grid

export function StatefulGrid(props: Props) {
    const [options, setOptions] = useState([])
    const [jsonOptions, setJSONOptions] = useState([])
    const [active, setActive] = useState([])
    const [hover, setHover] = useState()
    // Use resize observer to calculate the exact content size
    const [ref, updatedWidth, updatedHeight] = useResizeObserver()
    //FUNCTIONS
    //---------------------------------------------------------------------

    // Generate unique ID based on the timestamp (used for the objects key)
    function getTimeStamp() {
        const date = new Date()
        return Math.floor(date.getTime() * Math.random())
    }

    function getEasingCurve(item: string, type: "js" | "css") {
        const i = +item
        const jsBezier = props.bezierCurve
            .split(",")
            .map(e => Number.parseFloat(e))
        const cssBezier = `bezier-curve(${props.bezierCurve})`
        const curves = {
            js: ["linear", "easeInOut", "easeIn", "easeOut", jsBezier],
            css: ["linear", "ease", "ease-in", "ease-out", cssBezier],
        }
        return curves[type][i]
    }

    // Toggle selected based on input indexes
    function setActiveItem(key: number | string) {
        if (!props.ignoreEvents.tap) {
            // Get the actual item from given key
            const itemId = options.findIndex(item => item.key === key)
            const item = options[itemId]
            // Check if item already exists in active array
            const activeId = active.findIndex(item => item.key === key)
            const activeItems = props.isMultiselect
                ? activeId < 0
                    ? [...active, item] // Select item
                    : active.filter((item, id) => id !== activeId) // Deselect item
                : [item]

            // Finaly, set the new state of selected items
            !props.ignoreEvents.stateChange && setActive(activeItems)
            // Callback the active items (for overrides)
            !props.ignoreEvents.stateChange && props.onActiveChange(activeItems)
            // Callback recent tapped item (for overrides)
            props.itemTapped(item)
        }
    }

    // Select items at given indexes (props.activeIds)
    function setActiveByDefault(activeIds: number[], options: any[]) {
        if (activeIds.length) {
            // Filter the options with given indexes
            const filteredOptions = options.filter((elem, id) => {
                return activeIds.indexOf(id) > -1
            })
            const active = props.isMultiselect
                ? filteredOptions
                : [filteredOptions[0]]
            // Finaly, set the new state of selected items
            // And callback the active items
            setActive(active)
        }
        props.onMount(options, active)
    }

    // Filter the hovered item
    function setHoverItem(key: number | string, condition: boolean) {
        if (!props.ignoreEvents.hover) {
            // Get the actual item from given key
            const itemId = options.findIndex(item => item.key === key)
            const item = condition ? options[itemId] : null
            // Finaly, set the new state of selected items
            // And callback the active items
            props.hoverState[0] && setHover(item)
            props.onHoverChange(item)
        }
    }

    // Set initial options
    function setInitialOptions(initialOptions: any[] | number) {
        let optionsArray
        // Check if options is passed by user
        // Else, use items number to populate options
        if (initialOptions instanceof Array) {
            optionsArray = Array.from(initialOptions, (x, i) => {
                return { key: getTimeStamp(), data: x }
            })
        } else if (typeof initialOptions === "number") {
            optionsArray = Array.from(Array(initialOptions), (x, i) => {
                return { key: getTimeStamp(), data: i }
            })
        }
        // Finaly, set the initial options
        // And active items set by default
        setOptions(optionsArray)
        setActiveByDefault(props.activeIds, optionsArray)
    }

    // Parse JSON and turn into array with states and props
    function getJSONOptions(json: {
        default: any[]
        active?: any[]
        hover?: any[]
    }) {
        // This should be explicitly set to empty array
        // So the typecheck later wont fail
        let optionsArray = []
        if (Object.keys(json).length) {
            for (let key in json) {
                const value = json[key]
                optionsArray = value.map((val, i) => ({
                    ...optionsArray[i],
                    [key]: val,
                }))
            }
            return optionsArray
        }
    }

    // The function bellow handel the props change to the desired
    // Eg text, colors, icons etc
    function updateProps(fromState, to, item, transition) {
        const [toState, toProps] = to
        let props = toState.props
        let updatedProps = {}
        let updatedChildren = []
        let updatedStyle = {
            ...props.style,
            transition: transition,
        }
        const tmplt = "$"
        // Iterate throught all the props from json
        // If prop exists - assign newProp
        for (let key in toProps) {
            if (props[key]) {
                updatedProps = { ...updatedProps, [key]: toProps[key] }
            }
        }
        // Replace text with the given options
        if (props.rawHTML) {
            let rawHTML = props.rawHTML
            // If text is populated through json
            // else use simple options
            if (Object.keys(toProps).length) {
                for (let key in toProps) {
                    rawHTML = rawHTML.replace(
                        new RegExp(`\\${tmplt}${key}/`, "gi"),
                        toProps[key]
                    )
                }
            } else {
                rawHTML = rawHTML.replace(
                    new RegExp(`\\${tmplt}/`, "gi"),
                    item.data
                )
            }
            // Replace the text color if given
            if (toProps.textColor) {
                rawHTML = rawHTML.replace(
                    new RegExp("-webkit-text-fill-color:.*?;"),
                    `-webkit-text-fill-color:${toProps.textColor};`
                )
            }
            updatedProps = { ...updatedProps, rawHTML: rawHTML }
        }
        // Iterate through each of the child if there is any
        // And recursively call the function to update props on child elements
        // Assing returned object as a new child
        if (props["children"] && props["children"].length > 0) {
            updatedChildren = props["children"].map((toChild, id) =>
                updateProps(
                    fromState.props["children"][id],
                    [toChild, toProps],
                    item,
                    transition
                )
            )
        }
        // Return new object with updated props
        return React.cloneElement(
            fromState,
            { ...props, ...updatedProps, style: updatedStyle },
            updatedChildren
        )
    }

    // Render childen with the updated props and desired state and return it
    function renderChildren(item: any) {
        // Gather the design components for each state
        const defaultState = props.defaultState[0]
        const activeState = props.activeState[0]
            ? props.activeState[0]
            : defaultState
        const hoverState = props.hoverState[0]
        // Is custom props was passed
        const defaultStateProps = item.data.default ? item.data.default : {}
        const activeStateProps = item.data.active
            ? item.data.active
            : defaultStateProps
        const hoverStateProps = item.data.hover
            ? item.data.hover
            : activeStateProps
        // Assemble the state from the design components and props
        const states = {
            default: [defaultState, defaultStateProps],
            active: [activeState, activeStateProps],
            hover: [hoverState, hoverStateProps],
        }
        // Find if the item is active
        const activeId = active.findIndex(active => active.key === item.key)
        const transition = `all ${props.animationDuration}s ${getEasingCurve(
            props.animationCurve,
            "css"
        )}`
        // Find if the item is hovered
        const currState =
            activeId < 0
                ? hover && hover.key === item.key
                    ? "hover"
                    : "default"
                : "active"
        // Finaly update the state of the item
        return updateProps(defaultState, states[currState], item, transition)
    }

    // EFFECTS
    //---------------------------------------------------------------------

    // Parse JSON obtained from props.jsonPath or props.json
    useEffect(() => {
        if (props.jsonPath) {
            fetch(props.jsonPath)
                .then(response => response.json())
                .then(json => setJSONOptions(getJSONOptions(json)))
        } else if (props.json) {
            setJSONOptions(getJSONOptions(props.json))
        }
    }, [props.jsonPath, props.json])

    // Set initial values
    useEffect(() => {
        setInitialOptions(
            (jsonOptions.length && jsonOptions) ||
                (props.initialOptions.length && props.initialOptions) ||
                props.itemsNumber
        )
    }, [props.initialOptions, props.itemsNumber, jsonOptions])

    // Check if updated options were passed
    useEffect(() => {
        if (props.updatedOptions) {
            // if item was removed => remove it from selected as well
            const activeItems = active.filter((original, i) => {
                const id = props.updatedOptions.findIndex(
                    updated => updated.key === original.key
                )
                return id >= 0
            })
            // Set updated options and active items
            setActive(activeItems)
            setOptions(props.updatedOptions)
        }
    }, [props.updatedOptions])

    // Set active
    useEffect(() => {
        props.activeItems && setActive(props.activeItems)
    }, [props.activeItems])

    // On content size change pass it to the callback
    useEffect(() => {
        if (updatedWidth >= 0 && updatedHeight >= 0) {
            props.onResize(updatedWidth, updatedHeight)
        }
    }, [updatedWidth, updatedHeight])

    // RENDER
    //---------------------------------------------------------------------

    return (
        <Frame
            ref={ref}
            style={
                props.defaultState[0]
                    ? containerCSS(props)
                    : emptyContainer(props)
            }
        >
            {props.defaultState[0] ? (
                options.map((option, i) => {
                    const key = option.key
                    const element = renderChildren(option)
                    const itemHeight = element.props.height
                    const itemWidth = element.props.width

                    // Create a Frame for the react component
                    return (
                        <Frame
                            onTap={event => setActiveItem(key)}
                            onTapStart={() => props.itemTapped(option)}
                            onHoverStart={() => setHoverItem(key, true)}
                            onHoverEnd={() => setHoverItem(key, false)}
                            width={itemWidth}
                            height={itemHeight}
                            style={elementCSS(props)}
                            variants={props.animateChildren.variants}
                            initial={props.animateChildren.initial}
                            animate={props.animateChildren.animate}
                            exit={props.animateChildren.exit}
                            transition={props.animateChildren.transition}
                            positionTransition={{
                                ease: getEasingCurve(
                                    props.animationCurve,
                                    "js"
                                ),
                                duration: props.animationDuration,
                            }}
                            custom={i}
                            key={key}
                        >
                            {element}
                        </Frame>
                    )
                })
            ) : (
                <span>Connect a DEFAULT state</span>
            )}
        </Frame>
    )
}

// STYLES
//---------------------------------------------------------------------

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
    width: props.margin
        ? props.marginPerSide
            ? -props.right + -props.left
            : -props.margin * 2
        : "auto",
    height: props.margin
        ? props.marginPerSide
            ? -props.top + -props.bottom
            : -props.margin * 2
        : "auto",
})

const elementCSS = (props): React.CSSProperties => ({
    flex: "0 0 auto",
    position: "relative",
    margin: props.marginPerSide
        ? `${props.top}px ${props.right}px ${props.bottom}px ${props.left}px`
        : props.margin,
    background: null,
})

// PROP TYPES
//---------------------------------------------------------------------

interface Props {
    width: number | string
    height: number | string
    isMultiselect: boolean
    itemsNumber: number
    direction: string
    wrap: boolean
    margin: number
    marginPerSide: boolean
    top: number
    left: number
    right: number
    bottom: number
    initialOptions: string[]
    updatedOptions: { key: number | string; data: object }[]
    activeItems: { key: number | string; data: object }[]
    jsonPath: string
    json: { default: any[]; active?: any[]; hover?: any[] }
    activeIds: number[]
    animationCurve: string
    bezierCurve: string
    animationDuration: number
    defaultState: React.ReactElement[]
    activeState: React.ReactElement[]
    hoverState: React.ReactElement[]
    onMount(active: any[], options?: any[]): void
    onActiveChange(active: any[]): void
    onHoverChange(hover: {} | null): void
    onResize(width: number, height: number): void
    itemTapped(item: {})
    ignoreEvents: {
        tap: boolean
        hover: boolean
        stateChange: boolean
    }
    animateChildren: {
        initialEnabled: boolean
        variants: {}
        initial: {} | string
        animate: {} | string
        exit: {} | string
        transition: {}
        positionTransition: {}
    }
}

// DEFAULT PROPERTIES

StatefulGrid.defaultProps = {
    onMount: function() {},
    itemTapped: function() {},
    onActiveChange: function() {},
    onHoverChange: function() {},
    onResize: function() {},
    initialOptions: [],
    activeIds: [],
    marginPerSide: false,
    ignoreEvents: {
        tap: false,
        hover: false,
        stateChange: false,
    },
    animateChildren: {
        initialEnabled: false,
        variants: {},
        initial: {},
        animate: {},
        exit: {},
        transition: {},
        positionTransition: {},
    },
}

// PROPERTY CONTROLS
//---------------------------------------------------------------------

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
        defaultValue: 5,
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
        title: "Gap",
        defaultValue: 0,
        toggleKey: "marginPerSide",
        toggleTitles: ["All", "Sides"],
        valueKeys: ["top", "left", "right", "bottom"],
        valueLabels: ["T", "L", "R", "B"],
        min: 0,
    },
    animationCurve: {
        type: ControlType.Enum,
        defaultValue: "1",
        title: "Curve",
        options: ["0", "1", "2", "3", "4"],
        optionTitles: ["linear", "ease", "easeIn", "easeOut", "bezier"],
    },
    bezierCurve: {
        type: ControlType.String,
        defaultValue: "0.645, 0.045, 0.355, 1",
        title: "Bezier",
        hidden: ({ animationCurve }) => animationCurve !== "4",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Duration",
        step: 0.1,
        min: 0,
        max: 10,
        defaultValue: 0.25,
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
    jsonPath: {
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
