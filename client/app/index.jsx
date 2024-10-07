import { Link } from "expo-router";
import { Text, View ,Image, Pressable} from "react-native";
import { useAuth,useUser } from '@clerk/clerk-expo'
import { Redirect, Stack, useRouter  } from 'expo-router'
import { useEffect, useState } from 'react';

export default function Index() {

  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {

        // if (isSignedIn) {
        //   router.push('(tabs)/home');
        // }
        // if (!isSignedIn) {
          router.push('/login');
        // }
      }, 2000);
      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }, [isSignedIn, router]);




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
        // fontFamily:'outfit-bold',
        fontSize:40,
        color:"#16423C"
      }}>Welcome</Text>
      {/* <Image source={require('../assets/images/logo.jpg')} /> */}
    </Link>
      <Link href={'/login'}>
        <Text>Go To Login Screen</Text>
      </Link>

      <Link href={'(Otabs)/home'}>
      <Text style={{
        // fontFamily:'outfit-bold',
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