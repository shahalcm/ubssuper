// src/components/maps/MapViewWrapper.web.tsx
// Web-safe implementation that replaces native react-native-maps fabric codegen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapViewProps {
  style?: any;
  initialRegion?: Region;
  region?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  children?: React.ReactNode;
  provider?: any;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  onPress?: (e: any) => void;
  [key: string]: any;
}

export interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  [key: string]: any;
}

export const Marker: React.FC<MarkerProps> = ({ children, onPress }) => {
  if (children) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }
  return null;
};

export interface PolylineProps {
  coordinates: Array<{ latitude: number; longitude: number }>;
  strokeColor?: string;
  strokeWidth?: number;
  [key: string]: any;
}

export const Polyline: React.FC<PolylineProps> = () => null;

const MapView = React.forwardRef<any, MapViewProps>((props, ref) => {
  const { style, initialRegion, region, children } = props;
  const targetRegion = region || initialRegion || { latitude: 12.9716, longitude: 77.5946 };
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Use Google Maps Embed iframe if API key exists, otherwise clean responsive map view
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${targetRegion.latitude},${targetRegion.longitude}&zoom=14`
    : `https://maps.google.com/maps?q=${targetRegion.latitude},${targetRegion.longitude}&z=14&output=embed`;

  React.useImperativeHandle(ref, () => ({
    animateToRegion: (_r: Region, _duration?: number) => {},
    animateCamera: () => {},
    fitToCoordinates: () => {},
  }));

  return (
    <View style={[styles.container, style]}>
      <iframe
        title="UBS Super Interactive Web Map"
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 16,
        }}
        loading="lazy"
        allowFullScreen
      />
      <View style={styles.overlayChildren} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
});

MapView.displayName = 'WebMapView';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  overlayChildren: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default MapView;
