import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Modal, Text } from 'react-native'
import React, { useState } from 'react'
import CustomText from '../General/CustomText'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { categories } from '../../data/categories';

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

// Function to highlight the matching category in the text
const HighlightedCategoryText = ({ fullCategory }: { fullCategory: string }) => {
  // Find which category from our list is part of the full category string
  const matchingCategory = categories.find(cat => 
    fullCategory.includes(cat)
  );

  if (!matchingCategory) {
    // No matching category found, return the original text
    return <CustomText style={styles.categoryText}>{fullCategory || "N/A"}</CustomText>;
  }

  // Split the text to highlight just the matching part
  const startIndex = fullCategory.indexOf(matchingCategory);
  const endIndex = startIndex + matchingCategory.length;
  
  const beforeMatch = fullCategory.substring(0, startIndex);
  const match = fullCategory.substring(startIndex, endIndex);
  const afterMatch = fullCategory.substring(endIndex);

  return (
    <CustomText style={styles.categoryText}>
      {beforeMatch}
      <CustomText style={styles.highlightedCategory}>{match}</CustomText>
      {afterMatch}
    </CustomText>
  );
};

// Legend modal component with improved scrolling and navigation arrows
const LegendModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  
  const legendItems = [
    { key: "G", label: "General", description: "Indicates a seat open to all candidates, regardless of gender." },
    { key: "L", label: "Ladies", description: "Indicates a seat reserved specifically for female candidates." },
    { key: "DEF", label: "Defence", description: "Indicates a seat reserved for candidates from defence backgrounds." },
    { key: "PWD", label: "Persons with Disabilities", description: "Indicates a seat reserved for candidates with disabilities." },
    { key: "H", label: "Home University", description: "Indicates a seat reserved for candidates who graduated from the same university as the admitting institution." },
    { key: "O", label: "Other than Home University", description: "Indicates a seat open to candidates who graduated from a university different from the admitting institution." },
    { key: "S", label: "State Level", description: "Indicates a seat open to candidates from within the state." },
    { key: "AI", label: "All India Seat", description: "Indicates a seat open to candidates from all over India. (JEE)" },
  ];
  
  const navigateNext = () => {
    if (currentItemIndex < legendItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };
  
  const navigatePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={styles.modalContainer} 
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Category Abbreviations</CustomText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={22} color="#371981" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.legendNavigation}>
              <TouchableOpacity 
                style={[styles.navButton, currentItemIndex === 0 && styles.navButtonDisabled]} 
                onPress={navigatePrevious}
                disabled={currentItemIndex === 0}
              >
                <MaterialIcons name="keyboard-arrow-left" size={24} color={currentItemIndex === 0 ? "#CCCCCC" : "#371981"} />
              </TouchableOpacity>
              <Text style={styles.navText}>{`${currentItemIndex + 1} / ${legendItems.length}`}</Text>
              <TouchableOpacity 
                style={[styles.navButton, currentItemIndex === legendItems.length - 1 && styles.navButtonDisabled]} 
                onPress={navigateNext}
                disabled={currentItemIndex === legendItems.length - 1}
              >
                <MaterialIcons name="keyboard-arrow-right" size={24} color={currentItemIndex === legendItems.length - 1 ? "#CCCCCC" : "#371981"} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.legendItem}>
              <View style={{}}>
                <CustomText style={styles.keyText}>{legendItems[currentItemIndex].key}</CustomText>
              </View>
              <View style={styles.legendTextContainer}>
                <CustomText style={styles.legendLabel}>{legendItems[currentItemIndex].label}</CustomText>
                <CustomText style={styles.legendDescription}>{legendItems[currentItemIndex].description}</CustomText>
              </View>
            </View>
            
            <View style={styles.legendPagination}>
              {legendItems.map((_, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.paginationDot, index === currentItemIndex && styles.paginationDotActive]} 
                  onPress={() => setCurrentItemIndex(index)}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const CutoffTable = ({cutoffs}: {
    cutoffs: Cutoff[]
}) => {
    const [isLegendVisible, setIsLegendVisible] = useState(false);
    
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
            
            {/* Help Button */}
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => setIsLegendVisible(true)}
              accessibilityLabel="Show category abbreviations"
            >
              <Ionicons name="help-circle-outline" size={22} color="#371981" />
            </TouchableOpacity>
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
                  <HighlightedCategoryText fullCategory={cutoff.Category || "N/A"} />
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
          <TouchableOpacity 
            style={styles.legendLink}
            onPress={() => setIsLegendVisible(true)}
          >
            <CustomText style={styles.legendLinkText}>
              What do G, L, O, H, S mean?
            </CustomText>
          </TouchableOpacity>
        </View>
        
        {/* Legend Modal */}
        <LegendModal
          visible={isLegendVisible}
          onClose={() => setIsLegendVisible(false)}
        />
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
  highlightedCategory: {
    color: '#371981',
    // fontWeight: 'bold',
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
  // New styles for help button
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    marginLeft: 8,
  },
  
  // New styles for legend link
  legendLink: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  legendLinkText: {
    color: '#371981',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  
  // Updated and new modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    padding: 5,
  },
  legendNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  navText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  legendItem: {
    // flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: '#F8F8FC',
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#371981',
    minHeight: 100,
  },
  legendPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#371981',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})