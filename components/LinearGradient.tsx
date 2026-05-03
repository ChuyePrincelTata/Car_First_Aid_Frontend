import React from "react"
import {
  LinearGradient as ExpoLinearGradient,
  type LinearGradientProps,
} from "expo-linear-gradient"

type Props = Omit<LinearGradientProps, "colors" | "start" | "end"> & {
  colors?: LinearGradientProps["colors"]
  start?: { x: number; y: number } | null
  end?: { x: number; y: number } | null
}

const LinearGradient: React.FC<Props> = ({
  colors = ["transparent", "transparent"],
  start,
  end,
  children,
  ...props
}) => (
  <ExpoLinearGradient
    colors={colors}
    start={start ?? undefined}
    end={end ?? undefined}
    {...props}
  >
    {children}
  </ExpoLinearGradient>
)

export default LinearGradient
