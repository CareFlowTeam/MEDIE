// src/components/BackToMenuBtn.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/commonStyles';

export default function BackToMenuBtn({ onPress }) {
  return (
    <View style={styles.footerContainer}>

      <TouchableOpacity
        style={styles.backBtnBottom}
        onPress={onPress}
        activeOpacity={0.85}
      >
          <Text style={styles.backBtnTextBold}>‹</Text>
      </TouchableOpacity>
    </View>
  );
}