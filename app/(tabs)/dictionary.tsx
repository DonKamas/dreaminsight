import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { HeaderBar } from '@/components/HeaderBar';
import { dreamSymbols } from '@/data/mockData';

export default function DictionaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = [
    'All', 
    'Animals', 
    'Nature', 
    'Objects', 
    'People', 
    'Places', 
    'Actions'
  ];
  
  const filteredSymbols = dreamSymbols.filter(symbol => {
    const matchesSearch = symbol.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || symbol.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  const renderSymbolItem = ({ item }) => (
    <TouchableOpacity style={styles.symbolItem}>
      <View>
        <Text style={styles.symbolName}>{item.name}</Text>
        <Text style={styles.symbolMeaning} numberOfLines={2}>{item.shortMeaning}</Text>
      </View>
      <ArrowRight size={16} color={Colors.accent} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <HeaderBar title="Dream Symbol Dictionary" />
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dream symbols..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  activeCategory === item && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(item)}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === item && styles.activeCategoryText
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        <FlatList
          data={filteredSymbols}
          renderItem={renderSymbolItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.symbolsList}
          style={styles.symbolsListContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No symbols found</Text>
              <Text style={styles.emptyStateText}>
                Try searching for a different term or browse all categories
              </Text>
            </View>
          }
        />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.backgroundLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
    paddingVertical: 4,
  },
  filterButton: {
    marginLeft: 12,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.backgroundLight,
  },
  categoriesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: Colors.backgroundMedium,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  activeCategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeCategoryText: {
    color: Colors.text.light,
  },
  symbolsListContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  symbolsList: {
    padding: 16,
  },
  symbolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Colors.shadows.small,
  },
  symbolName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  symbolMeaning: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    maxWidth: '90%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});