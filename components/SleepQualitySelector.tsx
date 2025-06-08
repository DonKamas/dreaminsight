import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeIn,
  BounceIn
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface SleepQualitySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function SleepQualitySelector({ value, onChange }: SleepQualitySelectorProps) {
  return (
    <Animated.View style={styles.container} entering={FadeIn.delay(200)}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((starValue, index) => {
          const scale = useSharedValue(1);
          
          const handlePressIn = () => {
            scale.value = withSpring(0.8);
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
              key={starValue}
              entering={BounceIn.delay(index * 100)}
              style={animatedStyle}>
              <TouchableOpacity
                style={styles.starButton}
                onPress={() => onChange(starValue)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                <Star
                  size={36}
                  color={starValue <= value ? Colors.accent : Colors.gray[300]}
                  fill={starValue <= value ? Colors.accent : 'transparent'}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      
      <View style={styles.labelsContainer}>
        <Text style={styles.labelText}>Poor</Text>
        <Text style={styles.labelText}>Excellent</Text>
      </View>
      
      <View style={styles.qualityIndicator}>
        <Text style={styles.qualityText}>
          {value === 1 && "Very Poor"}
          {value === 2 && "Poor"}
          {value === 3 && "Fair"}
          {value === 4 && "Good"}
          {value === 5 && "Excellent"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
    backgroundColor: 'transparent',
  },
  starButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  labelText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  qualityIndicator: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  qualityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.primary,
  },
});