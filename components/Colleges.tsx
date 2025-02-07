import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

interface College {
  id: string;
  instituteName: string;
  instituteCode: string;
  branchCode: string;
  branchName: string;
  category: string;
  rank: number;
  percentile: number;
  city: string;
}

const Colleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3001/api/colleges/');
      console.log(response);
      
      const data = await response.json();
      setColleges(data);
      setLoading(false);
    } catch (err) {
        console.log(err);
        
      setError('Failed to fetch colleges');
      setLoading(false);
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
    </View>
  );

  const renderItem = ({ item }: { item: College }) => (
    <View style={styles.tableRow}>
      <View style={styles.cell}><Text style={styles.cellText}>{item.instituteCode}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.instituteName}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.branchName}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.category}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.rank}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.percentile.toFixed(2)}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.city}</Text></View>
    </View>
  );

  if (loading) {
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
  }
});