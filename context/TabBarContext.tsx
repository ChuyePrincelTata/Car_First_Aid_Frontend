/**
 * context/TabBarContext.tsx
 *
 * Provides a shared Animated.Value (0=visible, 1=hidden) that the CustomTabBar
 * reads to translate itself off-screen when the user scrolls down, and back into
 * view when they scroll back up.
 *
 * Usage in any list screen:
 *   const { tabBarOnScroll } = useTabBarScroll()
 *
 *   // If you ALSO need the header to collapse, combine with your own scrollY:
 *   const scrollHandler = Animated.event(
 *     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
 *     { useNativeDriver: false, listener: tabBarOnScroll }
 *   )
 */
import React, { createContext, useContext, useRef } from "react"
import { Animated } from "react-native"

interface TabBarCtxValue {
  translateY: Animated.Value
}

const Ctx = createContext<TabBarCtxValue>({
  translateY: new Animated.Value(0),
})

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current
  return <Ctx.Provider value={{ translateY }}>{children}</Ctx.Provider>
}

/** Read by CustomTabBar to animate the bar on/off screen. */
export function useTabBarTranslateY() {
  return useContext(Ctx).translateY
}

/**
 * Returns `tabBarOnScroll` — a plain JS function suitable for use as the
 * `listener` prop of Animated.event or as a direct onScroll handler.
 *
 * Hides the bar when scrolling DOWN past 10px, shows it when scrolling UP.
 */
export function useTabBarScroll() {
  const { translateY } = useContext(Ctx)
  const lastY = useRef(0)

  // Stable function reference via useRef so it won't change on re-renders
  const tabBarOnScroll = useRef((event: any) => {
    const y: number = event.nativeEvent.contentOffset.y
    const delta = y - lastY.current
    lastY.current = y

    // Always show when near the top
    if (y < 10) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start()
      return
    }

    // Scrolling down → hide
    if (delta > 4) {
      Animated.timing(translateY, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start()
    }
    // Scrolling up → show
    else if (delta < -4) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start()
    }
  }).current

  return { tabBarOnScroll }
}
