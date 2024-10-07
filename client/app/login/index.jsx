import { View, Text, Image, TextInput, Button, Pressable, ScrollView, KeyboardAvoidingView, Platform  } from 'react-native'
import { SignedIn, SignedOut, useUser, useAuth, useSignIn  } from '@clerk/clerk-expo';
import { Link, Redirect, useRouter  } from 'expo-router'
import React, { useEffect, useState } from 'react';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LoginScreen() {
    const { user } = useUser();
    const [userData, setUserData] = useState(null);
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const [loading, setLoading] = useState(true);

    const { isSignedIn } = useAuth()
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')


    useEffect(() => {
        const fetchUserData = async (email) => {
          try {
            // if (!emailAddress) {
            //   console.error('No email found for the logged-in user.');
            //   return;
            // }
    
            // Create a query to find the user by email
            const userQuery = query(
              collection(db, 'users'), // Replace 'users' with your collection name
              where('emailAddress', '==', email) // Adjust this based on your Firestore structure
            );
    
            const querySnapshot = await getDocs(userQuery);
    
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0].data();
              setUserData({ ...userDoc, id: querySnapshot.docs[0].id }); // Add document ID for updates
            } else {
              console.log('No such user document!');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        if (isSignedIn && userEmail) {
            fetchUserData(userEmail); // Fetch data for signed-in user
        }
    }, [userEmail, isSignedIn]);

    useEffect(() => {
        if (isSignedIn && !loading && userData) {
            console.log("userData: ", userData);
                if (userData.role === 0) {
                    if (!userData.category || userData.category.length === 0) {
                        router.replace('/login/selectCategory');
                    } else {
                        router.replace('/(tabs)/home');
                    }
                } else {
                    router.replace('/(Otabs)/home');
                }
        }
    }, [isSignedIn, userData, loading]);

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) {
          return
        }
    
        try {
          const signInAttempt = await signIn.create({
            identifier: emailAddress,
            password,
          })
    
          if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId });
            fetchUserData(emailAddress);
            // if(userData.role == 0){
            //     if(userData.category == null){
            //         router.replace('/login/selectCategory')
            //     }else{
            //         router.replace('/(tabs)/home')
            //     }
            // }
            // else{
            //     router.replace('/(Otabs)/home')
            // }
          } else {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err) {
          console.error(JSON.stringify(err, null, 2))
        }
      }, [isLoaded, emailAddress, password])

  return (
    <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#C4DAD2" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30} // Adjust offset as needed
    >
        <ScrollView style={{ backgroundColor: "#C4DAD2", marginTop:50}}>
    <View style={{
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor:"#C4DAD2",
    }}><View>
            <View style={{
                alignItems: "center",
                width:'100%'
            }}>
                <Image source={require('./../../assets/images/Logo.png')}
                    style={{
                        width:200,
                        height:200,
                        marginTop:50,
                    }}
                />
            </View>
            <View style={{
                paddingTop:20,
                marginTop:30,
                paddingLeft:15
                }}>
                <Text style={{
                    fontSize:20,
                    paddingLeft:15,
                    color:"#16423C"
                    }}>Email :</Text>
            </View>
            <View style={{
                paddingTop:10,
                alignItems:"center"
                }}>
                <View style={{
                    padding:14,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email..."
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                    />
                </View>
            </View>
            <View style={{
                paddingTop:20,
                // marginTop:50,
                paddingLeft:15
                }}>
                <Text style={{
                    fontSize:20,
                    paddingLeft:15,
                    color:"#16423C"
                    }}>Password :</Text>
            </View>
            <View style={{
                paddingTop:10,
                alignItems:"center"
                }}>
                <View style={{
                    padding:14,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                <TextInput
                    value={password}
                    placeholder="Password..."
                    style={{color:"#16423C"}}
                    placeholderTextColor="#16423C"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />
                </View>
                <View style={{
                    padding:4,
                    marginTop:40,
                    backgroundColor:'#E9EFEC',
                    width:'40%',
                    color:"#16423C",
                    borderRadius:14}}>
                    <Button title="Log in" onPress={onSignInPress} color="#16423C"/>
                </View>
            </View>
        </View>
        <View>
            {/* <SignedIn>
                <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
            </SignedIn> */}
            <SignedOut>
                <View style={{
                    fontSize:15,
                    paddingLeft:15,
                    marginTop:90,
                    marginBottom:80
                    
                    }}>
                        <Link href="/login/select">
                            <Text style={{fontFamily:'outfit-bold',color:"#16423C"}}>Create an Account ? Click Here.</Text>
                        </Link>
                </View>
                    
                {/* <Link href="/(auth)/sign-up">
                <Text>Sign Up</Text>
                </Link> */}
            </SignedOut>
        </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}