/**
 * context/TabBarContext.tsx
 *
 * Provides a shared Animated.Value that screens can drive via their FlatList's
 * onScroll handler to hide/show the bottom tab bar as the user scrolls.
 *
 * Usage in any screen:
 *   const { onScrollHandler, tabBarAnimatedStyle } = useTabBarScroll()
 *   <Animated.FlatList onScroll={onScrollHandler} scrollEventThrottle={16} … />
 *
 * CustomTabBar reads `useTabBarTranslateY()` to apply the transform.
 */
import React, { createContext, useContext, useRef } from "react"
import { Animated } from "react-native"

const TAB_BAR_HIDE_OFFSET = 80 // scroll this many px down before hiding

interface TabBarContextValue {
  translateY: Animated.Value
}

const TabBarContext = createContext<TabBarContextValue>({
  translateY: new Animated.Value(0),
})

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current
  return (
    <TabBarContext.Provider value={{ translateY }}>
      {children}
    </TabBarContext.Provider>
  )
}

/** Call this in any screen that wants to hide the tab bar while scrolling. */
export function useTabBarScroll() {
  const { translateY } = useContext(TabBarContext)

  const onScrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const y: number = event.nativeEvent.contentOffset.y
        Animated.timing(translateY, {
          toValue: y > TAB_BAR_HIDE_OFFSET ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      },
    }
  )

  return { onScrollHandler }
}

/** Read by CustomTabBar to apply the animated transform. */
export function useTabBarTranslateY() {
  return useContext(TabBarContext).translateY
}
