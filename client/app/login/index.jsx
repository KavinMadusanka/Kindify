import { View, Text, Image, TextInput, Button, Pressable, ScrollView, KeyboardAvoidingView, Platform  } from 'react-native'
import { SignedIn, SignedOut, useUser, useAuth, useSignIn  } from '@clerk/clerk-expo';
import { Link, useRouter  } from 'expo-router'
import React from 'react';

export default function LoginScreen() {
    const { user } = useUser()

    const { isSignedIn } = useAuth()
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    if (isSignedIn) {
        return <Redirect href={'/'} />
    }

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
            await setActive({ session: signInAttempt.createdSessionId })
            router.replace('(tabs)/home')
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