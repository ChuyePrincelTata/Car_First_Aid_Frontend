import React from "react"
import { View, type ViewProps } from "react-native"

type Props = ViewProps & {
  colors?: readonly string[]
  start?: { x: number; y: number } | null
  end?: { x: number; y: number } | null
}

const LinearGradient: React.FC<Props> = ({ children, style }) => <View style={style}>{children}</View>

export default LinearGradient
