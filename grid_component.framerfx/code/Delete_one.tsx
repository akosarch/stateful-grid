import { Data, animate, Override, Animatable, Draggable } from "framer"
import { useState, useEffect } from "react"
import { createStore } from "./Store"

const useStore = createStore({
    active: [],
    itemToDelete: [],
    options: [],
    updatedOptions: null,
    inputValue: "",
    preventStateChange: false,
    itemTapped: null,
    pageScroll: 0,
})

const textHeight = 48
const topOffset = 156

const data: any = Data({
    active: [],
    itemToDelete: [],
    options: [],
    updatedOptions: null,
    inputValue: "",
    preventStateChange: false,
    itemTapped: null,
    pageScroll: 0,
})

export const UpdateLabel: Override = () => {
    const [store, setStore] = useStore()
    const [text, setText] = useState()
    const [textOffset, setTextOffset] = useState(topOffset)

    useEffect(() => {
        const active = store.active
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
    }, [store.active])
    return {
        text: text,
        top: textOffset,
    }
}

export const HideOnEmpty: Override = props => {
    const [store, setStore] = useStore()
    const options = store.updatedOptions || store.options
    const opacity = +(options.length > 0)
    return {
        opacity: opacity,
    }
}

export const HandleItemChange: Override = props => {
    const [store, setStore] = useStore()
    return {
        onMount(options, active) {
            setStore({
                options: options,
                active: active,
            })
            // data.options = options
            // data.active = active
        },
        onActiveChange(active) {
            setStore({
                active: active,
            })
            // data.active = active
        },
        itemTapped(item) {
            setStore({
                itemTapped: item,
            })
            // data.itemTapped = item
        },
        animatePresence: {
            initial: { height: 0, opacity: 0 },
            animate: { height: 48, opacity: 1 },
            exit: { height: 0, opacity: 0 },
        },
        updatedOptions: store.updatedOptions,
        ignoreEvents: { stateChange: store.preventStateChange },
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

export const PreventTapWhileScroll: Override = props => {
    return {
        onPanStart() {
            data.preventStateChange = true
        },
        onPanEnd() {
            data.preventStateChange = false
        },
    }
}

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
