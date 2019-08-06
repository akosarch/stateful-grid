import { Data, animate, Override, Animatable } from "framer"

const data: any = Data({
    active: [],
    options: [],
    updatedOptions: null,
    sortedIds: [],
    height: null,
})

const sortIds = (items: any[], selectedItems: any[]) => {
    items = [...items]
    if (selectedItems[0]) {
        selectedItems.map((item, index) => {
            const id = items.findIndex(elem => elem.key === item.key)
            items.splice(index, 0, items.splice(id, 1)[0])
        })
    }
    return items
}

export const ReorderItems: Override = props => {
    return {
        onMount(options, active) {
            data.options = options
        },

        onActiveChange(active) {
            data.updatedOptions = sortIds(data.options, active)
        },
        onResize(width, height) {
            data.height = height
        },
        updatedOptions: data.updatedOptions,
        ignoreEvents: { hover: false },
    }
}

export const AdjustHeight: Override = props => {
    return {
        contentHeight: data.height,
    }
}
