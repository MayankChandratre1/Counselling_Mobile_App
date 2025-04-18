import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopBar from '../../components/General/TopBar'
import { RequestMethod, secureRequest } from '../../utils/tokenedRequest'
import config from '../../configs/API'
import ListDetails from '../../components/Lists/ListDetails'
import CustomText from '../../components/General/CustomText'

const MyLists = () => {
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedList, setSelectedList] = useState<string | null>(null);

    const fetchLists = async () => {
        try {
            const response = await secureRequest<any>(`${config.USER_API}/lists`,RequestMethod.GET);
            // Sort lists by updatedAt in descending order
            console.log("Lists: ",response.data);
            
            const sortedLists = response.data.sort((a: any, b: any) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setLists(sortedLists);
            setLoading(false);
        } catch(err) {
            setError('Failed to fetch lists');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLists();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#613EEA" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <CustomText style={styles.error}>{error}</CustomText>
            </View>
        );
    }

    if (selectedList) {
        return (
            <ListDetails 
                title={lists.find(l => l.id === selectedList)?.title || ''} 
                colleges={lists.find(l => l.id === selectedList)?.colleges || []}
            />
        );
    }

    return (
        <>
            <TopBar heading="My Lists" />
            <ScrollView style={styles.container}>
                {lists.length === 0 ? (
                    <CustomText style={styles.noLists}>No lists found</CustomText>
                ) : (
                    lists.map((list) => (
                        <View key={list.id}>
                            <TouchableOpacity 
                                style={[
                                    styles.listCard,
                                    selectedList === list.id && styles.selectedCard
                                ]}
                                onPress={() => setSelectedList(selectedList === list.id ? null : list.id)}
                            >
                                <CustomText style={styles.listTitle}>{list.title}</CustomText>
                                <CustomText style={styles.listInfo}>
                                    {list.colleges.length} colleges • {new Date(list.updatedAt).toLocaleDateString()}
                                </CustomText>
                            </TouchableOpacity>
                            {selectedList === list.id && (
                                <ListDetails 
                                    title={list.title} 
                                    colleges={list.colleges}
                                />
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
    noLists: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    listCard: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
    },
    selectedCard: {
        backgroundColor: '#F0F4FF',
        borderColor: '#613EEA',
        borderWidth: 1,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listInfo: {
        color: '#666',
        marginTop: 5,
        fontSize: 14,
    },
})

export default MyLists