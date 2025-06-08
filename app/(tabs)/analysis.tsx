import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Bookmark, Share2, Crown, Lock, List, Star, Zap, Eye, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  SlideInRight, 
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { HeaderBar } from '@/components/HeaderBar';
import { SymbolCard } from '@/components/SymbolCard';
import { DreamVisualization } from '@/components/DreamVisualization';
import { OpenAIService } from '@/services/openai';

export default function AnalysisScreen() {
  const router = useRouter();
  const { dreamId } = useLocalSearchParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [dreams, setDreams] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showDreamSelector, setShowDreamSelector] = useState(false);
  const [error, setError] = useState(null);

  // Animations pour les effets premium
  const pulseScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    // Animation de pulsation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // Animation de rotation des étoiles
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  const loadDreams = async () => {
    try {
      const dreamsJson = await AsyncStorage.getItem('dreams');
      if (dreamsJson) {
        const loadedDreams = JSON.parse(dreamsJson);
        setDreams(loadedDreams);
        
        // Vérifier si le rêve actuellement sélectionné existe encore
        if (selectedDream) {
          const dreamStillExists = loadedDreams.find(d => d.id === selectedDream.id);
          if (!dreamStillExists) {
            console.log('Selected dream was deleted, resetting state');
            // Le rêve a été supprimé, réinitialiser l'état
            setSelectedDream(null);
            setAnalysis(null);
            setError(null);
            setLoading(false);
            return;
          }
          
          // Mettre à jour le rêve sélectionné avec les dernières données
          const updatedDream = loadedDreams.find(d => d.id === selectedDream.id);
          if (updatedDream) {
            setSelectedDream({
              ...updatedDream,
              date: new Date(updatedDream.date)
            });
            
            // Mettre à jour l'analyse si elle existe
            if (updatedDream.analysis) {
              setAnalysis(updatedDream.analysis);
            }
          }
        }
        
        // Vérifier si le rêve demandé via dreamId existe encore
        if (dreamId) {
          const dream = loadedDreams.find(d => d.id === dreamId);
          if (dream) {
            setSelectedDream({
              ...dream,
              date: new Date(dream.date)
            });
            
            if (dream.analysis) {
              setAnalysis(dream.analysis);
            }
          } else {
            console.log('Dream with ID', dreamId, 'was deleted, resetting state');
            // Le rêve demandé a été supprimé
            setSelectedDream(null);
            setAnalysis(null);
            setError(null);
            setLoading(false);
          }
        }
      } else {
        console.log('No dreams found in storage, resetting state');
        setDreams([]);
        setSelectedDream(null);
        setAnalysis(null);
        setError(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
      setError('Failed to load dreams');
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      const isUserPremium = premiumStatus === 'true';
      setIsPremiumUser(isUserPremium);
      console.log('Premium status loaded:', isUserPremium);
    } catch (e) {
      console.error('Error checking premium status:', e);
      setIsPremiumUser(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDreams();
      checkPremiumStatus();
    }, [])
  );

  const saveDreamAnalysis = async (dreamId, analysisData) => {
    try {
      const dreamsJson = await AsyncStorage.getItem('dreams');
      if (dreamsJson) {
        const dreams = JSON.parse(dreamsJson);
        const dreamIndex = dreams.findIndex(d => d.id === dreamId);
        
        if (dreamIndex !== -1) {
          dreams[dreamIndex].analysis = analysisData;
          await AsyncStorage.setItem('dreams', JSON.stringify(dreams));
          console.log('Analysis saved successfully for dream:', dreamId);
          
          // Recharger les rêves pour mettre à jour l'état local
          await loadDreams();
        }
      }
    } catch (error) {
      console.error('Error saving dream analysis:', error);
    }
  };

  const generateCompleteAnalysis = async (dream) => {
    console.log('Generating COMPLETE analysis (free + premium) for dream:', dream.title);
    
    try {
      // Générer l'analyse gratuite
      const freeAnalysis = await OpenAIService.analyzeDream({
        title: dream.title,
        content: dream.content,
        emotion: dream.emotion,
        sleepQuality: dream.sleepQuality,
        isPremium: false
      });

      console.log('Free analysis generated, now generating premium part...');

      // Générer l'analyse premium
      const premiumResult = await OpenAIService.analyzeDream({
        title: dream.title,
        content: dream.content,
        emotion: dream.emotion,
        sleepQuality: dream.sleepQuality,
        isPremium: true
      });

      console.log('Premium analysis generated successfully');

      // Combiner les deux analyses
      const completeAnalysis = {
        ...freeAnalysis,
        premiumAnalysis: premiumResult.premiumAnalysis
      };

      return completeAnalysis;
    } catch (error) {
      console.error('Error generating complete analysis:', error);
      throw error;
    }
  };

  const analyzeDream = async (dream) => {
    // Si l'analyse existe déjà, l'utiliser
    if (dream.analysis) {
      console.log('Analysis already exists, using it');
      setAnalysis(dream.analysis);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Generating complete analysis for the first time');
      const completeAnalysis = await generateCompleteAnalysis(dream);
      
      setAnalysis(completeAnalysis);
      await saveDreamAnalysis(dream.id, completeAnalysis);
      
    } catch (error) {
      console.error('Error analyzing dream:', error);
      setError(error.message || 'Failed to analyze dream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };
  
  const handleShare = () => {
    console.log('Share functionality would be implemented here');
  };

  const handleDreamSelect = (dream) => {
    console.log('Dream selected:', dream.title);
    setSelectedDream({
      ...dream,
      date: new Date(dream.date)
    });
    setShowDreamSelector(false);
    setError(null);
    
    if (dream.analysis) {
      setAnalysis(dream.analysis);
    } else {
      setAnalysis(null);
      // Générer automatiquement l'analyse complète si elle n'existe pas
      analyzeDream({...dream, date: new Date(dream.date)});
    }
  };

  const handleSymbolPress = (symbol) => {
    console.log('Symbol pressed:', symbol.name);
    if (selectedSymbol?.name === symbol.name) {
      // Si le même symbole est cliqué, le fermer
      setSelectedSymbol(null);
    } else {
      // Sinon, afficher les détails du nouveau symbole
      setSelectedSymbol(symbol);
    }
  };

  const toggleDreamSelector = () => {
    console.log('Toggle dream selector');
    setShowDreamSelector(!showDreamSelector);
  };

  const handleUpgradePress = () => {
    router.push('/profile');
  };

  useEffect(() => {
    if (selectedDream && !selectedDream.analysis && !loading && !analysis) {
      // Générer automatiquement l'analyse complète si elle n'existe pas
      console.log('No analysis found, generating complete analysis');
      analyzeDream(selectedDream);
    }
  }, [selectedDream]);

  // Si aucun rêve n'est sélectionné ou si le rêve a été supprimé, afficher la page de sélection
  if (!selectedDream) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <HeaderBar title="Dream Analysis" />
          <Animated.View style={styles.selectDreamContainer} entering={FadeIn}>
            <Text style={styles.selectDreamTitle}>Select a Dream to Analyze</Text>
            <Text style={styles.selectDreamSubtitle}>Choose from your recorded dreams to receive an AI analysis</Text>
            
            {dreams.length === 0 ? (
              <Animated.View style={styles.emptyState} entering={FadeInUp.delay(300)}>
                <Text style={styles.emptyStateText}>No dreams recorded</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/new-dream')}
                  activeOpacity={0.8}>
                  <Text style={styles.emptyStateButtonText}>Record your first dream</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              dreams.map((dream, index) => (
                <Animated.View
                  key={dream.id}
                  entering={SlideInRight.delay(200 + index * 100)}>
                  <TouchableOpacity
                    style={styles.dreamOption}
                    onPress={() => handleDreamSelect(dream)}
                    activeOpacity={0.8}>
                    <View style={styles.dreamOptionContent}>
                      <Text style={styles.dreamOptionTitle}>{dream.title}</Text>
                      <Text style={styles.dreamOptionDate}>
                        {new Date(dream.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                      {dream.analysis && (
                        <Text style={styles.analyzedBadge}>✓ Analyzed</Text>
                      )}
                    </View>
                    <View style={styles.dreamOptionEmotion}>
                      <Text style={styles.emotionText}>{dream.emotion}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <HeaderBar 
          title="Dream Analysis" 
          showBackButton 
          rightComponent={
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={toggleDreamSelector}
                activeOpacity={0.8}>
                <List size={20} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSave}
                activeOpacity={0.8}>
                <Bookmark 
                  size={20} 
                  color={Colors.text.primary} 
                  fill={saved ? Colors.text.primary : 'transparent'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleShare}
                activeOpacity={0.8}>
                <Share2 size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          }
        />
        
        <ScrollView style={styles.scrollView}>
          {/* Sélecteur de rêves intégré */}
          {showDreamSelector && (
            <Animated.View style={styles.dreamSelectorSection} entering={FadeIn}>
              <View style={styles.selectorHeader}>
                <Text style={styles.selectorTitle}>Select a Dream</Text>
                <TouchableOpacity 
                  style={styles.closeSelectorButton}
                  onPress={toggleDreamSelector}
                  activeOpacity={0.8}>
                  <Text style={styles.closeSelectorText}>Close</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.dreamSelectorList} nestedScrollEnabled>
                {dreams.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No dreams available</Text>
                    <TouchableOpacity 
                      style={styles.emptyStateButton}
                      onPress={() => {
                        setShowDreamSelector(false);
                        router.push('/new-dream');
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.emptyStateButtonText}>Record a Dream</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  dreams.map((dream) => (
                    <TouchableOpacity
                      key={dream.id}
                      style={[
                        styles.dreamSelectorOption,
                        selectedDream?.id === dream.id && styles.dreamSelectorOptionSelected
                      ]}
                      onPress={() => handleDreamSelect(dream)}
                      activeOpacity={0.8}>
                      <View style={styles.dreamSelectorContent}>
                        <Text style={styles.dreamSelectorTitle}>{dream.title}</Text>
                        <Text style={styles.dreamSelectorDate}>
                          {new Date(dream.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        {dream.analysis && (
                          <Text style={styles.dreamSelectorAnalyzed}>✓ AI Analyzed</Text>
                        )}
                      </View>
                      <View style={[styles.dreamSelectorEmotion, { backgroundColor: Colors.primaryDark }]}>
                        <Text style={styles.dreamSelectorEmotionText}>{dream.emotion}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </Animated.View>
          )}

          {loading ? (
            <Animated.View style={styles.loadingContainer} entering={FadeIn}>
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.loadingGradient}>
                <Sparkles size={32} color={Colors.text.light} />
              </LinearGradient>
              <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
              <Text style={styles.loadingText}>
                Generating Complete AI Analysis...
              </Text>
              <Text style={styles.loadingSubtext}>
                Our AI is generating both free and premium analysis for your dream
              </Text>
            </Animated.View>
          ) : error ? (
            <Animated.View style={styles.errorContainer} entering={FadeIn}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.tryAgainButton}
                onPress={() => analyzeDream(selectedDream)}
                activeOpacity={0.8}>
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : analysis ? (
            <Animated.View entering={FadeInUp}>
              <View style={styles.header}>
                <Text style={styles.dreamTitle}>{analysis.dreamTitle}</Text>
                <Text style={styles.dreamDate}>{analysis.date}</Text>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    Premium Status: {isPremiumUser ? '✅ Active' : '❌ Inactive'}
                  </Text>
                  <Text style={styles.freeAnalysisIndicator}>
                    🤖 Complete AI Analysis
                  </Text>
                </View>
              </View>
              
              {/* Dream Visualization Component - NEW */}
              <DreamVisualization 
                dream={{
                  title: selectedDream.title,
                  content: selectedDream.content,
                  emotion: selectedDream.emotion
                }}
                isPremium={isPremiumUser}
                onUpgradePress={handleUpgradePress}
              />
              
              {/* Contenu de l'analyse gratuite - toujours visible */}
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Dream Summary</Text>
                <Text style={styles.summaryText}>{analysis.summary}</Text>
              </View>
              
              <View style={styles.symbolsContainer}>
                <Text style={styles.sectionTitle}>Key Symbols</Text>
                <View style={styles.symbolsGrid}>
                  {analysis.symbols && analysis.symbols.length > 0 ? (
                    analysis.symbols.map((symbol, index) => (
                      <SymbolCard 
                        key={index} 
                        symbol={symbol} 
                        onPress={() => handleSymbolPress(symbol)}
                      />
                    ))
                  ) : (
                    <Text style={styles.noSymbolsText}>No symbols identified in this analysis</Text>
                  )}
                </View>
                
                {/* Section détails du symbole sélectionné - intégrée */}
                {selectedSymbol && (
                  <Animated.View style={styles.symbolDetailSection} entering={FadeInUp}>
                    <View style={styles.symbolDetailHeader}>
                      <LinearGradient
                        colors={Colors.gradients.secondary}
                        style={styles.symbolDetailHeaderGradient}>
                        <Text style={styles.symbolDetailTitle}>{selectedSymbol.name}</Text>
                        <TouchableOpacity 
                          style={styles.symbolDetailCloseButton}
                          onPress={() => setSelectedSymbol(null)}
                          activeOpacity={0.8}>
                          <ChevronUp size={20} color={Colors.text.light} />
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                    <View style={styles.symbolDetailContent}>
                      <Text style={styles.symbolDetailText}>{selectedSymbol.meaning}</Text>
                    </View>
                  </Animated.View>
                )}
              </View>
              
              <View style={styles.interpretationContainer}>
                <Text style={styles.sectionTitle}>Interpretation</Text>
                <Text style={styles.interpretationText}>{analysis.interpretation}</Text>
              </View>
              
              <View style={styles.reflectionContainer}>
                <Text style={styles.sectionTitle}>Reflection Questions</Text>
                {analysis.reflectionQuestions && analysis.reflectionQuestions.length > 0 ? (
                  analysis.reflectionQuestions.map((question, index) => (
                    <View key={index} style={styles.questionItem}>
                      <Text style={styles.questionNumber}>{index + 1}</Text>
                      <Text style={styles.questionText}>{question}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noQuestionsText}>No reflection questions available</Text>
                )}
              </View>

              {/* Contenu Premium - Affiché automatiquement si utilisateur premium */}
              {isPremiumUser && analysis.premiumAnalysis && (
                <Animated.View entering={FadeInUp.delay(200)}>
                  {/* Sections Premium avec style coloré distinctif */}
                  <View style={[styles.premiumSection, styles.premiumPsychological]}>
                    <View style={styles.premiumSectionHeader}>
                      <View style={[styles.premiumIconContainer, { backgroundColor: '#ec4899' }]}>
                        <Text style={styles.premiumIcon}>🧠</Text>
                      </View>
                      <View style={styles.premiumTitleContainer}>
                        <Text style={styles.premiumSectionTitle}>Psychological Analysis</Text>
                        <View style={[styles.premiumBadge, { backgroundColor: '#8b5cf6' }]}>
                          <Crown size={10} color="#FFF" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.interpretationText}>{analysis.premiumAnalysis.psychological}</Text>
                  </View>

                  <View style={[styles.premiumSection, styles.premiumConnections]}>
                    <View style={styles.premiumSectionHeader}>
                      <View style={[styles.premiumIconContainer, { backgroundColor: '#8b5cf6' }]}>
                        <Text style={styles.premiumIcon}>🔗</Text>
                      </View>
                      <View style={styles.premiumTitleContainer}>
                        <Text style={styles.premiumSectionTitle}>Life Connections</Text>
                        <View style={[styles.premiumBadge, { backgroundColor: '#8b5cf6' }]}>
                          <Crown size={10} color="#FFF" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.interpretationText}>{analysis.premiumAnalysis.lifeConnections}</Text>
                  </View>

                  <View style={[styles.premiumSection, styles.premiumInsights]}>
                    <View style={styles.premiumSectionHeader}>
                      <View style={[styles.premiumIconContainer, { backgroundColor: '#06b6d4' }]}>
                        <Text style={styles.premiumIcon}>💡</Text>
                      </View>
                      <View style={styles.premiumTitleContainer}>
                        <Text style={styles.premiumSectionTitle}>Actionable Insights</Text>
                        <View style={[styles.premiumBadge, { backgroundColor: '#8b5cf6' }]}>
                          <Crown size={10} color="#FFF" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.interpretationText}>{analysis.premiumAnalysis.actionableInsights}</Text>
                  </View>

                  <View style={[styles.premiumSection, styles.premiumFuture]}>
                    <View style={styles.premiumSectionHeader}>
                      <View style={[styles.premiumIconContainer, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.premiumIcon}>🔮</Text>
                      </View>
                      <View style={styles.premiumTitleContainer}>
                        <Text style={styles.premiumSectionTitle}>Future Implications</Text>
                        <View style={[styles.premiumBadge, { backgroundColor: '#8b5cf6' }]}>
                          <Crown size={10} color="#FFF" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.interpretationText}>{analysis.premiumAnalysis.futureImplications}</Text>
                  </View>
                </Animated.View>
              )}

              {/* Aperçu Premium pour utilisateurs gratuits */}
              {analysis.premiumAnalysis && !isPremiumUser && (
                <View style={styles.premiumPreviewContainer}>
                  <View style={styles.premiumHeaderSection}>
                    <View style={styles.premiumHeaderContent}>
                      <Animated.View style={[styles.premiumIconContainer, pulseAnimatedStyle]}>
                        <Animated.View style={sparkleAnimatedStyle}>
                          <Crown size={32} color="#FFD700" />
                        </Animated.View>
                        <Animated.View style={[styles.sparkleDecor1, sparkleAnimatedStyle]}>
                          <Sparkles size={16} color="#FFA500" />
                        </Animated.View>
                        <Animated.View style={[styles.sparkleDecor2, sparkleAnimatedStyle]}>
                          <Star size={12} color="#FF6B6B" />
                        </Animated.View>
                      </Animated.View>
                      
                      <Text style={styles.premiumHeaderTitle}>✨ Exclusive Premium Content ✨</Text>
                      <Text style={styles.premiumHeaderSubtitle}>
                        Unlock in-depth psychological analysis with personalized insights
                      </Text>
                    </View>
                  </View>

                  {/* Cartes premium */}
                  <View style={styles.premiumCardsContainer}>
                    {[
                      { 
                        icon: '🧠', 
                        title: 'In-Depth Psychological Analysis', 
                        preview: analysis.premiumAnalysis.psychological,
                        bgColor: '#f0f4ff',
                        borderColor: '#6366f1',
                        iconBg: '#6366f1'
                      },
                      { 
                        icon: '🔗', 
                        title: 'Connections to Your Life', 
                        preview: analysis.premiumAnalysis.lifeConnections,
                        bgColor: '#f5f0ff',
                        borderColor: '#8b5cf6',
                        iconBg: '#8b5cf6'
                      },
                      { 
                        icon: '💡', 
                        title: 'Actionable Insights', 
                        preview: analysis.premiumAnalysis.actionableInsights,
                        bgColor: '#f0fdff',
                        borderColor: '#06b6d4',
                        iconBg: '#06b6d4'
                      },
                      { 
                        icon: '🔮', 
                        title: 'Future Implications', 
                        preview: analysis.premiumAnalysis.futureImplications,
                        bgColor: '#f0fff4',
                        borderColor: '#10b981',
                        iconBg: '#10b981'
                      }
                    ].map((item, index) => (
                      <Animated.View 
                        key={index}
                        style={[styles.premiumCard, { backgroundColor: item.bgColor, borderColor: item.borderColor }]}
                        entering={FadeInUp.delay(index * 200)}>
                        
                        <View style={styles.premiumCardHeader}>
                          <View style={[styles.premiumCardIconContainer, { backgroundColor: item.iconBg }]}>
                            <Text style={styles.premiumCardIcon}>{item.icon}</Text>
                          </View>
                          <View style={styles.premiumCardTitleContainer}>
                            <Text style={styles.premiumCardTitle}>{item.title}</Text>
                            <View style={[styles.premiumBadge, { backgroundColor: item.iconBg }]}>
                              <Crown size={10} color="#FFF" />
                              <Text style={styles.premiumBadgeText}>Premium</Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.premiumCardContent}>
                          <Text style={styles.premiumPreviewText}>
                            {item.preview.substring(0, 120)}...
                          </Text>
                          
                          {/* Effet de dégradé pour masquer le texte */}
                          <LinearGradient
                            colors={[`${item.bgColor}00`, item.bgColor]}
                            style={styles.fadeOverlay}
                          />
                          
                          {/* Overlay avec verrou */}
                          <View style={styles.lockOverlayCard}>
                            <Animated.View style={pulseAnimatedStyle}>
                              <Lock size={16} color={item.iconBg} />
                            </Animated.View>
                            <Text style={[styles.lockTextCard, { color: item.iconBg }]}>
                              Unlocked with Premium
                            </Text>
                          </View>
                        </View>
                      </Animated.View>
                    ))}
                  </View>

                  {/* Call to action premium */}
                  <Animated.View style={pulseAnimatedStyle}>
                    <TouchableOpacity 
                      style={styles.unlockPremiumButton}
                      onPress={() => router.push('/profile')}
                      activeOpacity={0.8}>
                      <View style={styles.unlockButtonContent}>
                        <Animated.View style={sparkleAnimatedStyle}>
                          <Zap size={20} color="#FFF" />
                        </Animated.View>
                        <Text style={styles.unlockPremiumButtonText}>
                          🚀 Unlock Premium Content
                        </Text>
                        <Eye size={16} color="rgba(255, 255, 255, 0.8)" />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}
            </Animated.View>
          ) : null}
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
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  selectDreamContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  selectDreamTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  selectDreamSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.light,
  },
  dreamOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.small,
  },
  dreamOptionContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dreamOptionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dreamOptionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  analyzedBadge: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  dreamOptionEmotion: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emotionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.light,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    backgroundColor: 'transparent',
    padding: 16,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spinner: {
    position: 'absolute',
    top: 30,
    width: 100,
    height: 100,
  },
  loadingText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
    padding: 16,
  },
  dreamTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dreamDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  freeAnalysisIndicator: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  symbolsContainer: {
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    backgroundColor: 'transparent',
  },
  noSymbolsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Section détails du symbole intégrée
  symbolDetailSection: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.medium,
  },
  symbolDetailHeader: {
    overflow: 'hidden',
  },
  symbolDetailHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  symbolDetailTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.light,
    flex: 1,
  },
  symbolDetailCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  symbolDetailContent: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  symbolDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  
  interpretationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  interpretationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  reflectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  questionNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  questionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 24,
  },
  noQuestionsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Sections Premium avec style coloré distinctif (comme dans l'image)
  premiumSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 2,
    ...Colors.shadows.medium,
  },
  premiumPsychological: {
    backgroundColor: 'rgba(253, 242, 248, 0.9)', // Rose très clair avec transparence
    borderColor: '#ec4899', // Rose
  },
  premiumConnections: {
    backgroundColor: 'rgba(245, 240, 255, 0.9)', // Violet très clair avec transparence
    borderColor: '#8b5cf6', // Violet
  },
  premiumInsights: {
    backgroundColor: 'rgba(240, 253, 255, 0.9)', // Cyan très clair avec transparence
    borderColor: '#06b6d4', // Cyan
  },
  premiumFuture: {
    backgroundColor: 'rgba(240, 255, 244, 0.9)', // Vert très clair avec transparence
    borderColor: '#10b981', // Vert
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Colors.shadows.small,
  },
  premiumIcon: {
    fontSize: 24,
  },
  premiumTitleContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  premiumSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#FFF',
    marginLeft: 4,
  },
  
  // Styles pour l'aperçu premium (utilisateurs gratuits)
  premiumPreviewContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  premiumHeaderSection: {
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    ...Colors.shadows.large,
  },
  premiumHeaderContent: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  sparkleDecor1: {
    position: 'absolute',
    top: -10,
    right: -15,
  },
  sparkleDecor2: {
    position: 'absolute',
    bottom: -8,
    left: -12,
  },
  premiumHeaderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumHeaderSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  premiumCardsContainer: {
    gap: 16,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    ...Colors.shadows.medium,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  premiumCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumCardIcon: {
    fontSize: 20,
  },
  premiumCardTitleContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  premiumCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  premiumCardContent: {
    position: 'relative',
    minHeight: 80,
    backgroundColor: 'transparent',
  },
  premiumPreviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  lockOverlayCard: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...Colors.shadows.small,
  },
  lockTextCard: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    marginLeft: 4,
  },
  unlockPremiumButton: {
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    ...Colors.shadows.large,
  },
  unlockButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: 'transparent',
  },
  unlockPremiumButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFF',
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    backgroundColor: 'transparent',
    padding: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tryAgainButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tryAgainButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.light,
  },
  
  // Sections intégrées pour remplacer les modals
  dreamSelectorSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...Colors.shadows.medium,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 250, 252, 0.8)',
    backgroundColor: 'transparent',
  },
  selectorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  closeSelectorButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closeSelectorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  dreamSelectorList: {
    maxHeight: 300,
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  dreamSelectorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dreamSelectorOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  dreamSelectorContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dreamSelectorTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dreamSelectorDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  dreamSelectorAnalyzed: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  dreamSelectorEmotion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  dreamSelectorEmotionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.light,
  },
});