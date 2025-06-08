import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Crown, ChartPie as PieChart, ArrowRight, Lock } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  BounceIn, 
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { HeaderBar } from '@/components/HeaderBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Alex Thompson',
    email: 'alex@example.com',
    dreamsRecorded: 0,
    joinDate: 'March 2025',
    isPremium: false,
  });

  const [showPremiumInput, setShowPremiumInput] = useState(false);
  const [premiumPassword, setPremiumPassword] = useState('');
  const [error, setError] = useState('');
  const [dreamStats, setDreamStats] = useState({
    totalDreams: 0,
    thisWeek: 0,
    positivePercentage: 0,
    commonSymbols: 0,
    mostCommonEmotion: 'Neutral',
    averageSleepQuality: 0
  });

  // Animations
  const crownRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    crownRotation.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000 }),
        withTiming(10, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const crownAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${crownRotation.value}deg` }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const calculateDreamStatistics = async () => {
    try {
      const dreamsJson = await AsyncStorage.getItem('dreams');
      if (dreamsJson) {
        const dreams = JSON.parse(dreamsJson);
        
        // Total dreams
        const totalDreams = dreams.length;
        
        // Dreams this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekDreams = dreams.filter(dream => 
          new Date(dream.date) >= oneWeekAgo
        ).length;
        
        // Positive emotions percentage
        const positiveEmotions = ['Joy', 'Neutral'];
        const positiveDreams = dreams.filter(dream => 
          positiveEmotions.includes(dream.emotion)
        ).length;
        const positivePercentage = totalDreams > 0 ? Math.round((positiveDreams / totalDreams) * 100) : 0;
        
        // Most common emotion
        const emotionCounts = {};
        dreams.forEach(dream => {
          emotionCounts[dream.emotion] = (emotionCounts[dream.emotion] || 0) + 1;
        });
        const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b, 'Neutral'
        );
        
        // Average sleep quality
        const totalSleepQuality = dreams.reduce((sum, dream) => sum + (dream.sleepQuality || 0), 0);
        const averageSleepQuality = totalDreams > 0 ? (totalSleepQuality / totalDreams).toFixed(1) : 0;
        
        // Common symbols (estimate based on analyzed dreams)
        const analyzedDreams = dreams.filter(dream => dream.analysis && dream.analysis.symbols);
        const allSymbols = analyzedDreams.flatMap(dream => dream.analysis.symbols || []);
        const uniqueSymbols = [...new Set(allSymbols.map(symbol => symbol.name))];
        const commonSymbols = uniqueSymbols.length;
        
        setDreamStats({
          totalDreams,
          thisWeek: thisWeekDreams,
          positivePercentage,
          commonSymbols,
          mostCommonEmotion,
          averageSleepQuality: parseFloat(averageSleepQuality)
        });
        
        // Update user dreams count
        setUser(prev => ({ ...prev, dreamsRecorded: totalDreams }));
        
      } else {
        // No dreams found, reset stats
        setDreamStats({
          totalDreams: 0,
          thisWeek: 0,
          positivePercentage: 0,
          commonSymbols: 0,
          mostCommonEmotion: 'Neutral',
          averageSleepQuality: 0
        });
        setUser(prev => ({ ...prev, dreamsRecorded: 0 }));
      }
    } catch (error) {
      console.error('Error calculating dream statistics:', error);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      const isUserPremium = premiumStatus === 'true';
      setUser(prev => ({ ...prev, isPremium: isUserPremium }));
      console.log('Premium status loaded:', isUserPremium);
    } catch (e) {
      console.error('Error loading premium status:', e);
    }
  };

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPremiumStatus();
      calculateDreamStatistics();
    }, [])
  );

  const togglePremiumInput = () => {
    console.log('Toggle premium input...');
    setError('');
    setPremiumPassword('');
    setShowPremiumInput(!showPremiumInput);
  };

  const handlePremiumUpgrade = async () => {
    console.log('Attempting premium activation with password:', premiumPassword);
    
    if (premiumPassword.trim() === 'admin') {
      try {
        await AsyncStorage.setItem('isPremium', 'true');
        setUser(prev => ({ ...prev, isPremium: true }));
        setShowPremiumInput(false);
        setPremiumPassword('');
        setError('');
        console.log('Premium status activated successfully');
        
        Alert.alert(
          'Premium Activated!',
          'You now have access to all premium features.',
          [{ text: 'OK' }]
        );
      } catch (e) {
        console.error('Error saving premium status:', e);
        setError('Error during activation. Please try again.');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleDowngrade = async () => {
    try {
      await AsyncStorage.setItem('isPremium', 'false');
      setUser(prev => ({ ...prev, isPremium: false }));
      console.log('Premium status deactivated');
      
      Alert.alert(
        'Premium Deactivated',
        'You no longer have access to premium features.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      console.error('Error deactivating premium:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar 
        title="Profile" 
        rightComponent={
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        } 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Animated.View style={styles.profileHeader} entering={FadeInDown.delay(200)}>
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            {user.isPremium && (
              <Animated.View style={styles.premiumBadge} entering={BounceIn.delay(400)}>
                <Animated.View style={crownAnimatedStyle}>
                  <Crown size={14} color="#FFD700" />
                </Animated.View>
                <Text style={styles.premiumBadgeText}>Premium Member</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
        
        {/* Premium Card */}
        {!user.isPremium ? (
          <Animated.View entering={SlideInRight.delay(400)}>
            <TouchableOpacity 
              style={styles.premiumCard}
              onPress={togglePremiumInput}
              activeOpacity={0.8}>
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumGradient}>
                <View style={styles.premiumContent}>
                  <Animated.View style={pulseAnimatedStyle}>
                    <Crown size={28} color="#FFD700" />
                  </Animated.View>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumDescription}>
                    Unlock advanced dream analysis, pattern detection and personalized insights
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={togglePremiumInput}
                    activeOpacity={0.8}>
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                </View>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/1252873/pexels-photo-1252873.jpeg' }}
                  style={styles.premiumBackground}
                  resizeMode="cover"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Premium activation section */}
            {showPremiumInput && (
              <Animated.View style={styles.premiumInputSection} entering={FadeIn}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputTitle}>Premium Code</Text>
                  <Text style={styles.inputDescription}>
                    Enter the premium code to unlock all advanced features.
                  </Text>
                  
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.text.secondary}
                    secureTextEntry={true}
                    value={premiumPassword}
                    onChangeText={setPremiumPassword}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={togglePremiumInput}
                      activeOpacity={0.8}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.activateButton}
                      onPress={handlePremiumUpgrade}
                      activeOpacity={0.8}>
                      <LinearGradient
                        colors={Colors.gradients.primary}
                        style={styles.activateButtonGradient}>
                        <Text style={styles.activateButtonText}>Activate Premium</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.hintText}>
                    💡 Hint: The password is "admin"
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <Animated.View style={styles.premiumActiveCard} entering={FadeIn.delay(400)}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumActiveGradient}>
              <View style={styles.premiumActiveContent}>
                <Animated.View style={crownAnimatedStyle}>
                  <Crown size={32} color="#FFF" />
                </Animated.View>
                <Text style={styles.premiumActiveTitle}>Premium Active</Text>
                <Text style={styles.premiumActiveDescription}>
                  You have access to all premium features
                </Text>
                <TouchableOpacity 
                  style={styles.downgradeButton}
                  onPress={handleDowngrade}
                  activeOpacity={0.8}>
                  <Text style={styles.downgradeButtonText}>Deactivate Premium</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
        
        {/* Dream Statistics */}
        <Animated.View style={styles.statsContainer} entering={FadeIn.delay(600)}>
          <Text style={styles.sectionTitle}>Your Dream Statistics</Text>
          
          <View style={styles.statsGrid}>
            <Animated.View style={styles.statCard} entering={BounceIn.delay(700)}>
              <Text style={styles.statNumber}>{dreamStats.totalDreams}</Text>
              <Text style={styles.statLabel}>Dreams Recorded</Text>
            </Animated.View>
            <Animated.View style={styles.statCard} entering={BounceIn.delay(800)}>
              <Text style={styles.statNumber}>{dreamStats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Animated.View>
            <Animated.View style={styles.statCard} entering={BounceIn.delay(900)}>
              <Text style={styles.statNumber}>{dreamStats.positivePercentage}%</Text>
              <Text style={styles.statLabel}>Positive Dreams</Text>
            </Animated.View>
            <Animated.View style={styles.statCard} entering={BounceIn.delay(1000)}>
              <Text style={styles.statNumber}>{dreamStats.commonSymbols}</Text>
              <Text style={styles.statLabel}>Unique Symbols</Text>
            </Animated.View>
          </View>

          {/* Additional stats for users with dreams */}
          {dreamStats.totalDreams > 0 && (
            <Animated.View style={styles.additionalStats} entering={FadeIn.delay(1100)}>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>Most Common Emotion:</Text>
                <Text style={styles.additionalStatValue}>{dreamStats.mostCommonEmotion}</Text>
              </View>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>Average Sleep Quality:</Text>
                <Text style={styles.additionalStatValue}>
                  {dreamStats.averageSleepQuality}/5 ⭐
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Dream Insights */}
        <Animated.View style={styles.insightsContainer} entering={FadeIn.delay(1200)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dream Insights</Text>
            {!user.isPremium && <Lock size={16} color={Colors.text.secondary} />}
          </View>
          
          <TouchableOpacity style={styles.insightCard} activeOpacity={0.8}>
            <View style={styles.insightContent}>
              <PieChart size={24} color={user.isPremium ? Colors.primary : Colors.text.secondary} />
              <View style={styles.insightTextContainer}>
                <Text style={[styles.insightTitle, !user.isPremium && styles.lockedText]}>
                  Pattern Analysis
                </Text>
                <Text style={[styles.insightDescription, !user.isPremium && styles.lockedText]}>
                  {user.isPremium 
                    ? `Discover recurring themes in your ${dreamStats.totalDreams} dreams`
                    : "Premium Feature - Upgrade to premium to unlock"
                  }
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={user.isPremium ? Colors.text.secondary : Colors.gray[400]} />
          </TouchableOpacity>

          {/* Show empty state if no dreams */}
          {dreamStats.totalDreams === 0 && (
            <Animated.View style={styles.noDreamsCard} entering={FadeIn.delay(1300)}>
              <Text style={styles.noDreamsTitle}>Start Recording Your Dreams</Text>
              <Text style={styles.noDreamsDescription}>
                Record your first dream to see personalized statistics and insights about your dream patterns.
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.small,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 16,
    borderRadius: 20,
    ...Colors.shadows.medium,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadows.medium,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text.light,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
    backgroundColor: 'transparent',
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#B8860B',
    marginLeft: 6,
  },
  premiumCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    ...Colors.shadows.large,
  },
  premiumGradient: {
    flex: 1,
    position: 'relative',
  },
  premiumBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  premiumContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  premiumTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text.light,
    marginTop: 12,
    marginBottom: 8,
  },
  premiumDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  upgradeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
  },
  premiumInputSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.medium,
  },
  inputTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
  },
  activateButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activateButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  activateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  hintText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  premiumActiveCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Colors.shadows.large,
  },
  premiumActiveGradient: {
    padding: 24,
    alignItems: 'center',
  },
  premiumActiveContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  premiumActiveTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text.light,
    marginTop: 12,
    marginBottom: 8,
  },
  premiumActiveDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  downgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  downgradeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.light,
  },
  statsContainer: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    backgroundColor: 'transparent',
  },
  statCard: {
    width: '50%',
    padding: 8,
    backgroundColor: 'transparent',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  additionalStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.small,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  additionalStatLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
  },
  additionalStatValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  insightsContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.small,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  insightTextContainer: {
    marginLeft: 16,
    flex: 1,
    backgroundColor: 'transparent',
  },
  insightTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  insightDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  lockedText: {
    color: Colors.text.secondary,
    opacity: 0.6,
  },
  noDreamsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.small,
  },
  noDreamsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noDreamsDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});