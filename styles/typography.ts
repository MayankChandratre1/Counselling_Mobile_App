// src/styles/typography.ts
import { Platform, TextStyle } from 'react-native';

// Use platform-specific fonts for better cross-platform consistency
export const FONTS = {
  REGULAR: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  MEDIUM: Platform.OS === 'ios' ? 'Helvetica Neue-Medium' : 'sans-serif-medium',
  BOLD: Platform.OS === 'ios' ? 'Helvetica Neue-Bold' : 'sans-serif-bold',
  LIGHT: Platform.OS === 'ios' ? 'Helvetica Neue-Light' : 'sans-serif-light',
  ITALIC: Platform.OS === 'ios' ? 'Helvetica Neue-Italic' : 'sans-serif-italic',
};

// Font size scale
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
};

// Line heights
export const LINE_HEIGHT = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 36,
};

// Common text styles
export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontFamily: FONTS.BOLD,
    lineHeight: 34,
    color: '#333333',
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontFamily: FONTS.BOLD,
    lineHeight: 28,
    color: '#333333',
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    lineHeight: 24,
    color: '#333333',
  } as TextStyle,
  body1: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    lineHeight: 22,
    color: '#333333',
  } as TextStyle,
  body2: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    lineHeight: 20,
    color: '#333333',
  } as TextStyle,
  button: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.md,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    lineHeight: 16,
    color: '#666666',
  } as TextStyle,
};