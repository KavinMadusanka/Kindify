import { View, Text, Button } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo';

export default function home() {
  const { signOut } = useAuth();  // Get the signOut method from Clerk

  const handleLogout = async () => {
    try {
      await signOut();  // Call the signOut method to log out
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <View>
      <Text>home</Text>
        <View>
          <Button title="Log Out" onPress={handleLogout} />
        </View>
    </View>
    
  )
}