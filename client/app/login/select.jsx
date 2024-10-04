import React from 'react'
import { View, Text,  Image, Pressable } from 'react-native'
import { Link } from 'expo-router'

export default function select() {
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
                paddingLeft:15,
                }}>Registered As :</Text>
        </View>
        <View style={{
            paddingTop:10,
            alignItems: "center",
            }}>
            <Pressable style={{
                padding:14,
                backgroundColor:'gray',
                width:'90%',
                borderRadius:14
            }}>
                <Text style={{
                    fontSize:20,
                    textAlign:'center',
                }}>Volunteer</Text>
            </Pressable>
        </View>
        <View style={{
            paddingTop:10,
            alignItems: "center",
            }}>
            <Pressable style={{
                padding:14,
                backgroundColor:'gray',
                width:'90%',
                borderRadius:14
            }}>
                <Text style={{
                    fontSize:20,
                    textAlign:'center',
                }}>Organization</Text>
            </Pressable>
        </View>

        <View style={{
                fontSize:15,
                paddingLeft:15,
                marginTop:100,
                }}>
            <Link href="/login">
                <Text style={{fontFamily:'outfit-bold'}}>Already Have an account ? Click Here.</Text>
            </Link>
        </View>
    </View>
  )
}