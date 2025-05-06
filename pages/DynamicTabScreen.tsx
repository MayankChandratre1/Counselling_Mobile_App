import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import TopBar from '../components/General/TopBar';
import { useRoute } from '@react-navigation/native';

interface DynamicContentScreenProps {
  route: {
    params: {
      title: string;
      html?: string | null;
      url?: string | null;
    };
  };
}

const DynamicContentScreen = () => {
  const route = useRoute();
  const { title, html, url } = route.params as DynamicContentScreenProps['route']['params'];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = html 
    ? { html }
    : url 
    ? { uri: url }
    : null;

  return (
    <>
      <TopBar heading={title} />
      <View style={styles.container}>
        {content ? (
          <WebView
            source={content}
            style={styles.webView}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load content');
            }}
          />
        ) : (
          <Text style={styles.errorText}>No content available</Text>
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#613EEA" />
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    padding: 20,
  },
});

export default DynamicContentScreen;