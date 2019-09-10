import {
    animate,
    Override,
    useTransform,
    useAnimation,
    motionValue,
    Data,
} from "framer"
import * as React from "react"
import { useEffect, useState } from "react"
import { colors } from "./Canvas"

const transition = { type: "spring", stiffness: 300, damping: 20 }
const transition2 = { type: "spring", stiffness: 300, damping: 30 }
const duration = 0.25
const delay = duration * 1.5

const data: any = Data({
    options: [],
    active: [],
    deletedItems: 0,
    editMode: false,
    showToast: false,
    height: 0,
    target: null,
})

const scrollY = motionValue(0)

// LOGIC

export const HandleItemChange: Override = props => {
    const [images, setImages] = useState(null)
    const itemsNumber = props.children[0].props.itemsNumber
    const variants = {
        initial: { y: 200, opacity: 0 },
        load: (custom: number) => ({
            y: 0,
            opacity: 1,
            transition: { ...transition2, delay: 0.05 * custom },
        }),
    }
    useEffect(() => {
        const imagesJSON = JSON.stringify({
            default: Array.from({ length: itemsNumber }, (i, j) => {
                return {
                    url: `https://source.unsplash.com/random/196x196?sig=${j}`,
                }
            }),
        })
        setImages(JSON.parse(imagesJSON))
    }, [])
    return {
        onMount(options, active) {
            data.options = options
            data.active = active
        },
        onActiveChange(active) {
            data.active = active
        },
        onResize(width, height) {
            data.height = height
        },
        updatedOptions: data.options,
        ignoreEvents: { stateChange: !data.editMode },
        activeItems: data.editMode ? data.active : [],
        animateChildren: {
            variants: variants,
            initial: "initial",
            animate: "load",
            positionTransition: transition2,
        },
        json: images,
    }
}

export const DeleteItems: Override = props => {
    const controls = useAnimation()
    const variants = {
        on: { scale: 1.5, transition: { duration: duration } },
        off: { scale: 1 },
    }
    async function animateTrash() {
        await controls.start("on")
        await controls.start("off")
    }
    let target = {}
    switch (props.name) {
        case "folder_ico":
            target = { action: "moved", targetX: 0, color: colors.blue }
            break
        case "delete_ico":
            target = { action: "deleted", targetX: 123, color: colors.red }
            break
    }
    return {
        onTap() {
            removeItems()
            animateTrash()
            data.target = target
        },
        variants: variants,
        animate: controls,
        transition: transition,
    }
}

export const AnimateFilledIcon: Override = props => {
    const variants = {
        on: { opacity: 1, transition: { duration: duration } },
        off: { opacity: 0 },
    }
    return {
        variants: variants,
        transition: transition,
    }
}

// INTERFACE UPDATES ON DATA CHANGE

export const HandleCounterChange: Override = props => {
    return {
        text: data.active.length,
    }
}

export const AnimateCounter: Override = props => {
    const controls = useAnimation()
    const variants = {
        on: { scale: 1, opacity: 1 },
        off: {
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
            background: colors.blue,
        },
        remove: ({ targetX, color }) => ({
            x: targetX,
            y: [0, -40, 24],
            background: color,
            scale: [1, 1, 0.6],
            transition: {
                x: { ease: "linear", duration: duration },
                default: {
                    ease: ["easeOut", "easeIn", "easeOut"],
                    duration: duration,
                },
                background: { duration: 0 },
            },
        }),
    }
    useEffect(() => {
        data.active.length ? controls.start("on") : controls.start("off")
    }, [data.active])

    useEffect(() => {
        data.target && controls.start("remove")
    }, [data.target])

    return {
        onAnimationComplete() {
            data.target && controls.set("off")
        },
        initial: "off",
        variants: variants,
        animate: controls,
        transition: transition,
        custom: data.target,
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

export const ShowToast: Override = props => {
    const controls = useAnimation()
    const variants = {
        show: { y: 80, transition: { ...transition, delay: duration * 0.5 } },
        hide: { y: 0 },
    }
    async function showToast() {
        await controls.start("show")
        await controls.start("hide")
    }
    function hideToast() {
        controls.start("hide")
    }
    useEffect(() => {
        data.showToast ? showToast() : hideToast()
    }, [data.showToast])
    return {
        onAnimationComplete() {
            data.showToast = false
        },
        variants: variants,
        initial: "hide",
        animate: controls,
    }
}

export const UpdataToastData: Override = props => {
    const [target, setTarget] = useState({
        action: null,
        color: null,
        targetX: null,
    })
    useEffect(() => {
        data.target && setTarget(data.target)
    }, [data.target])

    return {
        text:
            '<span style="-webkit-text-fill-color:' +
            target.color +
            '!important;">' +
            data.deletedItems +
            '</span> items have been <span style="-webkit-text-fill-color:' +
            target.color +
            '!important;">' +
            target.action +
            "</span>",
    }
}

// SETUP

export const RevealPhotos: Override = props => {
    const variants = { off: { y: 200 }, on: { y: 0 } }
    return {
        initial: "off",
        variants: variants,
    }
}

export const ToggleEditMode: Override = props => {
    return {
        onTap() {
            data.editMode = !data.editMode
            data.active = []
        },
    }
}

export const ShowEditButton: Override = () => {
    return {
        visible: !data.editMode,
    }
}

export const ShowBottomButtons: Override = props => {
    return {
        initial: { y: 80 + 24 },
        animate: data.editMode ? { y: 0 } : { y: 80 + 24 },
        transition: transition,
    }
}

export const ShowOverlay: Override = () => {
    return {
        visible: data.editMode,
    }
}

// //SCROLLING ANIMATIONS

export const UpdateContentHeight: Override = props => {
    return {
        height: data.height + 236,
    }
}

export const HandleScroll: Override = props => {
    return {
        contentOffsetY: scrollY,
        contentHeight: data.height + 236,
    }
}

export const AnimateTextOnScroll: Override = props => {
    const textWidth = +props.width
    const padding = 24
    const x = useTransform(
        scrollY,
        [0, -96],
        [0, 375 / 2 - textWidth / 2 - padding]
    )
    const y = useTransform(scrollY, [0, -96], [0, 32])
    const scale = useTransform(scrollY, [0, -96], [1, 20 / 32])
    return {
        x: x,
        y: y,
        scale: scale,
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

export const PreloaderContainer: Override = props => {
    const [children, setChildren] = useState([])
    const duration = 0.6
    const variants = {
        off: { scale: 1 },
        on: (custom: number) => ({
            scale: 0.25,
            transition: {
                flip: Infinity,
                ease: "easeInOut",
                duration: duration,
                delay: (custom * duration) / 3,
            },
        }),
    }
    useEffect(() => {
        const children: any = props.children
        setChildren(
            children.map((child, i) =>
                React.cloneElement(child, {
                    variants: variants,
                    initial: "off",
                    animate: "on",
                    custom: i,
                })
            )
        )
    }, [])
    return {
        children: children,
    }
}

// FUNCTIONS
function removeItems() {
    const filteredOptions = data.options.filter(
        item => data.active.findIndex(active => active.key === item.key) < 0
    )
    const timeout = setTimeout(() => {
        data.deletedItems = data.active.length
        data.showToast = true
        data.target = null
        data.options = filteredOptions
        data.active = []

        clearTimeout(timeout)
    }, delay * 1000)
}
