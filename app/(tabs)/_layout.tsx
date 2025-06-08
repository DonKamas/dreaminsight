import React from 'react';
import { Tabs } from 'expo-router';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Book, Chrome as Home, Moon, Search, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  const useCompactLabels = screenWidth < 375;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 70 + (Platform.OS === 'ios' ? insets.bottom : 0),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: Colors.text.primary,
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: useCompactLabels ? 'Home' : 'Dream Journal',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Home 
                size={focused ? 26 : 24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="new-dream"
        options={{
          title: 'New Dream',
          tabBarLabel: 'New',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Moon 
                size={focused ? 26 : 24} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarLabel: 'Analysis',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Book 
                size={focused ? 26 : 24} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: 'Symbol Dictionary',
          tabBarLabel: 'Symbols',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Search 
                size={focused ? 26 : 24} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <User 
                size={focused ? 26 : 24} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
    ...Colors.shadows.large,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  tabBarIcon: {
    marginBottom: -2,
  },
  header: {
    backgroundColor: Colors.backgroundLight,
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
});