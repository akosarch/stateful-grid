import * as React from "react"
import { useState, useEffect } from "react"

export function createStore<T>(state: T) {
    let storeState: T = Object.assign({}, state)
    const storeSetters = new Set()

    const setStoreState = (state: Partial<T>) => {
        storeState = Object.assign({}, storeState, state)
        storeSetters.forEach(setter => setter(storeState))
    }

    function useStore(): [T, typeof setStoreState] {
        const [state, setState] = useState(storeState)
        useEffect(() => () => storeSetters.delete(setState), [])
        storeSetters.add(setState)
        return [state, setStoreState]
    }

    return useStore
}
