import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { FONTS } from '../../styles/typography';
import CustomText from './CustomText';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  style,
  placeholderTextColor = '#999',
  label,
  error,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <TextInput
        style={[styles.input, error ? styles.inputError : {}, style]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
      {error && <CustomText style={styles.errorText}>{error}</CustomText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: '100%',
  },
  input: {
    fontFamily: FONTS.REGULAR,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CustomTextInput;
