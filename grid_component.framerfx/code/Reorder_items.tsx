import { Data, animate, Override, useTransform, motionValue } from "framer"
import { useState, useEffect, useCallback } from "react"
import { createStore } from "./Store"

const useStore = createStore({
    active: [],
    options: [],
    updatedOptions: null,
    sortedIds: [],
    height: null,
})

const scrollY = motionValue(0)

export const HandleItemChange: Override = props => {
    const [store, setStore] = useStore()
    const [active, setActive] = useState([])
    const [options, setOptions] = useState([])
    const [updatedOptions, setUpdatedOptions] = useState(null)

    const onMount = useCallback((options, active) => {
        setOptions(options)
    }, [])

    const onActiveChange = useCallback(active => {
        setActive(active)
    }, [])
    const onResize = useCallback((width, height) => {
        setStore({ height: height })
    }, [])

    useEffect(() => {
        const items = [...options]
        const selectedItems = [...active]
        if (selectedItems.length) {
            selectedItems.map((item, index) => {
                const id = items.findIndex(elem => elem.key === item.key)
                items.splice(index, 0, items.splice(id, 1)[0])
            })
        }
        setUpdatedOptions(items)
    }, [active])

    return {
        onMount,
        onActiveChange,
        onResize,
        updatedOptions: updatedOptions,
    }
}

export const AdjustHeight: Override = props => {
    const [store, setStore] = useStore()
    return {
        height: store.height,
    }
}

export const HandleScroll: Override = props => {
    const [store, setStore] = useStore()
    return {
        // onScroll(info) {
        //     setStore({
        //         pageScroll: info["point"].y,
        //     })
        // },
        contentOffsetY: scrollY,
        contentHeight: store.height + 236,
    }
}

export const AnimateTextOnScroll: Override = props => {
    const [store, setStore] = useStore()
    const textWidth = +props.width
    const padding = 80
    const x = useTransform(
        scrollY,
        [0, -96],
        [0, 375 / 2 - textWidth / 2 - padding]
    )
    const y = useTransform(scrollY, [0, -96], [0, 16])
    const scale = useTransform(scrollY, [0, -96], [1, 20 / 32])
    return {
        x: x,
        y: y,
        scale: scale,
    }
}

export const AnimateIconsOnScroll: Override = () => {
    const [store, setStore] = useStore()
    const y = useTransform(scrollY, [0, -96], [0, 16])
    return {
        y: y,
    }
}

export const AnimateImageOnScroll: Override = () => {
    const [store, setStore] = useStore()
    const opacity = useTransform(scrollY, [0, -96], [1, 0])
    const scale = useTransform(scrollY, [-96, 0, 96], [1, 1, 1.45], {
        clamp: false,
    })
    return {
        opacity: opacity,
        scale: scale,
        originY: 1,
    }
}

export const FixHeaderOnScroll: Override = () => {
    const [store, setStore] = useStore()
    const y = useTransform(scrollY, value =>
        value < -236 + 96 ? -value - 236 + 96 : 0
    )
    return {
        y: y,
    }
}
