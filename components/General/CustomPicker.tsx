import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FONTS } from '../../styles/typography';
import CustomText from './CustomText';

interface CustomPickerProps {
  label?: string;
  selectedValue: string | number;
  onValueChange: (value: any, index: number) => void;
  items: Array<{label: string, value: string | number}>;
  style?: any;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  style,
}) => {
  return (
    <View style={styles.container}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <View style={[styles.pickerContainer, style]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#333"
        >
          {items.map((item, index) => (
            <Picker.Item 
              key={index} 
              label={item.label} 
              value={item.value} 
              color="#333333" 
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: '100%',
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: '#333333',
    fontFamily: FONTS.REGULAR,
  },
  pickerItem: {
    fontFamily: FONTS.REGULAR,
    color: '#333333',
    fontSize: 16,
  },
});

export default CustomPicker;
