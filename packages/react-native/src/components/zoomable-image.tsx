import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from './button.tsx';
import { Text } from './text.tsx';
import { clampZoom, imagePanBounds, imageDimensions } from '../media.ts';

export interface ZoomableImageProps {
  uri: string;
  accessibilityLabel: string;
  onTap?: () => void;
  onDismiss?: () => void;
  maximumScale?: number;
  labels: { zoomIn: string; zoomOut: string; reset: string; error?: string };
  renderImage?: (
    onLoad: (width: number, height: number) => void,
    onError: () => void,
  ) => React.ReactNode;
}
export function ZoomableImage({
  uri,
  accessibilityLabel,
  onTap,
  onDismiss,
  maximumScale = 5,
  labels,
  renderImage,
}: ZoomableImageProps) {
  const width = useSharedValue(1),
    height = useSharedValue(1),
    aspect = useSharedValue(1);
  const scale = useSharedValue(1),
    x = useSharedValue(0),
    y = useSharedValue(0);
  const startScale = useSharedValue(1),
    startX = useSharedValue(0),
    startY = useSharedValue(0);
  const pinched = useSharedValue(false),
    focalX = useSharedValue(0),
    focalY = useSharedValue(0);
  const [shown, setShown] = React.useState(1),
    [failed, setFailed] = React.useState(false);
  const maximum = Number.isFinite(maximumScale) ? Math.max(1, maximumScale) : 5;
  const reset = React.useCallback(() => {
    scale.value = 1;
    x.value = 0;
    y.value = 0;
    setShown(1);
  }, [scale, x, y]);
  React.useEffect(() => {
    reset();
    setFailed(false);
  }, [uri, reset]);
  const settle = () => {
    'worklet';
    const next = clampZoom(scale.value, maximum),
      bounds = imagePanBounds(width.value, height.value, aspect.value, next);
    scale.value = withTiming(next);
    x.value = withTiming(Math.max(-bounds.x, Math.min(bounds.x, x.value)));
    y.value = withTiming(Math.max(-bounds.y, Math.min(bounds.y, y.value)));
    runOnJS(setShown)(next);
  };
  const pinch = Gesture.Pinch()
    .onStart((event) => {
      pinched.value = true;
      startScale.value = scale.value;
      startX.value = x.value;
      startY.value = y.value;
      focalX.value = event.focalX - width.value / 2;
      focalY.value = event.focalY - height.value / 2;
    })
    .onUpdate((event) => {
      if (event.numberOfPointers < 2) return;
      const next = Math.max(0.75, Math.min(maximum * 1.25, startScale.value * event.scale));
      const ratio = next / startScale.value;
      x.value = event.focalX - width.value / 2 - (focalX.value - startX.value) * ratio;
      y.value = event.focalY - height.value / 2 - (focalY.value - startY.value) * ratio;
      scale.value = next;
    })
    .onEnd(settle);
  const pan = Gesture.Pan()
    .maxPointers(1)
    .onBegin(() => {
      pinched.value = false;
    })
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      if (pinched.value) return;
      const limits = imagePanBounds(width.value, height.value, aspect.value, scale.value);
      x.value = Math.max(-limits.x, Math.min(limits.x, startX.value + event.translationX));
      y.value =
        scale.value <= 1.01 && onDismiss
          ? Math.max(0, event.translationY)
          : Math.max(-limits.y, Math.min(limits.y, startY.value + event.translationY));
    })
    .onEnd((event) => {
      if (
        scale.value <= 1.01 &&
        onDismiss &&
        (event.translationY > 120 || event.velocityY > 900)
      ) {
        runOnJS(onDismiss)();
        return;
      }
      settle();
    });
  const zoom = (next: number) => {
    scale.value = clampZoom(next, maximum);
    settle();
  };
  const double = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      const next = scale.value > 1.01 ? 1 : Math.min(2.5, maximum);
      const ratio = next / scale.value;
      x.value = (event.x - width.value / 2) * (1 - ratio) + x.value * ratio;
      y.value = (event.y - height.value / 2) * (1 - ratio) + y.value * ratio;
      scale.value = next;
      settle();
    });
  const single = Gesture.Tap()
    .requireExternalGestureToFail(double)
    .runOnJS(true)
    .onEnd(() => onTap?.());
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));
  const imageLoaded = (w: number, h: number) => {
    if (w > 0 && h > 0) aspect.value = w / h;
  };
  return (
    <View style={{ flex: 1, minHeight: 180, gap: 8 }}>
      <GestureDetector
        gesture={Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(double, single))}
      >
        <View
          onLayout={(event) => {
            width.value = Math.max(1, event.nativeEvent.layout.width);
            height.value = Math.max(1, event.nativeEvent.layout.height);
          }}
          style={{ flex: 1, minHeight: 140, overflow: 'hidden', borderRadius: 16 }}
        >
          <Animated.View style={[StyleSheet.absoluteFill, motion]}>
            {renderImage ? (
              renderImage(imageLoaded, () => setFailed(true))
            ) : (
              <Image
                source={{ uri }}
                resizeMode="contain"
                accessibilityLabel={accessibilityLabel}
                style={StyleSheet.absoluteFill}
                onLoad={(event) => {
                  const size = imageDimensions(event);
                  if (size) imageLoaded(size.width, size.height);
                }}
                onError={() => setFailed(true)}
              />
            )}
          </Animated.View>
          {failed && labels.error ? <Text>{labels.error}</Text> : null}
        </View>
      </GestureDetector>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button
          size="s"
          variant="tonal"
          label={labels.zoomOut}
          accessibilityLabel={labels.zoomOut}
          disabled={shown <= 1}
          onPress={() => zoom(scale.value / 1.5)}
        />
        <Button
          size="s"
          variant="tonal"
          label={labels.zoomIn}
          disabled={shown >= maximum}
          onPress={() => zoom(scale.value * 1.5)}
        />
        <Button size="s" variant="ghost" label={labels.reset} onPress={reset} />
      </View>
    </View>
  );
}
