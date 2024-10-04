import { View, Text, Image, Pressable } from 'react-native'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router'
import React from 'react';

export default function LoginScreen() {
  return (
    <View style={{
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor:"#C4DAD2",
    }}>
        <View style={{
            alignItems: "center",
            width:'100%'
        }}>
            <Image source={require('./../../assets/images/Logo.png')}
                style={{
                    width:200,
                    height:200,
                    marginTop:150,
                }}
            />
        </View>
        <View style={{
            paddingTop:20,
            alignItems: "center",
            }}>
            <Pressable style={{
                padding:14,
                marginTop:100,
                backgroundColor:'gray',
                width:'90%',
                borderRadius:14
            }}>
                <Text style={{
                    fontSize:20,
                    textAlign:'center',
                }}>Get Started</Text>
            </Pressable>
        </View>
        <View>
            {/* <SignedIn>
                <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
            </SignedIn> */}
            <SignedOut>
                <View style={{
                    fontSize:15,
                    paddingLeft:15,
                    marginTop:150,
                    }}>
                        <Link href="/login/select">
                            <Text style={{fontFamily:'outfit-bold'}}>Create an Account ? Click Here.</Text>
                        </Link>
                </View>
                    
                {/* <Link href="/(auth)/sign-up">
                <Text>Sign Up</Text>
                </Link> */}
            </SignedOut>
        </View>
    </View>
  )
}