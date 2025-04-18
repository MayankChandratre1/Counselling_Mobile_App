import { StyleSheet } from 'react-native';
import { FONTS } from './typography';

export const globalStyles = StyleSheet.create({
  // Text styles
  text: {
    color: '#333333',
    fontFamily: FONTS.REGULAR,
  },
  
  // Input styles
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
    fontFamily: FONTS.REGULAR,
    backgroundColor: '#ffffff',
  },
  
  // Picker styles
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
  },
  pickerItem: {
    fontFamily: FONTS.REGULAR,
    color: '#333333',
  },
});
