import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GameTutorialScreen from '../screens/GameTutorialScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  GameTutorial: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: '#0f1020'},
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
        <Stack.Screen name="Login" component={LoginWrapper} />
        <Stack.Screen
          name="Home"
          component={HomeWrapper}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name="GameTutorial"
          component={GameTutorialWrapper}
          options={{animation: 'fade'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function OnboardingWrapper({navigation}: any) {
  return (
    <OnboardingScreen
      onComplete={() => navigation.replace('Login')}
    />
  );
}

function LoginWrapper({navigation}: any) {
  return (
    <LoginScreen
      onLogin={() => navigation.replace('Home')}
    />
  );
}

function HomeWrapper({navigation}: any) {
  return (
    <HomeScreen />
  );
}

function GameTutorialWrapper({navigation}: any) {
  return (
    <GameTutorialScreen
      onComplete={() => navigation.goBack()}
      onSkip={() => navigation.goBack()}
    />
  );
}
