import { View, Text } from "react-native";
import React from "react";
import { Tabs } from 'expo-router'
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function OTabLayout() {
    return (
       <Tabs>
            <Tabs.Screen name='home'
             options={{
                title: 'Home',
                headerShown:true,
                tabBarIcon: ({color}) => <Entypo name="home" size={24} color="black" />
             }}/>
            <Tabs.Screen name='allAttendece'
             options={{
                title: 'Attendese',
                headerShown:true,
                tabBarIcon: ({color}) => <MaterialIcons name="analytics" size={24} color="black"  />
             }}
            />
            <Tabs.Screen name='createEvent'
             options={{
                title: 'CreateEvent',
                headerShown:true,
                tabBarIcon: ({color}) => <AntDesign name="pluscircle" size={24} color="black" />
             }}
            />
            <Tabs.Screen name='notification'
             options={{
                title: 'Notifications',
                headerShown:true,
                tabBarIcon: ({color}) => <Ionicons name="notifications" size={24} color="black" />
             }}
            />
            <Tabs.Screen name='profile'
             options={{
                title: 'Profile',
                headerShown:true,
                tabBarIcon: ({color}) => <FontAwesome name="user-circle-o" size={24} color="black" />
             }}
            />
       </Tabs>
    )
}