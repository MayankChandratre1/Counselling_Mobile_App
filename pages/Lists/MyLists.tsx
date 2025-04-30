import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Animated,
  RefreshControl
} from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import TopBar from '../../components/General/TopBar'
import { RequestMethod, secureRequest } from '../../utils/tokenedRequest'
import config from '../../configs/API'
import CustomText from '../../components/General/CustomText'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { FONTS } from '../../styles/typography'

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MyLists = ({ navigation }:any) => {
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const fetchLists = async () => {
        try {
            setError(null);
            const response = await secureRequest<any>(`${config.USER_API}/lists`, RequestMethod.GET);
            
            // Sort lists by updatedAt in descending order
            const sortedLists = response.data.sort((a: any, b: any) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setLists(sortedLists);
        } catch(err) {
            console.error("Error fetching lists:", err);
            setError('Failed to fetch your college lists. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchLists();
        
        // Animate the cards when component mounts
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true
        }).start();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLists();
    }, []);

    const handleSelectList = (list: any) => {
        // Navigate to list details page
        navigation.navigate('ListDetails', { list });
    }

    const renderListCard = ({ item }: { item: any }) => {
        const collegeCount = item.colleges.length;
        const listDate = new Date(item.updatedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return (
            <Animated.View 
                style={[
                    styles.cardWrapper, 
                    { transform: [{ scale: scaleAnim }], opacity: scaleAnim }
                ]}
            >
                <TouchableOpacity 
                    style={styles.listCard}
                    onPress={() => handleSelectList(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="format-list-bulleted" size={22} color="#fff" />
                            </View>
                            <CustomText style={styles.listTitle} numberOfLines={1}>
                                {item.title}
                            </CustomText>
                        </View>
                        <MaterialIcons 
                            name="keyboard-arrow-right" 
                            size={24} 
                            color="#371981" 
                        />
                    </View>
                    
                    <View style={styles.cardContent}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="school" size={18} color="#666" />
                            <CustomText style={styles.infoText}>
                                {collegeCount} {collegeCount === 1 ? 'college' : 'colleges'}
                            </CustomText>
                        </View>
                        
                        <View style={styles.infoItem}>
                            <MaterialIcons name="event" size={18} color="#666" />
                            <CustomText style={styles.infoText}>{listDate}</CustomText>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome5 name="clipboard-list" size={80} color="#ddd" />
            <CustomText style={styles.emptyTitle}>No Lists Found</CustomText>
            <CustomText style={styles.emptyText}>
                You haven't created any college lists yet. Your counsellor will help you create lists.
            </CustomText>
            
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Browse')}>
                <CustomText style={styles.browseButtonText}>Browse Colleges</CustomText>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={80} color="#FF6B6B" />
            <CustomText style={styles.errorTitle}>Error Loading Lists</CustomText>
            <CustomText style={styles.errorText}>{error}</CustomText>
            
            <TouchableOpacity style={styles.retryButton} onPress={fetchLists}>
                <CustomText style={styles.retryButtonText}>Try Again</CustomText>
                <MaterialIcons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TopBar heading="My Lists" />
            
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#371981" />
                    <CustomText style={styles.loadingText}>Loading your lists...</CustomText>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={lists}
                    renderItem={renderListCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[
                        styles.listContainer,
                        lists.length === 0 && styles.emptyListContainer
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            colors={["#371981"]}
                            tintColor="#371981"
                        />
                    }
                />
            )}
        </View>
    )
}

export default MyLists

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        color: '#666',
        fontSize: 16,
        fontFamily: FONTS.MEDIUM,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        marginBottom: 20,
    },
    listCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        overflow: 'hidden',
    },
    selectedCard: {
        borderColor: '#371981',
        borderWidth: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#371981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    cardContent: {
        padding: 16,
        paddingTop: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    viewButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e6e9f0',
    },
    viewButtonText: {
        color: '#371981',
        fontWeight: '600',
        marginRight: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        maxWidth: SCREEN_WIDTH * 0.8,
        lineHeight: 22,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginTop: 20,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        maxWidth: SCREEN_WIDTH * 0.8,
        lineHeight: 22,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#371981',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#371981',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    }
});