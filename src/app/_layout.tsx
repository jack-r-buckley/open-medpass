import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="onboarding/index" 
        options={{ 
          title: 'Welcome',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="prescription/add" 
        options={{ 
          title: 'Add Prescription',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="prescription/[id]" 
        options={{ 
          title: 'Prescription Details'
        }} 
      />
    </Stack>
  );
}

