import React, { useState } from 'react';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 1. 꼭 추가해야 하는 라이브러리!
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithKakao } from '../services/kakaoAuthService';
import { loginWithEmail } from '../services/authService';

export default function LoginScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 이메일 로그인 ---
  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('안내', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmail({
        email: email.trim(),
        password: password.trim(),
      });

      if (!result.success) {
        Alert.alert('로그인 실패', result.message);
        return;
      }

      // 📍 2. 토큰 저장 로직
      const token = result.data?.access_token || result.data?.token;
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        console.log('✅ 이메일 로그인 토큰 저장 완료');
      }

      setIsLoggedIn(true);
      setUser(result.data?.user || null);
      setAppMode('MEDICATION_ONBOARDING');

    } catch (e) {
      Alert.alert('로그인 실패', e?.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  // --- 카카오 로그인 ---
  async function handleKakaoLogin() {
    setLoading(true);
    try {
      const result = await loginWithKakao();

      if (!result.success) {
        Alert.alert('카카오 로그인 실패', result.message);
        return;
      }

      // 3. 카카오 토큰 저장 로직
      const token = result.data?.access_token || result.data?.token;
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        console.log('✅ 카카오 로그인 토큰 저장 완료');
      }

      setIsLoggedIn(true);
      setUser(result.data?.user || null);
      setAppMode('MEDICATION_ONBOARDING');

    } catch (e) {
      Alert.alert('카카오 로그인 실패', e?.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#E8F5E9', '#FFFDE7']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.inner}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setAppMode('REGISTER')}>
              <Text style={styles.link}>회원가입 하러가기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '처리 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleKakaoLogin}
              disabled={loading}
              style={styles.kakaoWrap}
            >
              <Image
                source={require('../../assets/kakaologin.png')}
                style={{ width: 87, height: 48 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAppMode('HOME')}>
              <Text style={styles.cancelLink}>취소</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#fff',
    color: '#222',
  },
  button: {
    height: 43,
    width: 87,
    borderRadius: 12,
    backgroundColor: '#67A369',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  kakaoWrap: {
    alignSelf: 'center',
    marginTop: 8,
  },
  link: {
    textAlign: 'center',
    color: '#000000',
    marginBottom: 6,
    fontWeight: '600',
  },
  cancelLink: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
    fontWeight: '500',
  },
});