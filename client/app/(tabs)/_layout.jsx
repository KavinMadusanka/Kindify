import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs>
        <Tabs.Screen name='home' 
        options={{
            title:'HomePage',
            headerShown:true,
            tabBarIcon:({color})=><Ionicons name="home" size={24} color="black" />
        }}/>
        <Tabs.Screen name='activities' 
        options={{
            title:'Activities',
            headerShown:true,
            tabBarIcon:({color})=><Ionicons name="bar-chart" size={24} color="black" />
        }}/>
        <Tabs.Screen name='calendar' 
        options={{
            title:'Calendar',
            headerShown:true,
            tabBarIcon:({color})=><Ionicons name="calendar" size={24} color="black" />
        }}/>
        <Tabs.Screen name='notification' 
        options={{
            title:'Notifications',
            headerShown:true,
            tabBarIcon:({color})=><Ionicons name="notifications" size={24} color="black" />
        }}/>
        <Tabs.Screen name='profile' 
        options={{
            title:'Profile',
            headerShown:true,
            tabBarIcon:({color})=><Ionicons name="person-circle" size={24} color="black" />
        }}/>
    </Tabs>
  )
}