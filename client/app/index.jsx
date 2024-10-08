import { Link, Redirect, Stack, useRouter } from "expo-router";
import { Text, View ,Image, Pressable} from "react-native";
import { useAuth,useUser } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';

export default function Index() {

  const [fontsLoaded] = useFonts({
    'Outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
  });

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

        <Text style={{
          fontFamily:'Outfit-Bold',
          fontSize:40,
          color:"#16423C"
        }}>Welcome</Text>
    </View>
  );
}