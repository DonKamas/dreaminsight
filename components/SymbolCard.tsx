import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeIn
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface SymbolCardProps {
  symbol: {
    name: string;
    meaning: string;
  };
  onPress?: () => void;
}

export function SymbolCard({ symbol, onPress }: SymbolCardProps) {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      entering={FadeIn}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}>
        
        <View style={styles.content}>
          <Text style={styles.symbolName}>{symbol.name}</Text>
          <Text style={styles.symbolMeaning} numberOfLines={2}>
            {symbol.meaning}
          </Text>
          {onPress && (
            <View style={styles.tapHintContainer}>
              <Text style={styles.tapHint}>Tap for more details</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    margin: '1%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Colors.shadows.small,
  },
  touchable: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    borderRadius: 16,
  },
  content: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  symbolName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  symbolMeaning: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tapHintContainer: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tapHint: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
});