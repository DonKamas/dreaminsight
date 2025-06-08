import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeIn,
  BounceIn
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface EmotionSelectorProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
}

export function EmotionSelector({ selectedEmotion, onSelectEmotion }: EmotionSelectorProps) {
  const emotions = [
    { name: 'Joy', color: Colors.dream.joy, emoji: '😊' },
    { name: 'Sadness', color: Colors.dream.sadness, emoji: '😢' },
    { name: 'Fear', color: Colors.dream.fear, emoji: '😨' },
    { name: 'Anger', color: Colors.dream.anger, emoji: '😠' },
    { name: 'Confusion', color: Colors.dream.confusion, emoji: '😕' },
    { name: 'Neutral', color: Colors.dream.neutral, emoji: '😐' },
  ];

  return (
    <View style={styles.container}>
      {emotions.map((emotion, index) => {
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
        
        const isSelected = selectedEmotion === emotion.name;
        
        return (
          <Animated.View
            key={emotion.name}
            entering={BounceIn.delay(index * 100)}
            style={animatedStyle}>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                isSelected && { 
                  borderColor: emotion.color,
                  borderWidth: 2,
                  backgroundColor: `${emotion.color}10`
                }
              ]}
              onPress={() => onSelectEmotion(emotion.name)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}>
              
              <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
              <View 
                style={[
                  styles.emotionColor, 
                  { backgroundColor: emotion.color }
                ]} 
              />
              <Text 
                style={[
                  styles.emotionText,
                  isSelected && { 
                    color: emotion.color,
                    fontFamily: 'Inter-Bold'
                  }
                ]}>
                {emotion.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  emotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'transparent',
  },
  emotionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  emotionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  emotionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
});