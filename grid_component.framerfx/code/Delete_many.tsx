import {
    animate,
    Override,
    useTransform,
    useAnimation,
    motionValue,
} from "framer"
import { useEffect, useState, useCallback } from "react"
import { createStore } from "./Store"
import { colors } from "./Canvas"

const transition = { type: "spring", stiffness: 300, damping: 20 }
const transition2 = { type: "spring", stiffness: 300, damping: 30 }
const duration = 0.25

const useStore = createStore({
    active: [],
    deletedItems: 0,
    options: [],
    updatedOptions: null,
    editMode: false,
    showToast: false,
    height: null,
    target: null,
})

const scrollY = motionValue(0)

export const HandleItemChange: Override = props => {
    const [store, setStore] = useStore()
    const [images, setImages] = useState(null)
    const variants = {
        initial: { y: 200, opacity: 0 },
        load: (custom: number) => ({
            y: 0,
            opacity: 1,
            transition: { ...transition2, delay: 0.05 * custom },
        }),
        exit: (custom: number) => ({
            opacity: 0,
            scale: 0,
            transition: { ...transition2, delay: 0.05 * custom },
        }),
    }

    const itemsNumber = props.children[0].props.itemsNumber

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

    const onMount = useCallback((options, active) => {
        setStore({
            active: active,
            options: options,
        })
    }, [])
    const onActiveChange = useCallback(active => {
        setStore({
            resetSelected: false,
            active: active,
        })
    }, [])
    const onResize = useCallback((width, height) => {
        setStore({
            height: height,
        })
    }, [])

    return {
        onMount,
        onActiveChange,
        onResize,
        updatedOptions: store.updatedOptions,
        ignoreEvents: { tap: !store.editMode },
        activeItems: store.editMode ? store.active : [],
        animateChildren: {
            variants: variants,
            initial: "initial",
            animate: "load",
            exit: "exit",
        },
        positionTransition: transition2,
        json: images,
    }
}

export const HandleCounterChange: Override = props => {
    const [store, setStore] = useStore()
    const [count, setCount] = useState(0)
    useEffect(() => {
        !store.target && setCount(store.active.length)
    }, [store.active.length])
    return {
        text: count,
    }
}

export const RevealPhotos: Override = props => {
    const variants = { off: { y: 200 }, on: { y: 0 } }
    return {
        initial: "off",
        variants: variants,
    }
}

export const ShowCounter: Override = props => {
    const [store, setStore] = useStore()
    const controls = useAnimation()
    const variants = {
        on: { scale: 1, opacity: 1 },
        off: {
            scale: 0,
            opacity: 0,
            transition: { when: "afterChildren", delay: duration * 0.85 },
        },
    }

    async function animateRemove(target) {
        let targetX, background
        switch (target) {
            case "folder_ico":
                targetX = 0
                background = colors.blue
                break
            case "delete_ico":
                targetX = 123
                background = colors.red
                break
        }
        const targetY = 24
        await controls.start({
            top: -100,
            y: 100 + targetY,
            x: targetX,
            background: background,
            transition: {
                x: { ease: "easeOut" },
                y: { ease: "easeIn" },
                default: { duration: duration },
                background: { duration: 0 },
            },
        })
        await controls.start({
            top: -16,
            y: 0,
            x: 0,
            scale: 0,
            background: colors.blue,
            transition: {
                default: { duration: 0 },
            },
        })
    }

    useEffect(() => {
        store.active.length ? controls.start("on") : controls.start("off")
    }, [store.active])

    useEffect(() => {
        store.target && animateRemove(store.target)
    }, [store.target])

    return {
        initial: "off",
        variants: variants,
        animate: controls,
        transition: transition,
    }
}

export const ShowEmptyPlaceholder: Override = props => {
    const [store, setStore] = useStore()
    const options = store.updatedOptions || store.options
    const isEmpty = !(options.length > 0)
    return {
        initial: { scale: 0, opacity: 0 },
        animate: isEmpty
            ? { scale: 1, opacity: 1, transition: { delay: duration * 2 } }
            : { scale: 0, opacity: 0 },
        transition: transition,
    }
}

export const ToggleEditMode: Override = props => {
    const [store, setStore] = useStore()
    return {
        onClick: () => {
            setStore({
                editMode: !store.editMode,
                active: [],
                resetSelected: store.editMode,
            })
        },
    }
}

export const ShowEditButton: Override = () => {
    const [store, setStore] = useStore()
    return {
        visible: !store.editMode,
    }
}

export const ShowBottomButtons: Override = props => {
    const [store, setStore] = useStore()
    return {
        initial: { y: 80 + 24 },
        animate: store.editMode ? { y: 0 } : { y: 80 + 24 },
        transition: transition,
    }
}

export const ShowToast: Override = props => {
    const [store, setStore] = useStore()
    const controls = useAnimation()
    const variants = {
        on: { y: 80, transition: { ...transition, delay: duration * 0.5 } },
        off: { y: 0 },
    }

    async function showToast() {
        await controls.start("on")
        await controls.start("off")
    }

    function hideToast() {
        controls.start("off")
    }

    useEffect(() => {
        store.showToast ? showToast() : hideToast()
    }, [store.showToast])

    return {
        onAnimationComplete() {
            setStore({ showToast: false })
        },
        variants: variants,
        initial: "off",
        animate: controls,
    }
}

export const UpdataToastData: Override = props => {
    const [store, setStore] = useStore()
    const [target, setTarget] = useState()

    let color, action
    switch (target) {
        case "folder_ico":
            color = colors.blue
            action = "moved"
            break
        case "delete_ico":
            color = colors.red
            action = "deleted"
            break
    }

    useEffect(() => {
        store.target && setTarget(store.target)
    }, [store.target])

    return {
        text:
            '<span style="-webkit-text-fill-color:' +
            color +
            '!important;">' +
            store.deletedItems +
            '</span> items have been <span style="-webkit-text-fill-color:' +
            color +
            '!important;">' +
            action +
            "</span>",
    }
}

export const ShowOverlay: Override = () => {
    const [store, setStore] = useStore()
    return {
        visible: store.editMode,
    }
}

export const DeleteItems: Override = props => {
    const [store, setStore] = useStore()
    const controls = useAnimation()

    const variants = {
        on: { scale: 1.5, transition: { duration: duration } },
        off: { scale: 1 },
    }

    async function animateTrash() {
        await controls.start("on")
        await controls.start("off")
    }
    return {
        onAnimationComplete() {
            store.target && setStore({ showToast: true, target: null })
        },
        onTap() {
            const selectedItems = store.active
            const options = store.updatedOptions
                ? store.updatedOptions
                : store.options
            const filteredOptions = []

            if (options && selectedItems) {
                options.map(item => {
                    const id = selectedItems.findIndex(selected => {
                        return selected.key === item.key
                    })
                    if (id < 0) {
                        filteredOptions.push(item)
                    }
                })
            }
            setStore({
                target: props.name,
                updatedOptions: filteredOptions,
                deletedItems: selectedItems.length,
                active: [],
            })
            selectedItems.length && animateTrash()
        },
        variants: variants,
        animate: controls,
        transition: transition,
    }
}

export const AnimateFilledIcon: Override = props => {
    const [store, setStore] = useStore()
    const variants = {
        on: { opacity: 1, transition: { duration: duration } },
        off: { opacity: 0 },
    }
    return {
        variants: variants,
        transition: transition,
    }
}

//SCROLLING ANIMATIONS

export const UpdateContentHeight: Override = props => {
    const [store, setStore] = useStore()
    return {
        height: store.height + 236,
    }
}

export const HandleScroll: Override = props => {
    const [store, setStore] = useStore()
    return {
        contentOffsetY: scrollY,
        contentHeight: store.height + 236,
    }
}

export const AnimateTextOnScroll: Override = props => {
    const [store, setStore] = useStore()
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
    const [store, setStore] = useStore()
    const y = useTransform(scrollY, [0, -96], [0, 32])
    return {
        y: y,
    }
}

export const FixHeaderOnScroll: Override = () => {
    const [store, setStore] = useStore()
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
