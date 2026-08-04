import {
  Animated,
  type StyleProp,
  type TextStyle,
} from "react-native";
import {
  useEffect,
  useState,
} from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

type AnimatedCounterProps = {
  animate?: boolean;
  duration?: number;
  formatter?: (value: number) => string;
  prefix?: string;
  style?: StyleProp<TextStyle>;
  suffix?: string;
  value: number;
};

export function AnimatedCounter({
  animate = true,
  duration = 900,
  formatter = (value) => String(Math.round(value)),
  prefix = "",
  style,
  suffix = "",
  value,
}: AnimatedCounterProps) {
  const reducedMotion = useReducedMotion();
  const [animation] = useState(
    () => new Animated.Value(0),
  );
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animation.stopAnimation();

    if (reducedMotion || !animate) {
      return;
    }

    const listenerId = animation.addListener(
      ({ value: nextValue }) => {
        setDisplayValue(nextValue);
      },
    );

    animation.setValue(0);

    const runningAnimation = Animated.timing(animation, {
      duration,
      toValue: value,
      useNativeDriver: false,
    });

    runningAnimation.start();

    return () => {
      runningAnimation.stop();
      animation.removeListener(listenerId);
    };
  }, [
    animate,
    animation,
    duration,
    reducedMotion,
    value,
  ]);

  const visibleValue =
    reducedMotion || !animate ? value : displayValue;

  return (
    <Animated.Text style={style}>
      {prefix}
      {formatter(visibleValue)}
      {suffix}
    </Animated.Text>
  );
}
