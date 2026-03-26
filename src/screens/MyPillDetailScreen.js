import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyPillDetailScreen({
  pill,
  onToggleAlarm,
  onDeletePill,
  setAppMode,
}) {
  const time = pill?.schedules?.[0]?.time ?? '08:00';

  if (!pill) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
          <Text style={{ textAlign: 'center', marginTop: 100 }}>
            선택된 알약이 없습니다
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setAppMode?.('MY_PILL')}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => setAppMode?.('SCAN')}
            activeOpacity={0.85}
          >
            <Text style={styles.scanBtnText}>💊 약 스캔</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>내 복용약</Text>

        <View style={styles.pillNameWrap}>
          <View style={styles.capsuleWrap}>
            <View style={[styles.capsuleHalf, styles.capsuleLeft]} />
            <View style={[styles.capsuleHalf, styles.capsuleRight]} />
            <View style={styles.capsuleLine} />
          </View>
          <Text style={styles.pillName}>{pill.name}</Text>
        </View>

        <View style={styles.cardShadowOuter}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI 분석결과</Text>

            <Text style={styles.smallLabel}>신뢰도 {pill.confidence}%</Text>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>복용 목적</Text>
              <Text style={styles.sectionTextGreen}>{pill.usage}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.warningTitle}>주의사항</Text>
              <Text style={styles.warningText}>{pill.warning}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>복약시간</Text>
              <Text style={styles.timeText}>매일 AM {time}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onToggleAlarm?.(pill.id)}
              style={styles.alarmRow}
            >
              <Text style={styles.alarmText}>⏰ 핸드폰 알람 설정하기 →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('삭제', '이 알약을 목록에서 제거할까요?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => onDeletePill?.(pill.id),
                  },
                ]);
              }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerDogWrap}>
          <Text style={styles.footerDog}>🐶</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backIcon: {
    fontSize: 34,
    color: '#6EAF71',
    lineHeight: 34,
    fontWeight: '300',
  },

  scanBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EEF6EC',
    borderWidth: 1,
    borderColor: '#B7D0B3',
    shadowColor: '#7EA57D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },

  scanBtnText: {
    color: '#4E8E51',
    fontSize: 16,
    fontWeight: '700',
  },

  screenTitle: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#176A20',
    letterSpacing: -0.3,
  },

  pillNameWrap: {
    marginTop: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  capsuleWrap: {
    width: 34,
    height: 20,
    marginRight: 10,
    transform: [{ rotate: '-28deg' }],
    position: 'relative',
  },

  capsuleHalf: {
    position: 'absolute',
    top: 0,
    width: 19,
    height: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D8C9AE',
  },

  capsuleLeft: {
    left: 0,
    backgroundColor: '#EFD7B7',
  },

  capsuleRight: {
    right: 0,
    backgroundColor: '#FFF7EC',
  },

  capsuleLine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -0.5,
    width: 1,
    height: 20,
    backgroundColor: '#D9C8A9',
    opacity: 0.8,
  },

  pillName: {
    fontSize: 24,
    fontWeight: '500',
    color: '#065809',
    letterSpacing: -0.4,
  },

  cardShadowOuter: {
    marginTop: 28,
    alignItems: 'center',
  },

  card: {
    width: '92%',
    borderRadius: 18,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 9,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1D',
    marginBottom: 10,
  },

  smallLabel: {
    fontSize: 15,
    color: '#065809',
    fontWeight: '400',
    marginBottom: 12,
  },

  sectionBlock: {
    marginTop: 6,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#121212',
    marginBottom: 4,
  },

  sectionTextGreen: {
    fontSize: 13,
    lineHeight: 18,
    color: '#065809',
    fontWeight: '400',
  },

  warningTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F02B2B',
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#065809',
    fontWeight: '400',
  },

  timeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#065809',
    fontWeight: '400',
  },

  alarmRow: {
    marginTop: 10,
    alignItems: 'center',
  },

  alarmText: {
    fontSize: 12.5,
    color: '#4A4A4A',
    fontWeight: '500',
  },

  deleteBtn: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  deleteBtnText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '700',
  },

  footerDogWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },

  footerDog: {
    fontSize: 52,
    opacity: 0.9,
  },
});