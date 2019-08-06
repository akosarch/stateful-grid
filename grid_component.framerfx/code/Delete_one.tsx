import { Data, animate, Override, Animatable, Draggable } from "framer"
import { useState, useEffect } from "react"

const textHeight = 48
const topOffset = 156

const data: any = Data({
    active: [],
    itemToDelete: [],
    options: [],
    updatedOptions: null,
    inputValue: "",
    stateChange: false,
    itemTapped: null,
})

export const UpdateLabel: Override = () => {
    const [text, setText] = useState()
    const [textOffset, setTextOffset] = useState(topOffset)

    useEffect(() => {
        const active = data.active
        if (active) {
            let linebreak = active.length > 1 ? ",\n" : ""
            let text = active.reduce(
                (all, current) => all + current.data + linebreak,
                ""
            )
            const textOffset = topOffset - textHeight * (active.length - 1)
            setText(text ? text : "Options")
            setTextOffset(active.length > 0 ? textOffset : topOffset)
        }
    }, [data.active])
    return {
        text: text,
        top: textOffset,
    }
}

export const HideOnEmpty: Override = props => {
    const options = data.updatedOptions || data.options
    const opacity = +(options.length > 0)
    return {
        opacity: opacity,
    }
}

export const HandleItemChange: Override = props => {
    return {
        onMount(options, active) {
            data.options = options
            data.active = active
            console.log(options)
        },
        onActiveChange(active) {
            data.active = active
        },
        itemTapped(item) {
            data.itemTapped = item
        },
        animatePresence: {
            initial: { height: 0, opacity: 0 },
            animate: { height: 48, opacity: 1 },
            exit: { height: 0, opacity: 0 },
        },
        updatedOptions: data.updatedOptions,
        ignoreEvents: { stateChange: data.stateChange },
    }
}

export const DeleteItems: Override = () => {
    return {
        onClick: () => {
            const options = data.updatedOptions
                ? [...data.updatedOptions]
                : [...data.options]
            const itemTapped = data.itemTapped
            const filteredOptions = options.filter(
                item => item.key !== itemTapped.key
            )
            const active = data.active.filter(
                item => item.key !== itemTapped.key
            )
            data.active = active
            data.updatedOptions = filteredOptions
        },
    }
}

// export const PreventTapWhileScroll: Override = props => {
//     const [stateChange, setStateChange] = useState(false)
//     useEffect(() => {
//         data.stateChange = stateChange
//     }, [stateChange])
//     return {
//         onScroll(event) {
//             const velocity = Math.round(event["velocity"].x * 10)
//             setStateChange(velocity ? true : false)
//         },
//     }
// }

export const SetTextValue: Override = () => {
    return {
        onValueChange: text => {
            data.inputValue = text
        },
        value: data.inputValue,
    }
}

const getTimeStamp = () => {
    const date = new Date()
    return Math.floor(date.getTime() * Math.random())
}

export const AddItem: Override = () => {
    return {
        onClick: () => {
            const options = data.updatedOptions
                ? [...data.updatedOptions]
                : [...data.options]
            if (data.inputValue !== "") {
                const item = { key: getTimeStamp(), data: data.inputValue }
                options.unshift(item)
                data.updatedOptions = options
                data.inputValue = ""
            }
        },
    }
}
