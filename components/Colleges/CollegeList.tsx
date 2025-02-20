import { StyleSheet, View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import CollegeCard from './CollegeCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import config from '../../configs/API';

interface College {
  id: string;
  instituteName: string;
  city: string;
  image?: string;
}

const {COLLEGE_API} = config;

const CollegeList = ({ navigation }: any) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const fetchColleges = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `${COLLEGE_API}/colleges?page=${pageNumber}&limit=10&lastDocId=${lastDocId || ''}`
      );
      const data = await response.json();

      console.log(data.nextPageId);
            
      
      if (data.colleges.length < 10) {
        setHasMore(false);
      }
      
      if (pageNumber === 1) {
        setColleges(data.colleges || []);
      } else {
        if(data.colleges.length > 0) {
        setColleges(prev => [...prev, ...data.colleges]);
        }
      }

      setLastDocId(data.nextPageId);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch colleges');
      setLoading(false);
    }
  };

  const handleSearch = async (pageNumber: number = 1) => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      fetchColleges(1);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${COLLEGE_API}/colleges/search?instituteName=${encodeURIComponent(searchQuery)}&page=${pageNumber}&limit=5`
      );
      const data = await response.json();
      
      if (data.colleges.length < 5) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (pageNumber === 1) {
        setColleges(data.colleges || []);
      } else {
        if (data.colleges.length > 0) {
          setColleges(prev => [...prev, ...data.colleges]);
        }
      }

      setIsSearchMode(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to search colleges');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      if (isSearchMode) {
        handleSearch(nextPage);
      } else {
        fetchColleges(nextPage);
      }
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#371981" />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#371981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search colleges..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.length === 0) {
              setIsSearchMode(false);
              setPage(1);
              fetchColleges(1);
            }
          }}
        />
        <TouchableOpacity 
          onPress={() => {
            setPage(1);
            handleSearch(1);
          }} 
          style={styles.searchButton}
        >
          <Icon name="magnify" size={24} color="#371981" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={colleges}
        renderItem={({ item }) => (
          <CollegeCard
            college={item}
            onPress={() => navigation.navigate('CollegeDetails', { collegeId: item.id, instituteName: item.instituteName, city: item.city })}
          />
        )}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

export default CollegeList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  searchButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  }
});