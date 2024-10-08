import React from 'react'
import { View, Text,  Image, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { useFonts } from 'expo-font';

export default function select() {
    const [fontsLoaded] = useFonts({
        'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
        'Outfit-Regular':require('../../assets/fonts/Outfit-Regular.ttf'),
        'Outfit-Medium':require('../../assets/fonts/Outfit-Medium.ttf'),
      });
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
            marginTop:100,
            }}>
            <Text style={{
                fontSize:20,
                fontFamily:'Outfit-Medium',
                paddingLeft:15,
                color:"#16423C"
                }}>Registered As :</Text>
        </View>
        <View style={{
            paddingTop:10,
            alignItems: "center",
            }}>
            <Pressable style={{
                padding:14,
                backgroundColor:'#E9EFEC',
                width:'90%',
                borderRadius:14
            }}>
                <Link href="/login/signupV">
                    <Text style={{
                        fontSize:20,
                        fontFamily:'Outfit-Medium',
                        textAlign:'center',
                        color:"#16423C"
                    }}>Volunteer</Text>
                </Link>
            </Pressable>
        </View>
        <View style={{
            paddingTop:10,
            alignItems: "center",
            }}>
            <Pressable style={{
                padding:14,
                backgroundColor:'#E9EFEC',
                width:'90%',
                borderRadius:14
            }}>
                <Link href="/login/signupO">
                    <Text style={{
                        fontSize:20,
                        fontFamily:'Outfit-Medium',
                        textAlign:'center',
                        color:"#16423C"
                    }}>Organization</Text>
                </Link>
            </Pressable>
        </View>

        <View style={{
                fontSize:15,
                paddingLeft:15,
                marginTop:100,
                }}>
            <Link href="/login">
                <Text style={{fontFamily:'Outfit-Bold',color:"#16423C"}}>Already Have an account ? Click Here.</Text>
            </Link>
        </View>
    </View>
  )
}