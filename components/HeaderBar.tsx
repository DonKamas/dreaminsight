import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
}

export function HeaderBar({ title, showBackButton = false, rightComponent, showLogo = false }: HeaderBarProps) {
  const router = useRouter();
  const sparkleRotation = useSharedValue(0);
  
  React.useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );
  }, []);
  
  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });
  
  return (
    <Animated.View style={styles.container} entering={SlideInDown.springify()}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <Animated.View entering={FadeIn.delay(200)}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}>
                <ArrowLeft size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {showLogo ? (
            <Animated.View style={styles.logoContainer} entering={FadeIn.delay(300)}>
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.logoGradient}>
                <Animated.View style={sparkleAnimatedStyle}>
                  <Sparkles size={20} color={Colors.text.light} />
                </Animated.View>
              </LinearGradient>
              <Text style={styles.logoText}>DreamInsight</Text>
            </Animated.View>
          ) : (
            <Animated.Text style={styles.title} entering={FadeIn.delay(300)}>
              {title}
            </Animated.Text>
          )}
        </View>
        
        {rightComponent && (
          <Animated.View style={styles.rightContainer} entering={FadeIn.delay(400)}>
            {rightComponent}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    ...Colors.shadows.small,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Colors.shadows.small,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Colors.shadows.small,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});