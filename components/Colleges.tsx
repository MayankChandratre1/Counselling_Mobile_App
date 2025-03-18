import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

interface College {
  id: string;
  instituteName: string;
  instituteCode: string;
  branchCode: string;
  branchName: string;
  Category: string;
  rank: number;
  percentile: number;
  city: string;
  ai?: number;  // Add this property
}

const Colleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  const fetchColleges = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `http://10.0.2.2:3002/api/cutoffs?page=${pageNumber}&limit=10${lastDocId ? `&lastDocId=${lastDocId}` : ''}`
      );
      const data = await response.json();
      
      setHasMore(data.hasMore);
      setLastDocId(data.nextPageId);

      if (pageNumber === 1) {
        setColleges(data.cutoffs);
      } else {
        if(data.cutoffs.length > 0) {
          setColleges(prev => [...prev, ...data.cutoffs]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch colleges');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchColleges(page + 1);
    }
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.headerCell}><Text style={styles.headerText}>Code</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Institute</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Branch</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Category</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Rank</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>%ile</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>City</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>AI</Text></View>
    </View>
  );

  const renderItem = ({ item }: { item: College }) => (
    <View style={styles.tableRow}>
      <View style={styles.cell}><Text style={styles.cellText}>{item.instituteCode}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.instituteName}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.branchName}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.Category}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.rank}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.percentile.toFixed(2)}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.city}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>90%</Text></View>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView horizontal style={styles.container}>
      <View>
        <TableHeader />
        <FlatList
          data={colleges}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color="#371981" />
              </View>
            ) : null
          }
        />
      </View>
    </ScrollView>
  );
}

export default Colleges

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding:10
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFE94B',
    borderBottomWidth: 1,
    borderColor: '#FFD700',
    borderRadius:"10px"
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerCell: {
    width: 150,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#FFD700',
  },
  cell: {
    width: 150,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});