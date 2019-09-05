import {
    Data,
    animate,
    Override,
    motionValue,
    useMotionValue,
    useTransform,
    useAnimation,
} from "framer"
import { useState } from "react"

const data: any = Data({
    inputValue: "",
    height: 0,
    options: [],
    active: [],
    itemTapped: null,
})

const transition = { type: "spring", stiffness: 300, damping: 20 }
const scrollY = motionValue(0)

// COMPONENTS LOGIC
export const HandleItemChange: Override = props => {
    return {
        onMount(options, active) {
            data.options = options
            data.active = active
        },
        onActiveChange(active) {
            data.active = active
        },
        itemTapped(item) {
            data.itemTapped = item
        },
        onResize(width, height) {
            data.height = height
        },
        animateChildren: {
            initial: { height: 0, opacity: 0 },
            animate: { height: 48, opacity: 1 },
            exit: { opacity: 0 },
            initialEnabled: false,
        },
        ignoreEvents: { stateChange: true },
        updatedOptions: strikedText(data.options, data.active),
        activeItems: data.active,
    }
}

// ACTIONS
export const AddItem: Override = () => {
    return {
        onTap() {
            addItem()
        },
    }
}

export const AddActiveItem: Override = () => {
    return {
        onTap() {
            setActive()
        },
    }
}

export const RemoveItem: Override = () => {
    return {
        onTap() {
            removeItem()
        },
    }
}

export const HandleItemOverdrag: Override = props => {
    const threshold = 144
    const [page, setPage] = useState(1)
    return {
        onPanEnd(event, info) {
            info.offset.x < -threshold && removeItem()
            info.offset.x > threshold && setActive()
            // Animate to default position after release
            Math.abs(info.offset.x) > threshold && setPage(1)
        },
        onChangePage(curr) {
            // Setting page explicitly or snapback won't work
            setPage(curr)
        },
        onTap() {
            setPage(1)
        },
        currentPage: page,
    }
}

export const HandleInputChange: Override = () => {
    const deb = debounced(200, text => {
        data.inputValue = text
    })
    return {
        onValueChange: deb,
        value: data.inputValue,
    }
}

export const HandleDoneText: Override = props => {
    return {
        text: `${data.active.length} / ${data.options.length} done`,
    }
}

export const HandleEmptyPlaceholder: Override = props => {
    const variants = {
        on: { opacity: 1 },
        off: { opacity: 0 },
    }
    return {
        variants: variants,
        initial: "off",
        animate: data.options.length ? "off" : "on",
        transition: { ...transition, staggerChildren: 0.05 },
    }
}

export const EmptyPlaceholderChildren: Override = props => {
    const variants = {
        on: { scale: 1 },
        off: { scale: 0 },
    }
    return {
        variants: variants,
        transition: transition,
    }
}

export const UpdateContentHeight: Override = props => {
    return {
        height: data.height + 236,
    }
}

//SCROLL LOGIC
export const HandleScroll: Override = props => {
    return {
        contentOffsetY: scrollY,
        contentHeight: data.height + 236,
    }
}

export const AnimateTitleOnScroll: Override = props => {
    const textWidth = +props.width
    const padding = 24
    const x = useTransform(
        scrollY,
        [0, -96],
        [0, 375 / 2 - textWidth / 2 - padding]
    )
    const y = useTransform(scrollY, [0, -96], [0, 24])
    const scale = useTransform(scrollY, [0, -96], [1, 20 / 32])
    return {
        x: x,
        y: y,
        scale: scale,
    }
}

export const AnimateDoneTextOnScroll: Override = props => {
    const textWidth = +props.width
    const padding = 24
    const x = useTransform(
        scrollY,
        [0, -96],
        [0, 375 / 2 - textWidth / 2 - padding]
    )
    const y = useTransform(scrollY, [0, -96], [0, 16])
    return {
        x: x,
        y: y,
    }
}

export const AnimateIconsOnScroll: Override = () => {
    const y = useTransform(scrollY, [0, -96], [0, 32])
    return {
        y: y,
    }
}

export const FixHeaderOnScroll: Override = () => {
    const shouldFix = useTransform(scrollY, value =>
        value < -236 + 96 ? -value - 236 + 96 : 0
    )
    const color = useTransform(scrollY, value =>
        value < -236 + 96
            ? "rgba(245, 245, 245, 0.9)"
            : "rgba(255, 255, 255, 1)"
    )
    return {
        y: shouldFix,
        background: color,
    }
}

// FUNCTIONS

function getTimeStamp() {
    const date = new Date()
    return Math.floor(date.getTime() * Math.random())
}

function removeItem() {
    const filteredOptions = data.options.filter(
        item => item.key !== data.itemTapped.key
    )
    const activeItems = data.active.filter(
        item => item.key !== data.itemTapped.key
    )
    data.options = filteredOptions
    data.active = activeItems
}

function addItem() {
    if (data.inputValue !== "") {
        const item = { key: getTimeStamp(), data: data.inputValue }
        data.options = [item, ...data.options]
        data.inputValue = ""
    }
}

function setActive() {
    const id = data.active.findIndex(item => item.key == data.itemTapped.key)
    const activeItems =
        id == -1
            ? [...data.active, { ...data.itemTapped }]
            : data.active.filter(item => item.key !== data.itemTapped.key)
    data.active = activeItems
}

function debounced(delay, fn) {
    let timerId
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            fn(...args)
            timerId = null
        }, delay)
    }
}

function strikedText(options, active) {
    return options.map(({ key, data }) => {
        const id = active.findIndex(active => active.key == key)
        return {
            key: key,
            data: id > -1 ? `<s>${data}</s` : data,
        }
    })
}
