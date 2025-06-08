import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Moon, Star, ChevronRight, Trash2, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate,
  FadeIn,
  SlideInRight
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface DreamCardProps {
  dream: {
    id: string;
    title: string;
    content: string;
    date: Date;
    emotion: string;
    sleepQuality: number;
    analysis?: any;
    context?: string;
  };
  onDelete?: () => void;
  onPress?: () => void;
  isExpanded?: boolean;
}

export function DreamCard({ dream, onDelete, onPress, isExpanded }: DreamCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const emotionColor = Colors.dream[dream.emotion.toLowerCase()] || Colors.dream.neutral;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    opacity.value = withTiming(0.8);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  const getEmotionIcon = (emotion: string) => {
    return <Moon size={16} color={emotionColor} />;
  };
  
  const renderSleepQuality = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Animated.View
          key={i}
          style={styles.starContainer}
          entering={FadeIn.delay(i * 100)}>
          <Star 
            size={12}
            color={i < dream.sleepQuality ? Colors.accent : Colors.gray[300]}
            fill={i < dream.sleepQuality ? Colors.accent : 'transparent'}
          />
        </Animated.View>
      );
    }
    return <View style={styles.sleepQualityContainer}>{stars}</View>;
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.cardBackground}>
        <TouchableOpacity 
          style={styles.touchable}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}>
          
          {/* Barre colorée selon l'émotion */}
          <View style={[styles.emotionBar, { backgroundColor: emotionColor }]} />
          
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{formatDate(dream.date)}</Text>
                {renderSleepQuality()}
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.emotionBadge, { backgroundColor: `${emotionColor}15` }]}>
                  {getEmotionIcon(dream.emotion)}
                  <Text style={[styles.emotionText, { color: emotionColor }]}>
                    {dream.emotion}
                  </Text>
                </View>
                {onDelete && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}>
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {dream.title}
              </Text>
              {dream.analysis && (
                <View style={styles.analysisIndicator}>
                  <Sparkles size={14} color={Colors.primary} />
                  <Text style={styles.analysisText}>Analyzed</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.contentText} numberOfLines={2}>
              {dream.content}
            </Text>
            
            {/* Le bouton View Analysis est maintenant géré dans la page Home, pas ici */}
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  cardBackground: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Colors.shadows.medium,
  },
  touchable: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  emotionBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  content: {
    padding: 20,
    paddingLeft: 24,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  dateContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  sleepQualityContainer: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: 'transparent',
  },
  starContainer: {
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  emotionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 6,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
    flex: 1,
  },
  analysisIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  analysisText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: Colors.primary,
    marginLeft: 4,
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 22,
  },
});