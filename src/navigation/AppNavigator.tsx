import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GameTutorialScreen from '../screens/GameTutorialScreen';
import PlayerSelectionScreen from '../screens/PlayerSelectionScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  GameTutorial: undefined;
  PlayerSelection: undefined;
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
        <Stack.Screen
          name="PlayerSelection"
          component={PlayerSelectionWrapper}
          options={{animation: 'slide_from_right'}}
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

function HomeWrapper({navigation: _navigation}: any) {
  return (
    <HomeScreen />
  );
}

function GameTutorialWrapper({navigation}: any) {
  return (
    <GameTutorialScreen
      onComplete={() => navigation.navigate('PlayerSelection')}
      onSkip={() => navigation.navigate('PlayerSelection')}
    />
  );
}

function PlayerSelectionWrapper({navigation}: any) {
  return (
    <PlayerSelectionScreen
      onBack={() => navigation.goBack()}
      onContinue={(squadSize: number) => {
        // TODO: Navigate to actual game screen with squadSize
        console.log('Start game with', squadSize, 'players');
        navigation.goBack();
      }}
    />
  );
}
