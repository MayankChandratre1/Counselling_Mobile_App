import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const tabs = ["About", "Cutoff", "Fees", "Gallery"];

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const TabBar = ({ activeTab, onTabPress }: TabBarProps) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabPress(tab)}
          style={styles.tab}
        >
          <Text style={styles.tabText}>{tab}</Text>
          {activeTab === tab && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default TabBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#613EEA',
    borderRadius: 3,
  },
})
