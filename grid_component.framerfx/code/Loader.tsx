import * as React from "react"
import { Frame, useCycle } from "framer"
import { colors } from "./canvas"

const size = 8
const duration = 0.6

export const Loader: React.FC = props => {
    const variants = {
        initial: { scale: 1 },
        float: custom => ({
            scale: 0.5,
            transition: {
                flip: Infinity,
                ease: "easeInOut",
                duration: duration,
                delay: (custom * duration) / 3,
            },
        }),
    }
    return (
        <Frame style={containerStyle} initial={"initial"} animate={"float"}>
            <Frame variants={variants} custom={0} style={elementStyle} />
            <Frame variants={variants} custom={1} style={elementStyle} />
            <Frame variants={variants} custom={2} style={elementStyle} />
        </Frame>
    )
}

const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: null,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
}

const elementStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    background: "#ccc",
    borderRadius: "50%",
}
