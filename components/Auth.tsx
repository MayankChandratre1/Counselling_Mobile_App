import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import firebase from '@react-native-firebase/app'

const Auth = () => {
    useEffect(() => {
        // Check if Firebase is initialized
        try {
            const apps = firebase.apps
            if (apps.length > 0) {
                console.log('Firebase is initialized:', apps[0].options)
            } else {
                console.log('Firebase is not initialized - no apps registered')
            }
        } catch (error) {
            console.error('Firebase initialization error:', error)
        }
    }, [])

    const onAUthCLicked = () => {
        try {
            const apps = firebase.apps
            if (apps.length > 0) {
                console.log('Firebase is initialized:', apps[0].options)
            } else {
                console.log('Firebase is not initialized - no apps registered')
            }
        } catch (error) {
            console.error('Firebase initialization error:', error)
        }
    }

    return (
        <View style={styles.container}>
            <Text>
                Auth Component
            </Text>
            <Pressable onPress={onAUthCLicked} style={styles.button}>
                <Text style={{color: 'white'}}>
                    Sign In
                </Text>
            </Pressable>
        </View>
    )
}

export default Auth

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button:{
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5
    }
    
})