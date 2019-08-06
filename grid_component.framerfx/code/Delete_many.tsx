import { Data, animate, Override, Animatable } from "framer"
import { useRef, useEffect } from "react"

const data: any = Data({
    active: [],
    options: [],
    updatedOptions: null,
    editMode: false,
    resetSelected: false,
    height: null,
})

export const HandleItemChange: Override = props => {
    return {
        onMount(options, active) {
            data.active = active
            data.options = options
        },
        onActiveChange(active) {
            data.resetSelected = false
            data.active = active
        },
        onResize(width, height) {
            data.height = height
        },
        updatedOptions: data.updatedOptions,
        ignoreEvents: { tap: !data.editMode, hover: false },
        resetSelected: data.resetSelected,
    }
}

export const UpdateScrollHeight: Override = props => {
    return {
        contentHeight: data.height && data.height,
    }
}

export const HandleTextChange: Override = props => {
    return {
        text:
            data.active.length > 0
                ? data.active.length + " selected"
                : "Gallery",
    }
}

export const HideOnEmpty: Override = props => {
    const options = data.updatedOptions || data.options
    const opacity = +(options.length > 0)
    return {
        opacity: opacity,
    }
}

export const ToggleEditMode: Override = props => {
    return {
        onClick: () => {
            data.editMode = !data.editMode
            data.active = []
            data.resetSelected = true
        },
    }
}

export const ShowEditButton: Override = () => {
    return {
        visible: !data.editMode,
    }
}

export const ShowBottomButtons: Override = props => {
    const variants = {
        visible: {
            bottom: 0,
        },
        hidden: {
            bottom: -64,
        },
    }

    return {
        variants: variants,
        animate: data.editMode ? "visible" : "hidden",
        initial: "hidden",
    }
}

export const ShowOverlay: Override = () => {
    return {
        visible: data.editMode,
    }
}

export const DeleteItems: Override = () => {
    return {
        onClick: () => {
            const selectedItems = data.active
            const options = data.updatedOptions
                ? data.updatedOptions
                : data.options
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

            data.updatedOptions = filteredOptions
            data.active = []
        },
    }
}
