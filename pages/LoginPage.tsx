import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert, Pressable } from 'react-native'
import { storeUserData } from '../utils/storage';
import React from 'react'
import config from '../configs/API';

export const LoginScreen = ({navigation}:any) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(false);
  const [isOtp, setIsOtp] = React.useState(false);
  const [otp, setOtp] = React.useState('');

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    try {
      const res = await fetch(`${config.USER_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await res.json();
      if (res.ok) {
        const stored = await storeUserData(data);
          if (stored) {
            navigation.navigate('Home');
        }
      } else {
        Alert.alert('Error', data.error || 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    }
  }

  const handleSubmit = async () => {
    if (isLogin) {
      if (!phone) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      
      try {
        const res = await fetch(`${config.USER_API}/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone })
        });
        
        const data = await res.json();
        console.log(data);
        
        if (res.ok) {
          if(data.otpSent){
            setIsOtp(true);
          }else{
            await handleLogin();
          }
        } else {
          Alert.alert('Error', data.error || 'User not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to login');
      }
    } else {
      // Existing signup logic
      if (!name || !phone) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const userData = { name, phone };
      try {
        const res = await fetch(config.USER_API, {
          method:'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const savedData = await res.json();
        const stored = await storeUserData(savedData);
        if (stored) {
          navigation.navigate('Home');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save user data');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Image 
          source={require('../assets/Yash_aaradhey_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>{
          isOtp ? `An OTP has been sent to ${phone.substring(5,10).padStart(10,"X")}`:`Welcome,`  
          }</Text>
          {!isOtp && <Text style={styles.subtitle}>
            To Maharashtra's Most Trusted Counselling Platform
          </Text>}
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          )}

          {!isOtp && <TextInput
            style={[styles.input]}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />}

          {
            isOtp && <TextInput
            style={[styles.input, { fontSize: 24, paddingVertical: 10, letterSpacing:10 }] }
            placeholder="XXXXXX"
            value={otp}
            onChangeText={setOtp}
            keyboardType="phone-pad"
            />
          }

         {isOtp ? <TouchableOpacity
            onPress={handleLogin}
            style={styles.button}>
            <Text style={styles.buttonText}>
              {"Submit"}
            </Text>
          </TouchableOpacity>:
          <TouchableOpacity
          onPress={handleSubmit}
          style={styles.button}>
          <Text style={styles.buttonText}>
            {isLogin ? 'Login' : 'Get Started'}
          </Text>
        </TouchableOpacity>
          }

          <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </Text>
          </Pressable>

          
        </View>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our
        </Text>
        <View style={styles.termsLinksContainer}>
          <Text style={styles.termsLink}>Terms & Conditions</Text>
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50, // Offset to account for logo and better vertical centering
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  termsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  termsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  termsLinksContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  termsLink: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  toggleText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '500',
  },
})