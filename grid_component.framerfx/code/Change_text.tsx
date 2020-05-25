import { useState, useEffect } from "react"
import { Data, animate, Override, Animatable } from "framer"

const textHeight = 48
const topOffset = 156
const defaultLabels = ["Activities", "Backpack"]

const data: any = Data({
    active: [],
    options: [],
    currPage: 0,
})

export const HandleItemChange: Override = props => {
    return {
        onMount(options, active) {
            const activeItems = [...data.active]
            activeItems.push(active)
            data.active = activeItems
        },
        onActiveChange(active) {
            const activeItems = [...data.active]
            activeItems[data.currPage] = active
            data.active = activeItems
        },
        animateChildren: {
            positionTransition: { duration: 0 },
        },
    }
}

export const UpdateLabel: Override = () => {
    const [text, setText] = useState()
    const [textOffset, setTextOffset] = useState(topOffset)
    useEffect(() => {
        const activeText = data.active[data.currPage]
        if (activeText) {
            let linebreak = activeText.length > 1 ? ",\n" : ""
            let text = activeText.reduce(
                (all, current) => all + current.data + linebreak,
                ""
            )
            const textOffset = topOffset - textHeight * (activeText.length - 1)
            setText(text ? text : defaultLabels[data.currPage])
            setTextOffset(activeText.length > 0 ? textOffset : topOffset)
        }
    }, [data.active, data.currPage])
    return {
        text: text,
        top: textOffset,
    }
}

export const HandleTabChange: Override = () => {
    const [options, setOptions] = useState([])
    const findCurrentPage = (options, active) => {
        if (options.length && active[0]) {
            const selectedId = options.findIndex(
                elem => active[0].key == elem.key
            )
            if (selectedId >= 0) {
                return selectedId
            }
        }
    }
    return {
        onMount(options, active) {
            setOptions(options)
            data.currPage = findCurrentPage(options, active)
        },
        onActiveChange(active) {
            data.currPage = findCurrentPage(options, active)
        },
    }
}

export const ChangePage: Override = () => {
    return {
        currentPage: data.currPage,
    }
}
