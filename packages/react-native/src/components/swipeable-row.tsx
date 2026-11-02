import * as React from 'react';
import { Platform, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Button } from './button.tsx';

export interface SwipeAction {
  id: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}
export interface SwipeableRowProps {
  children: React.ReactNode;
  accessibilityLabel: string;
  actionsLabel: string;
  startActions?: SwipeAction[];
  endActions?: SwipeAction[];
  disabled?: boolean;
  showActionsButton?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}
export function SwipeableRow({
  children,
  accessibilityLabel,
  actionsLabel,
  startActions = [],
  endActions = [],
  disabled,
  showActionsButton = true,
  onSwipeStart,
  onSwipeEnd,
}: SwipeableRowProps) {
  const ref = React.useRef<SwipeableMethods>(null);
  const [open, setOpen] = React.useState(false);
  const actions = [...startActions, ...endActions];
  const run = (action: SwipeAction) => {
    if (disabled || action.disabled) return;
    ref.current?.close();
    setOpen(false);
    action.onPress();
  };
  const rows = (items: SwipeAction[]) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 }}>
      {items.map((action) => (
        <Button
          key={action.id}
          label={action.label}
          size="s"
          variant={action.destructive ? 'destructive' : 'tonal'}
          disabled={disabled || action.disabled}
          onPress={() => run(action)}
        />
      ))}
    </View>
  );
  const content = (
    <View>
      {children}
      {showActionsButton ? (
        <Button
          label={actionsLabel}
          variant="ghost"
          size="s"
          disabled={disabled || !actions.length}
          onPress={() => setOpen((value) => !value)}
        />
      ) : null}
      {open ? rows(actions) : null}
    </View>
  );
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={actions
        .filter((action) => !action.disabled)
        .map((action) => ({ name: action.id, label: action.label }))}
      onAccessibilityAction={(event) => {
        const action = actions.find((action) => action.id === event.nativeEvent.actionName);
        if (action) run(action);
      }}
    >
      {Platform.OS === 'web' ? (
        content
      ) : (
        <ReanimatedSwipeable
          ref={ref}
          enabled={!disabled}
          overshootLeft={false}
          overshootRight={false}
          renderLeftActions={startActions.length ? () => rows(startActions) : undefined}
          renderRightActions={endActions.length ? () => rows(endActions) : undefined}
          onSwipeableWillOpen={(direction) => {
            const action = direction === 'right' ? onSwipeStart : onSwipeEnd;
            if (action) {
              action();
              ref.current?.close();
            }
          }}
        >
          {content}
        </ReanimatedSwipeable>
      )}
    </View>
  );
}
