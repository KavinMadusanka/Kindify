import React from 'react'
import { View, Text, TextInput, Button } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function signupV() {

  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded) {
      return
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }


  return (
    <View style={{
      backgroundColor:"#C4DAD2",
      height:"100%"
    }}>
      {!pendingVerification && (
        <View style={{
          marginTop:50,
          alignItems: "center",
        }}>
          <>
          <View style={{
                padding:14,
                marginTop:100,
                backgroundColor:'#E9EFEC',
                width:'90%',
                color:"#16423C",
                borderRadius:14}}>
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email..."
                    onChangeText={(email) => setEmailAddress(email)}
                    style={{color:"#16423C"}}
                    placeholderTextColor="#16423C"
                  />
          </View>
          <View style={{
                padding:14,
                marginTop:20,
                backgroundColor:'#E9EFEC',
                width:'90%',
                borderRadius:14}}>
                  <TextInput
                    value={password}
                    placeholder="Password..."
                    secureTextEntry={true}
                    placeholderTextColor="#16423C"
                    style={{color:"#16423C"}}
                    onChangeText={(password) => setPassword(password)}
                  />
          </View>
          <View style={{
                padding:4,
                marginTop:30,
                backgroundColor:'#E9EFEC',
                width:'90%',
                color:"#16423C",
                borderRadius:14}}>
            <Button title="Sign Up" onPress={onSignUpPress} />
            </View>
          </>
        </View>
      )}
      {pendingVerification && (
        <>
          <TextInput value={code} placeholder="Code..." onChangeText={(code) => setCode(code)} />
          <View style={{
                padding:4,
                marginTop:30,
                backgroundColor:'#E9EFEC',
                width:'90%',
                color:"#16423C",
                borderRadius:14}}>
          <Button title="Verify Email" onPress={onPressVerify} />
          </View>
        </>
      )}
    </View>
  )
}