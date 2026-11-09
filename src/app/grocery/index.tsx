// src/app/grocery/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

export default function GroceryIndexRedirect() {
  return <Redirect href="/(tabs)/grocery" />;
}
