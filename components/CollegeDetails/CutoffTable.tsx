import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
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
    // If no cutoffs are available
    if (cutoffs.length === 0) {
      return (
        <View style={styles.emptyCutoffs}>
          <Icon name="alert-circle-outline" size={48} color="#999" />
          <CustomText style={styles.emptyCutoffsText}>
            No cutoff data available for this selection
            Try changing the filters or year.
          </CustomText>
        </View>
      );
    }

    // Get round info from first cutoff for the table header
    const firstCutoff = cutoffs[0];
    const capRound = firstCutoff?.capRound || '';
    
    // Extract round number
    const getRoundNumber = (capRound: string) => {
      const matches = capRound.match(/\d+/);
      return matches ? Number(matches[0]) : 0;
    };
    
    const roundNumber = getRoundNumber(capRound);
    const yearDisplay = firstCutoff?.year || "previous";

    return (
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Single Cutoff Table */}
        <View style={styles.roundSection}>
          <View style={styles.roundHeader}>
            <View style={styles.roundBadge}>
              <CustomText style={styles.roundBadgeText}>
                Round {roundNumber}
              </CustomText>
            </View>
            <CustomText style={styles.roundTitle}>
              CAP Round {roundNumber}
              {firstCutoff?.year && ` (${firstCutoff.year})`}
            </CustomText>
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
            
            {cutoffs.map((cutoff, id) => (
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
          </View>
        </View>
        
        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
            Data shown is from {yearDisplay} year's cutoffs
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
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    marginInline:5
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
  },
  // New styles for selectors
  selectorContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
    marginHorizontal: 5,
  },
  selectorGroup: {
    marginBottom: 0,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activePill: {
    backgroundColor: '#613EEA',
    borderColor: '#613EEA',
  },
  pillText: {
    fontSize: 13,
    color: '#555',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noDataRow: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  noDataText: {
    color: '#888',
    fontStyle: 'italic',
  },
});