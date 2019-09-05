import { Data, animate, Override, useTransform, motionValue } from "framer"
import { useState, useEffect } from "react"

const data: any = Data({
    height: 0,
})

const scrollY = motionValue(0)

export const HandleItemChange: Override = props => {
    const [active, setActive] = useState([])
    const [options, setOptions] = useState([])
    const [updated, setUpdated] = useState([])

    useEffect(() => {
        const filtered = options.filter(
            (item, index) =>
                active.findIndex(active => active.key === item.key) < 0
        )
        setUpdated([...active, ...filtered])
    }, [active])

    return {
        onMount(options, active) {
            setOptions(options)
        },
        onActiveChange(active) {
            setActive(active)
        },
        onResize(width, height) {
            data.height = height
        },
        updatedOptions: updated,
    }
}

export const AdjustHeight: Override = props => {
    return {
        height: data.height,
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
    const y = useTransform(scrollY, [0, -96], [0, 16])
    return {
        y: y,
    }
}

export const AnimateImageOnScroll: Override = () => {
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
    const y = useTransform(scrollY, value =>
        value < -236 + 96 ? -value - 236 + 96 : 0
    )
    return {
        y: y,
    }
}
