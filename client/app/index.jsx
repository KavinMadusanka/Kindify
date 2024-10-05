import { Link } from "expo-router";
import { Text, View ,Image, Pressable} from "react-native";
import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function Index() {

  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'(tabs)/home'} />
  }
  if (!isSignedIn) {
    return <Redirect href={'login/index'} />
  }


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"#C4DAD2",
      }}
    >
    <Link href={'(tabs)/home'}>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:40,
        color:"#16423C"
      }}>Welcome</Text>
      {/* <Image source={require('../assets/images/logo.jpg')} /> */}
    </Link>
      <Link href={'/login'}>
        <Text>Go To Login Screen</Text>
      </Link>
    </View>
  );
}