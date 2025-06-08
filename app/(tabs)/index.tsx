import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CirclePlus as PlusCircle, Moon, BookOpen, ChevronRight, X, Sparkles, Star, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  BounceIn,
  withSpring,
  SlideInUp,
  SlideOutDown,
  FadeOut
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { DreamCard } from '@/components/DreamCard';
import { HeaderBar } from '@/components/HeaderBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [dreams, setDreams] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState(null);
  const [expandedDreamId, setExpandedDreamId] = useState(null);
  
  // Animations
  const sparkleRotation = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  
  useEffect(() => {
    // Animation de rotation continue pour les étoiles
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
    
    // Animation de flottement
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
    
    // Animation de pulsation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);
  
  // Animations pour le modal
  useEffect(() => {
    if (showDeleteModal) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [showDeleteModal]);
  
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
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  const modalOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
    };
  });
  
  const modalContentStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });
  
  const loadDreams = async () => {
    try {
      const dreamsJson = await AsyncStorage.getItem('dreams');
      if (dreamsJson) {
        const parsedDreams = JSON.parse(dreamsJson);
        const dreamsWithDates = parsedDreams.map(dream => ({
          ...dream,
          date: new Date(dream.date)
        }));
        setDreams(dreamsWithDates);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDreams();
    }, [])
  );
  
  const deleteDream = async (dreamId) => {
    try {
      const dreamsJson = await AsyncStorage.getItem('dreams');
      if (dreamsJson) {
        const existingDreams = JSON.parse(dreamsJson);
        const updatedDreams = existingDreams.filter(dream => dream.id !== dreamId);
        await AsyncStorage.setItem('dreams', JSON.stringify(updatedDreams));
        setDreams(prevDreams => prevDreams.filter(dream => dream.id !== dreamId));
      }
    } catch (error) {
      console.error('Error deleting dream:', error);
    }
  };

  const handleDeleteDream = (dreamId, dreamTitle) => {
    setDreamToDelete({ id: dreamId, title: dreamTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (dreamToDelete) {
      await deleteDream(dreamToDelete.id);
      setShowDeleteModal(false);
      setDreamToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDreamToDelete(null);
  };
  
  const navigateToNewDream = () => {
    router.push('/new-dream');
  };
  
  const navigateToDictionary = () => {
    router.push('/dictionary');
  };
  
  const recentDreams = dreams.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={headerAnimatedStyle}>
        <HeaderBar title="Dream Journal" showLogo={true} />
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}>
        
        {/* Hero Section avec animations */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}>
            
            {/* Étoiles flottantes animées */}
            <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
              <Sparkles size={16} color="rgba(255, 255, 255, 0.6)" />
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle2, floatingAnimatedStyle]}>
              <Star size={12} color="rgba(255, 255, 255, 0.4)" />
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
              <Sparkles size={14} color="rgba(255, 255, 255, 0.5)" />
            </Animated.View>
            
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg' }}
              style={styles.backgroundImage}
            />
            <View style={styles.welcomeOverlay} />
            
            <Animated.View style={[styles.welcomeContent, floatingAnimatedStyle]}>
              <Animated.Text style={styles.welcomeTitle} entering={FadeInUp.delay(400)}>
                Explore Your Dreams
              </Animated.Text>
              <Animated.Text style={styles.welcomeSubtitle} entering={FadeInUp.delay(600)}>
                Discover the hidden secrets of your subconscious mind
              </Animated.Text>
              
              <Animated.View entering={BounceIn.delay(800)}>
                <TouchableOpacity 
                  style={styles.welcomeButton}
                  onPress={navigateToNewDream}>
                  <Animated.View style={pulseAnimatedStyle}>
                    <PlusCircle size={18} color={Colors.text.light} />
                  </Animated.View>
                  <Text style={styles.welcomeButtonText}>New Dream</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
        
        {/* Section Rêves Récents */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Dreams</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors.accent} />
            </TouchableOpacity>
          </View>
          
          {recentDreams.length > 0 ? (
            <View style={styles.dreamsContainer}>
              {recentDreams.map((dream, index) => (
                <Animated.View 
                  key={dream.id}
                  entering={SlideInRight.delay(1200 + index * 200).springify()}>
                  <DreamCard 
                    dream={dream} 
                    onDelete={() => handleDeleteDream(dream.id, dream.title)}
                    onPress={() => setExpandedDreamId(expandedDreamId === dream.id ? null : dream.id)}
                    isExpanded={expandedDreamId === dream.id}
                  />
                  {expandedDreamId === dream.id && (
                    <View style={styles.dreamDetailsInline}>
                      <Text style={styles.detailLabel}>Title:</Text>
                      <Text style={styles.detailValue}>{dream.title}</Text>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>{dream.date.toLocaleDateString()}</Text>
                      <Text style={styles.detailLabel}>Content:</Text>
                      <Text style={styles.detailValue}>{dream.content}</Text>
                      <Text style={styles.detailLabel}>Emotion:</Text>
                      <Text style={styles.detailValue}>{dream.emotion}</Text>
                      <Text style={styles.detailLabel}>Sleep Quality:</Text>
                      <Text style={styles.detailValue}>{dream.sleepQuality}/5</Text>
                      {dream.context && (
                        <>
                          <Text style={styles.detailLabel}>Context:</Text>
                          <Text style={styles.detailValue}>{dream.context}</Text>
                        </>
                      )}
                      <TouchableOpacity
                        style={styles.viewAnalysisButton}
                        onPress={() => router.push({ pathname: '/analysis', params: { dreamId: dream.id } })}>
                        <Text style={styles.viewAnalysisButtonText}>View Analysis</Text>
                        <ChevronRight size={16} color={Colors.accent} />
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeInUp.delay(1200)} style={styles.emptyState}>
              <Animated.View style={[styles.emptyIcon, pulseAnimatedStyle]}>
                <Moon size={48} color={Colors.primary} />
              </Animated.View>
              <Text style={styles.emptyStateText}>No dreams recorded yet</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={navigateToNewDream}>
                <Text style={styles.emptyStateButtonText}>Record your first dream</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Section Dictionnaire */}
        <Animated.View entering={FadeInUp.delay(1400)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Symbols</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.symbolCard}
            onPress={navigateToDictionary}>
            <LinearGradient
              colors={Colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.symbolCardGradient}>
              
              <Animated.View style={[styles.symbolIcon, floatingAnimatedStyle]}>
                <BookOpen size={28} color={Colors.text.light} />
              </Animated.View>
              
              <View style={styles.symbolContent}>
                <Text style={styles.symbolCardTitle}>Symbol Dictionary</Text>
                <Text style={styles.symbolCardSubtitle}>
                  Discover the meaning of symbols in your dreams
                </Text>
              </View>
              
              <Animated.View style={sparkleAnimatedStyle}>
                <ChevronRight size={24} color={Colors.text.light} />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>

      {/* Modal de suppression avec Reanimated */}
      {showDeleteModal && (
        <Animated.View style={[styles.modalOverlay, modalOverlayStyle]}>
          <Animated.View style={[styles.modalContent, modalContentStyle]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AlertTriangle size={24} color={Colors.error} />
              </View>
              <Text style={styles.modalTitle}>Delete Dream</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={cancelDelete}>
                <X size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Are you sure you want to delete "{dreamToDelete?.title}"?
              </Text>
              <Text style={styles.modalSubtext}>
                This action cannot be undone.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
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
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: Colors.backgroundLight,
  },
  welcomeCard: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
    ...Colors.shadows.large,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  welcomeOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
    top: 60,
    left: 40,
  },
  sparkle3: {
    bottom: 40,
    right: 60,
  },
  welcomeContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text.light,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    lineHeight: 22,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Colors.shadows.medium,
  },
  welcomeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
    marginLeft: 10,
  },
  sectionContainer: {
    marginTop: 8,
    backgroundColor: Colors.backgroundLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: Colors.backgroundLight,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.text.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.accent,
    marginRight: 4,
  },
  dreamsContainer: {
    backgroundColor: Colors.backgroundLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    marginHorizontal: 16,
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Colors.shadows.medium,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    ...Colors.shadows.medium,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
  },
  symbolCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Colors.shadows.large,
  },
  symbolCardGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
  },
  symbolIcon: {
    marginRight: 16,
  },
  symbolContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  symbolCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.light,
    marginBottom: 8,
  },
  symbolCardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Colors.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
  },
  modalText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  modalSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    justifyContent: 'flex-end',
    backgroundColor: Colors.surface,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundMedium,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    ...Colors.shadows.medium,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
  },
  dreamDetailsInline: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: -8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Colors.shadows.small,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  viewAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundMedium,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  viewAnalysisButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: Colors.accent,
    marginRight: 6,
  },
});