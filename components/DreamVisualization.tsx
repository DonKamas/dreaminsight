import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Image as ImageIcon, Download, Share2, X, Palette, Wand as Wand2, Eye } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ImageGenerationService } from '@/services/imageGeneration';

interface DreamVisualizationProps {
  dream: {
    title: string;
    content: string;
    emotion: string;
  };
  isPremium: boolean;
  onUpgradePress?: () => void;
}

export function DreamVisualization({ dream, isPremium, onUpgradePress }: DreamVisualizationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'realistic' | 'artistic' | 'surreal' | 'minimalist'>('artistic');
  const [showFullImage, setShowFullImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStyles, setShowStyles] = useState(false);

  // Animations
  const sparkleRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
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

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const artStyles = [
    { 
      id: 'artistic', 
      name: 'Artistic', 
      description: 'Painterly, impressionistic style',
      icon: '🎨',
      gradient: ['#ff6b6b', '#feca57'],
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    { 
      id: 'realistic', 
      name: 'Realistic', 
      description: 'Photorealistic, cinematic',
      icon: '📸',
      gradient: ['#48cae4', '#023e8a'],
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    { 
      id: 'surreal', 
      name: 'Surreal', 
      description: 'Dreamlike, impossible geometry',
      icon: '🌀',
      gradient: ['#b794f6', '#667eea'],
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    { 
      id: 'minimalist', 
      name: 'Minimalist', 
      description: 'Clean, simple, elegant',
      icon: '⚪',
      gradient: ['#a8edea', '#fed6e3'],
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }
  ];

  const handleGenerateImage = async () => {
    if (!isPremium) {
      onUpgradePress?.();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await ImageGenerationService.generateDreamVisualization({
        title: dream.title,
        content: dream.content,
        emotion: dream.emotion,
        style: selectedStyle
      });

      setGeneratedImage(result.imageUrl);
    } catch (error: any) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Download functionality would be implemented here');
  };

  if (generatedImage) {
    return (
      <Animated.View style={componentStyles.container} entering={FadeInUp}>
        <View style={componentStyles.header}>
          <View style={componentStyles.titleContainer}>
            <Animated.View style={sparkleAnimatedStyle}>
              <Sparkles size={20} color={Colors.primary} />
            </Animated.View>
            <Text style={componentStyles.title}>Dream Visualization</Text>
            <View style={[componentStyles.premiumBadge, { backgroundColor: Colors.primary }]}>
              <Text style={componentStyles.premiumBadgeText}>AI Generated</Text>
            </View>
          </View>
          <View style={componentStyles.actionButtons}>
            <TouchableOpacity 
              style={componentStyles.actionButton}
              onPress={handleShare}
              activeOpacity={0.8}>
              <Share2 size={16} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={componentStyles.actionButton}
              onPress={handleDownload}
              activeOpacity={0.8}>
              <Download size={16} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={componentStyles.imageContainer}
          onPress={() => setShowFullImage(true)}
          activeOpacity={0.9}>
          <Image 
            source={{ uri: generatedImage }}
            style={componentStyles.dreamImage}
            resizeMode="cover"
          />
          <View style={componentStyles.imageOverlay}>
            <Eye size={20} color={Colors.text.light} />
            <Text style={componentStyles.viewFullText}>Tap to view full size</Text>
          </View>
        </TouchableOpacity>

        <View style={componentStyles.regenerateContainer}>
          <TouchableOpacity 
            style={componentStyles.regenerateButton}
            onPress={() => setShowStyles(!showStyles)}
            activeOpacity={0.8}>
            <Palette size={16} color={Colors.primary} />
            <Text style={componentStyles.regenerateText}>Change Style</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[componentStyles.regenerateButton, isGenerating && componentStyles.regenerateButtonDisabled]}
            onPress={handleGenerateImage}
            disabled={isGenerating}
            activeOpacity={0.8}>
            {isGenerating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Wand2 size={16} color={Colors.primary} />
            )}
            <Text style={componentStyles.regenerateText}>
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </Text>
          </TouchableOpacity>
        </View>

        {showStyles && (
          <View style={componentStyles.stylesWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={componentStyles.stylesScrollContent}
              style={componentStyles.stylesScrollView}>
              {artStyles.map((style, index) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    componentStyles.styleOption,
                    { backgroundColor: style.backgroundColor },
                    selectedStyle === style.id && componentStyles.selectedStyleOption
                  ]}
                  onPress={() => {
                    setSelectedStyle(style.id as any);
                    setShowStyles(false);
                  }}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={style.gradient}
                    style={componentStyles.styleIconContainer}>
                    <Text style={componentStyles.styleIcon}>{style.icon}</Text>
                  </LinearGradient>
                  <View style={componentStyles.styleInfo}>
                    <Text style={componentStyles.styleName}>{style.name}</Text>
                    <Text style={componentStyles.styleDescription}>{style.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Full Image Modal */}
        <Modal
          visible={showFullImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullImage(false)}>
          <View style={componentStyles.fullImageModal}>
            <TouchableOpacity 
              style={componentStyles.closeButton}
              onPress={() => setShowFullImage(false)}>
              <X size={24} color={Colors.text.light} />
            </TouchableOpacity>
            <Image 
              source={{ uri: generatedImage }}
              style={componentStyles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={componentStyles.container} entering={FadeIn}>
      <View style={componentStyles.header}>
        <View style={componentStyles.titleContainer}>
          <Animated.View style={sparkleAnimatedStyle}>
            <Sparkles size={20} color={Colors.primary} />
          </Animated.View>
          <Text style={componentStyles.title}>Dream Visualization</Text>
          {!isPremium && (
            <View style={[componentStyles.premiumBadge, { backgroundColor: Colors.accent }]}>
              <Text style={componentStyles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>
      </View>

      {error && (
        <Animated.View style={componentStyles.errorContainer} entering={FadeIn}>
          <Text style={componentStyles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={componentStyles.retryButton}
            onPress={handleGenerateImage}
            activeOpacity={0.8}>
            <Text style={componentStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={componentStyles.generateContainer}>
        <LinearGradient
          colors={isPremium ? Colors.gradients.primary : ['#e2e8f0', '#cbd5e1']}
          style={componentStyles.generateGradient}>
          
          <View style={componentStyles.generateContent}>
            <Animated.View style={[componentStyles.iconContainer, pulseAnimatedStyle]}>
              <ImageIcon size={32} color={isPremium ? Colors.text.light : Colors.text.secondary} />
            </Animated.View>
            
            <Text style={[componentStyles.generateTitle, !isPremium && componentStyles.lockedText]}>
              {isPremium ? 'Generate AI Visualization' : 'Premium Feature'}
            </Text>
            
            <Text style={[componentStyles.generateDescription, !isPremium && componentStyles.lockedText]}>
              {isPremium 
                ? 'Transform your dream into a beautiful AI-generated image'
                : 'Upgrade to Premium to generate stunning AI visualizations of your dreams'
              }
            </Text>

            {isPremium && (
              <>
                <View style={componentStyles.stylePreview}>
                  <Text style={componentStyles.stylePreviewText}>Style: {selectedStyle}</Text>
                  <TouchableOpacity 
                    style={componentStyles.changeStyleButton}
                    onPress={() => setShowStyles(!showStyles)}
                    activeOpacity={0.8}>
                    <Palette size={14} color={Colors.text.light} />
                    <Text style={componentStyles.changeStyleText}>Change</Text>
                  </TouchableOpacity>
                </View>

                {showStyles && (
                  <View style={componentStyles.stylesWrapper}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={componentStyles.stylesScrollContent}
                      style={componentStyles.stylesScrollView}>
                      {artStyles.map((style, index) => (
                        <TouchableOpacity
                          key={style.id}
                          style={[
                            componentStyles.styleOption,
                            { backgroundColor: style.backgroundColor },
                            selectedStyle === style.id && componentStyles.selectedStyleOption
                          ]}
                          onPress={() => {
                            setSelectedStyle(style.id as any);
                            setShowStyles(false);
                          }}
                          activeOpacity={0.8}>
                          <LinearGradient
                            colors={style.gradient}
                            style={componentStyles.styleIconContainer}>
                            <Text style={componentStyles.styleIcon}>{style.icon}</Text>
                          </LinearGradient>
                          <View style={componentStyles.styleInfo}>
                            <Text style={componentStyles.styleName}>{style.name}</Text>
                            <Text style={componentStyles.styleDescription}>{style.description}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={componentStyles.generateButtonContainer}>
                  <TouchableOpacity 
                    style={[
                      componentStyles.generateButton,
                      isGenerating && componentStyles.generateButtonDisabled
                    ]}
                    onPress={handleGenerateImage}
                    disabled={isGenerating || !isPremium}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={isGenerating ? ['#94a3b8', '#64748b'] : Colors.gradients.primary}
                      style={componentStyles.generateButtonGradient}>
                      {isGenerating ? (
                        <ActivityIndicator size="small" color={Colors.text.light} />
                      ) : (
                        <Wand2 size={20} color={Colors.text.light} />
                      )}
                      <Text style={componentStyles.generateButtonText}>
                        {isGenerating ? 'Generating...' : 'Generate Image'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const componentStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    overflow: 'hidden',
    ...Colors.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginLeft: 8,
    marginRight: 12,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: Colors.text.light,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Colors.shadows.medium,
  },
  dreamImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.backgroundMedium,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewFullText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.light,
    marginLeft: 6,
  },
  regenerateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  regenerateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
  generateContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  generateGradient: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  generateContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginBottom: 16,
  },
  generateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.light,
    marginBottom: 8,
    textAlign: 'center',
  },
  generateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  lockedText: {
    color: Colors.text.secondary,
  },
  stylePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stylePreviewText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.light,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  changeStyleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeStyleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.light,
    marginLeft: 4,
  },
  stylesWrapper: {
    backgroundColor: 'transparent',
    marginTop: 12,
    marginBottom: 16,
    height: 80,
  },
  stylesScrollView: {
    backgroundColor: 'transparent',
  },
  stylesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    width: 230,
    height: 'auto',
    minHeight: 64,
    shadowColor: 'transparent',
    elevation: 0,
  },
  selectedStyleOption: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  styleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  styleIcon: {
    fontSize: 20,
  },
  styleInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  styleName: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
  },
  styleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
  },
  generateButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Colors.shadows.medium,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.light,
    marginLeft: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}15`,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.light,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  styleModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...Colors.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
});