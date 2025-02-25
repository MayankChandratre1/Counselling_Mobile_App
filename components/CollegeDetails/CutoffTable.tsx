import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

interface Cutoff {
  id: string;
  instituteName: string;
  instituteCode: string;
  branchCode: string;
  branchName: string;
  Category: string;
  rank: number;
  percentile: number;
  city: string;
  capRound: string
}

const CutoffTable = ({cutoffs}:{
    cutoffs: Cutoff[]
}) => {
    const [cutoffsData, setCutoffsData] = useState<Cutoff[]>(cutoffs);

    useEffect(() => {
      setCutoffsData(cutoffs);
    }, [cutoffs]);

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.headerCell, {
        width: 70,
      }]}><Text style={styles.headerText}>Cap</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Category</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>Rank</Text></View>
      <View style={styles.headerCell}><Text style={styles.headerText}>%</Text></View>
    </View>
  );

  const renderItem = ({ item }: { item: Cutoff }) => (
    <View style={styles.tableRow}>
      <View style={[styles.cell, , {
        width: 70,
      }]}><Text style={styles.cellText}>{parseInt(item.capRound.split(" ")[1])}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.Category ?? "N/A"}</Text></View>
      <View style={styles.cell}><Text style={[styles.cellText, {
        fontWeight
          : 'bold',
      }]}>{item.rank}</Text></View>
      <View style={styles.cell}><Text style={styles.cellText}>{item.percentile.toFixed(2)}</Text></View>
    </View>
  );

 

  return (
    <ScrollView horizontal style={styles.container}>
      <View>
        <TableHeader />
        <FlatList
          data={cutoffsData}
          renderItem={renderItem}
          keyExtractor={item => item.id}          
        />
      </View>
    </ScrollView>
  );
}

export default CutoffTable

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
    backgroundColor: '#FACD649C',
    borderBottomWidth: 1,
    borderColor: '#FACD64',
    
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerCell: {
    width: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#FFD700',
  },
  cell: {
    width: 100,
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