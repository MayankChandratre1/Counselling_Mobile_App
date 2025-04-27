import { StyleSheet, View, FlatList, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomText from '../General/CustomText'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  capRound: string;
  ai?: number;
  year?: number;
}

const CutoffTable = ({cutoffs}: {
    cutoffs: Cutoff[]
}) => {
    const [cutoffsData, setCutoffsData] = useState<Cutoff[]>(cutoffs);
    const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
      setCutoffsData(cutoffs);
    }, [cutoffs]);

    // Extract round number from capRound string
    const getRoundNumber = (capRound: string) => {
      const matches = capRound.match(/\d+/);
      return matches ? Number(matches[0]) : 0;
    };

    // Group cutoffs by capRound for better organization
    const groupedCutoffs = cutoffsData.reduce((acc, cutoff) => {
      const roundKey = cutoff.capRound;
      if (!acc[roundKey]) {
        acc[roundKey] = [];
      }
      acc[roundKey].push(cutoff);
      return acc;
    }, {} as {[key: string]: Cutoff[]});

    // Sort capRounds numerically
    const sortedRoundKeys = Object.keys(groupedCutoffs).sort((a, b) => 
      getRoundNumber(a) - getRoundNumber(b)
    );

    const toggleExpand = (roundKey: string) => {
      setExpanded(prev => ({
        ...prev,
        [roundKey]: !prev[roundKey]
      }));
    };

    const renderCutoffItem = ({ item }: { item: Cutoff }) => (
      <View style={styles.tableRow}>
        <View style={styles.categoryCell}>
          <CustomText style={styles.categoryText}>{item.Category || "N/A"}</CustomText>
        </View>
        <View style={styles.rankCell}>
          <CustomText style={styles.rankText}>
            {item.rank}
          </CustomText>
        </View>
        <View style={styles.percentileCell}>
          <CustomText style={styles.percentileText}>
            {item.percentile.toFixed(2)}%
          </CustomText>
        </View>
      </View>
    );

    const renderRoundSection = (roundKey: string, cutoffs: Cutoff[]) => {
      const isExpandable = cutoffs.length > 3;
      const displayCutoffs = expanded[roundKey] ? cutoffs : cutoffs.slice(0, 3);
      const roundNumber = getRoundNumber(roundKey);
      
      return (
        <View key={roundKey} style={styles.roundSection}>
          <View style={styles.roundHeader}>
            <View style={styles.roundBadge}>
              <CustomText style={styles.roundBadgeText}>Round {roundNumber}</CustomText>
            </View>
            <CustomText style={styles.roundTitle}>CAP Round {roundNumber}</CustomText>
            
            {isExpandable && (
              <TouchableOpacity 
                onPress={() => toggleExpand(roundKey)}
                style={styles.expandButton}
                accessibilityLabel={expanded[roundKey] ? 
                  `Collapse CAP Round ${roundNumber}` : 
                  `Expand CAP Round ${roundNumber}`}
                accessibilityRole="button"
              >
                <Icon 
                  name={expanded[roundKey] ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#613EEA" 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.categoryCell}>
                <CustomText style={styles.headerText}>Category</CustomText>
              </View>
              <View style={styles.rankCell}>
                <CustomText style={styles.headerText}>Rank</CustomText>
              </View>
              <View style={styles.percentileCell}>
                <CustomText style={styles.headerText}>%ile</CustomText>
              </View>
            </View>
            
            {displayCutoffs.map((cutoff, id) => (
              <View key={cutoff.id+"_"+id} style={styles.tableRow}>
                <View style={styles.categoryCell}>
                  <CustomText style={styles.categoryText}>{cutoff.Category || "N/A"}</CustomText>
                </View>
                <View style={styles.rankCell}>
                  <CustomText style={styles.rankText}>
                    {cutoff.rank}
                  </CustomText>
                </View>
                <View style={styles.percentileCell}>
                  <CustomText style={styles.percentileText}>
                    {cutoff.percentile.toFixed(2)}%
                  </CustomText>
                </View>
              </View>
            ))}
            
            {isExpandable && !expanded[roundKey] && (
              <TouchableOpacity 
                style={styles.showMoreButton} 
                onPress={() => toggleExpand(roundKey)}
                accessibilityLabel={`Show ${cutoffs.length - 3} more entries for Round ${roundNumber}`}
                accessibilityRole="button"
              >
                <CustomText style={styles.showMoreText}>
                  Show {cutoffs.length - 3} more
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    };

    // If no cutoffs are available
    if (cutoffsData.length === 0) {
      return (
        <View style={styles.emptyCutoffs}>
          <Icon name="alert-circle-outline" size={48} color="#999" />
          <CustomText style={styles.emptyCutoffsText}>
            No cutoff data available for this branch
          </CustomText>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {sortedRoundKeys.map(roundKey => 
          renderRoundSection(roundKey, groupedCutoffs[roundKey])
        )}
        
        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
            Data shown is from previous year's cutoffs
          </CustomText>
        </View>
      </ScrollView>
    );
}

export default CutoffTable

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  roundSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8faff',
  },
  roundBadge: {
    backgroundColor: '#613EEA',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  roundBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  expandButton: {
    padding: 5,
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0FF',
  },
  headerText: {
    fontSize: SCREEN_WIDTH < 360 ? 13 : 14,
    fontWeight: 'bold',
    color: '#371981',
    textAlign: 'center',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  categoryCell: {
    flex: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: SCREEN_WIDTH < 360 ? 12 : 14,
    color: '#555',
    textAlign: 'left',
  },
  rankCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: '#F5FAFF',  // Highlighting rank cell
  },
  rankText: {
    fontSize: SCREEN_WIDTH < 360 ? 13 : 15,
    color: '#371981',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  percentileCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: '#F5FFF5',  // Highlighting percentile cell
  },
  percentileText: {
    fontSize: SCREEN_WIDTH < 360 ? 13 : 15,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  showMoreText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCutoffs: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyCutoffsText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});