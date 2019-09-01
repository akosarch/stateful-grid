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
    console.log(store.preventStateChange)
    return {
        onMount(options, active) {
            setStore({
                options: options,
                active: active,
            })
        },
        onActiveChange(active) {
            setStore({
                active: active,
            })
        },
        itemTapped(item) {
            setStore({
                itemTapped: item,
            })
        },
        animateChildren: {
            initial: { height: 0, opacity: 0 },
            animate: { height: 48, opacity: 1 },
            exit: { height: 0, opacity: 0 },
        },
        updatedOptions: store.updatedOptions,
        ignoreEvents: { stateChange: store.preventStateChange },
    }
}

export const DeleteItems: Override = () => {
    const [store, setStore] = useStore()
    return {
        onClick: () => {
            const options = store.updatedOptions
                ? store.updatedOptions
                : store.options
            const itemTapped = store.itemTapped
            const filteredOptions = options.filter(
                item => item.key !== itemTapped.key
            )
            const active = store.active.filter(
                item => item.key !== itemTapped.key
            )
            setStore({
                updatedOptions: filteredOptions,
                active: active,
            })
        },
    }
}

export const PreventTapWhileScroll: Override = props => {
    const [store, setStore] = useStore()
    return {
        onPanStart() {
            console.log("start")
            setStore({ preventStateChange: true })
        },
        onPanEnd() {
            console.log("stop")
            setStore({ preventStateChange: false })
        },
    }
}

export const SetTextValue: Override = () => {
    const [store, setStore] = useStore()
    return {
        onValueChange: text => {
            setStore({ inputValue: text })
        },
        value: store.inputValue,
    }
}

const getTimeStamp = () => {
    const date = new Date()
    return Math.floor(date.getTime() * Math.random())
}

export const AddItem: Override = () => {
    const [store, setStore] = useStore()
    return {
        onClick: () => {
            const options = store.updatedOptions
                ? store.updatedOptions
                : store.options
            if (store.inputValue !== "") {
                const item = { key: getTimeStamp(), data: store.inputValue }
                options.unshift(item)
                setStore({
                    updatedOptions: options,
                    inputValue: "",
                })
            }
        },
    }
}
