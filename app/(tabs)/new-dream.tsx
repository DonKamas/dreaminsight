import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Calendar, Moon, Star, CreditCard as Edit3, FileText, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  BounceIn
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { HeaderBar } from '@/components/HeaderBar';
import { EmotionSelector } from '@/components/EmotionSelector';
import { SleepQualitySelector } from '@/components/SleepQualitySelector';

export default function NewDreamScreen() {
  const router = useRouter();
  const [dreamContent, setDreamContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDate] = useState(new Date());
  const [dreamContext, setDreamContext] = useState('');
  
  // Animations
  const sparkleRotation = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  React.useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
    
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
    
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);
  
  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });
  
  const floatingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingY.value }],
    };
  });
  
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });
  
  const handleSubmit = async () => {
    try {
      const existingDreamsJson = await AsyncStorage.getItem('dreams');
      const existingDreams = existingDreamsJson ? JSON.parse(existingDreamsJson) : [];
      
      const newDream = {
        id: Date.now().toString(),
        title: dreamTitle,
        content: dreamContent,
        date: dreamDate.toISOString(),
        emotion: selectedEmotion || 'Neutral',
        sleepQuality,
        context: dreamContext,
      };
      
      const updatedDreams = [newDream, ...existingDreams];
      await AsyncStorage.setItem('dreams', JSON.stringify(updatedDreams));
      router.push('/');
    } catch (error) {
      console.error('Error saving dream:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <HeaderBar title="New Dream" showBackButton />
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          {/* En-tête avec gradient et animations */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.6 }}
              style={styles.gradientHeader}>
              
              {/* Étoiles flottantes */}
              <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
                <Star size={14} color="rgba(255, 255, 255, 0.6)" />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle2, floatingAnimatedStyle]}>
                <Sparkles size={16} color="rgba(255, 255, 255, 0.5)" />
              </Animated.View>
              
              <Animated.View style={[styles.headerContent, floatingAnimatedStyle]}>
                <View style={styles.dateContainer}>
                  <Calendar size={18} color={Colors.text.light} />
                  <Text style={styles.dateText}>
                    {dreamDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                
                <Animated.View style={[styles.moonContainer, pulseAnimatedStyle]}>
                  <Moon size={36} color="rgba(255, 255, 255, 0.8)" />
                </Animated.View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
          
          {/* Formulaire avec animations */}
          <View style={styles.formContainer}>
            <Animated.View entering={FadeInUp.delay(400)} style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Edit3 size={20} color={Colors.primary} />
                <Text style={styles.inputLabel}>Dream Title</Text>
                <Text style={styles.inputEmoji}>✨</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Give your dream a name..."
                  placeholderTextColor={Colors.text.secondary}
                  value={dreamTitle}
                  onChangeText={setDreamTitle}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(600)} style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.inputLabel}>Describe your dream</Text>
                <Text style={styles.inputEmoji}>💭</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.dreamInput}
                  multiline
                  numberOfLines={8}
                  placeholder="What happened in your dream? Try to include as many details as possible..."
                  placeholderTextColor={Colors.text.secondary}
                  textAlignVertical="top"
                  value={dreamContent}
                  onChangeText={setDreamContent}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(700)} style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Info size={20} color={Colors.primary} />
                <Text style={styles.inputLabel}>Context (Optional)</Text>
                <Text style={styles.inputEmoji}>📝</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.dreamInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Add any relevant context about your life situation, feelings, or events that might help understand your dream better..."
                  placeholderTextColor={Colors.text.secondary}
                  textAlignVertical="top"
                  value={dreamContext}
                  onChangeText={setDreamContext}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={SlideInRight.delay(800)} style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Moon size={20} color={Colors.primary} />
                <Text style={styles.inputLabel}>How did you feel in this dream?</Text>
                <Text style={styles.inputEmoji}>😊</Text>
              </View>
              <View style={styles.selectorContainer}>
                <EmotionSelector
                  selectedEmotion={selectedEmotion}
                  onSelectEmotion={setSelectedEmotion}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={SlideInRight.delay(1000)} style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Star size={20} color={Colors.primary} />
                <Text style={styles.inputLabel}>Sleep Quality</Text>
                <Text style={styles.inputEmoji}>⭐</Text>
              </View>
              <View style={styles.selectorContainer}>
                <SleepQualitySelector
                  value={sleepQuality}
                  onChange={setSleepQuality}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={BounceIn.delay(1200)}>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!dreamContent || !dreamTitle) && styles.submitButtonDisabled
                ]}
                disabled={!dreamContent || !dreamTitle}
                onPress={handleSubmit}>
                <LinearGradient
                  colors={(!dreamContent || !dreamTitle) 
                    ? [Colors.gray[400], Colors.gray[500]] 
                    : Colors.gradients.primary}
                  style={styles.submitGradient}>
                  <Text style={styles.submitButtonText}>Save Dream</Text>
                  <Animated.View style={pulseAnimatedStyle}>
                    <Sparkles size={18} color={Colors.text.light} />
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: Colors.backgroundLight,
  },
  gradientHeader: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    margin: 16,
    borderRadius: 24,
    ...Colors.shadows.large,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 2,
  },
  sparkle1: {
    top: 20,
    right: 30,
  },
  sparkle2: {
    bottom: 25,
    left: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
    marginLeft: 12,
    textTransform: 'capitalize',
  },
  moonContainer: {
    marginLeft: 16,
  },
  formContainer: {
    padding: 20,
    backgroundColor: Colors.backgroundLight,
  },
  inputGroup: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  inputEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  titleInput: {
    fontFamily: 'Inter-Regular',
    backgroundColor: 'transparent',
    padding: 16,
    color: Colors.text.primary,
    fontSize: 16,
  },
  dreamInput: {
    fontFamily: 'Inter-Regular',
    backgroundColor: 'transparent',
    padding: 16,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 160,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  selectorContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Colors.shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.light,
    marginRight: 12,
  },
});