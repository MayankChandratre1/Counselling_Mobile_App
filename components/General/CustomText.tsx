import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { FONTS, TYPOGRAPHY } from '../../styles/typography';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'bold';
}

const CustomText: React.FC<CustomTextProps> = ({ 
  children, 
  style, 
  variant = 'body1',
  ...props
}) => {
  const getTextStyle = () => {
    switch (variant) {
      case 'h1': return TYPOGRAPHY.h1;
      case 'h2': return TYPOGRAPHY.h2;
      case 'h3': return TYPOGRAPHY.h3;
      case 'body2': return TYPOGRAPHY.body2;
      case 'caption': return TYPOGRAPHY.caption;
      case 'bold': return { ...TYPOGRAPHY.body1, fontFamily: FONTS.BOLD };
      default: return TYPOGRAPHY.body1;
    }
  };

  return (
    <RNText 
      style={[styles.defaultText, getTextStyle(), style]} 
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: FONTS.REGULAR,
    color: '#333333', // Default text color for better visibility
  },
});

export default CustomText;
