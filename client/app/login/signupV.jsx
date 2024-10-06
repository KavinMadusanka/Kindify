import React from 'react'
import { View, Text, Image, TextInput, Button, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function signupV() {

  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [Address, setAddress] = React.useState('')
  const [Contact, setContact] = React.useState('')
  const [ConfirmPass, setConfirmPass] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [message, setMessage] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("");
  const [errorfirstName, setErrorfirstName] = React.useState("");
  const [role, setRole] = React.useState(0)

  const handleConfirmPassChange = (passw) => {
    setConfirmPass(passw);
    if (password && passw) {
      setMessage(password === passw ? "Passwords match" : "Passwords do not match");
    } else {
      setMessage("");
    }
  };

  const onSignUpPress = async () => {
    console.log(emailAddress);
    console.log(password);
    console.log(firstName);
    console.log(Address);
    console.log(Contact);
    console.log(role);
    if (!isLoaded) {
      return
    }
    if (!emailAddress) {
      return setErrorMessage("Email is required.");
    }
    if (!firstName) {
      return setErrorfirstName("Name is required.");
    }

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        Address,
        Contact,
        role,
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
        router.replace('(tabs)/home')
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
    <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#C4DAD2" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30} // Adjust offset as needed
    >
    <ScrollView style={{ backgroundColor: "#C4DAD2", marginTop:50 }}>
      <View style={{
        backgroundColor:"#C4DAD2",
        height:"100%"
      }}>
        <View style={{
              alignItems: "center",
              width:'100%'
          }}>
              <Image source={require('./../../assets/images/Logo.png')}
                  style={{
                      width:200,
                      height:200,
                      marginTop:50,
                      // backgroundColor:'green'
                  }}
              />
          </View>
        {!pendingVerification && (
          // <View style={{
          //   alignItems: "center",
          // }}>
            <>
            <View style={{
              paddingTop:20,
              marginTop:30,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Name :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                      <TextInput
                        autoCapitalize="none"
                        value={firstName}
                        placeholder="Name..."
                        onChangeText={(firstName) => setFirstName(firstName)}
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                      />
              </View>
            </View>
            {errorfirstName ? (
              <Text style={{ color: "red", marginTop: 5, paddingLeft:30 }}>{errorfirstName}</Text>
            ) : null}
            <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Email :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                      <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        required={true}
                        placeholder="Email..."
                        onChangeText={(email) => setEmailAddress(email)}
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                      />
              </View>
            </View>
            {/* Error Message */}
            {errorMessage ? (
              <Text style={{ color: "red", marginTop: 5, paddingLeft:30 }}>{errorMessage}</Text>
            ) : null}
            <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Address :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                      <TextInput
                        autoCapitalize="none"
                        value={Address}
                        placeholder="Address..."
                        onChangeText={(address) => setAddress(address)}
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                      />
              </View>
            </View>
            <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Contact No :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                      <TextInput
                        autoCapitalize="none"
                        value={Contact}
                        placeholder="Contact No..."
                        keyboardType='numeric-pad'
                        onChangeText={(contact) => setContact(contact)}
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                      />
              </View>
            </View>
            <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Password :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
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
              </View>
              <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Confirm password :</Text>
            </View>
            <View style={{alignItems: "center",}}>
              <View style={{
                    padding:14,
                    marginTop:5,
                    backgroundColor:'#E9EFEC',
                    width:'90%',
                    color:"#16423C",
                    borderRadius:14}}>
                      <TextInput
                        autoCapitalize="none"
                        value={ConfirmPass}
                        secureTextEntry={true}
                        placeholder="Confirm password..."
                        onChangeText={handleConfirmPassChange}
                        style={{color:"#16423C"}}
                        placeholderTextColor="#16423C"
                      />
              </View>
            </View>
            {/* Validation Message */}
            {message ? (
              <Text style={{ color: password === ConfirmPass ? "green" : "red", paddingLeft: 30, marginTop: 5 }}>
                {message}
              </Text>
            ) : null}
            <View style={{alignItems:"center"}}>
              <TouchableOpacity style={{
                    padding:14,
                    marginTop:30,
                    backgroundColor:'#E9EFEC',
                    width:'40%',
                    color:"#16423C",
                    borderRadius:14}}
                    onPress={onSignUpPress}>
                <Text style={{color:"#16423C", textAlign:"center"}} >Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          // </View>
        )}
        {pendingVerification && (
          <>
          <View style={{
              marginTop:5,
              paddingLeft:15
              }}>
              <Text style={{
                  fontSize:20,
                  paddingLeft:15,
                  color:"#16423C"
                  }}>Verification Code :</Text>
          </View>
          <View style={{alignItems:"center"}} >
            <View style={{
              paddingTop:20,
              marginTop:30,
              padding:14,
              marginTop:5,
              backgroundColor:'#E9EFEC',
              width:'90%',
              color:"#16423C",
              borderRadius:14}}>
                <TextInput value={code} placeholder="Code..." onChangeText={(code) => setCode(code)} />
              </View>
              <View style={{
                    padding:4,
                    marginTop:30,
                    backgroundColor:'#E9EFEC',
                    width:'40%',
                    color:"#16423C",
                    borderRadius:14}}>
                <Button title="Verify Email" onPress={onPressVerify} color="#16423C" />
              </View>
            </View>
          </>
        )}
        <View style={{
                  fontSize:15,
                  paddingLeft:15,
                  marginTop:50,
                  marginBottom:80
                  }}>
              <Link href="/login">
                  <Text style={{fontFamily:'outfit-bold',color:"#16423C"}}>Already Have an account ? Click Here.</Text>
              </Link>
          </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}