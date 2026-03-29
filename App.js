import React, { useState, useCallback, useEffect } from 'react';
import {
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
<<<<<<< HEAD
import { initNotifications, registerPushToken } from './src/services/notificationInit';
import { API_BASE } from './src/api/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

=======
import { initNotifications } from './src/services/notificationInit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  initAlarmNotifications,
  scheduleMedicationAlarmTriple,
  cancelMedicationAlarmTriple,
  rescheduleMedicationAlarmTriple,
} from './src/services/notificationAlarmService';

import {
  createPillSchedule,
  updatePillSchedule,
  deletePillSchedulesByPill,
} from './src/services/pillScheduleService';

>>>>>>> d87c7e9 (코드 수정)
/* styles */
import { styles } from './src/styles/commonStyles';

/* components */
import HomeFloatingButton from './src/components/HomeFloatingButton';
import { MedieChatView } from './src/components/MedieChatView';

/* screens */
import StartScreen from './src/screens/StartScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import MyPillScreen from './src/screens/MyPillScreen';
import MyPillDetailScreen from './src/screens/MyPillDetailScreen';
import MapScreen from './src/screens/MapScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SearchPillScreen from './src/screens/SearchPillScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import BoardScreen from './src/screens/BoardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WriteBoardScreen from './src/screens/WriteBoardScreen';
import SupportMainScreen from './src/screens/SupportMainScreen';
import SupportListScreen from './src/screens/SupportListScreen';
import SupportWriteScreen from './src/screens/SupportWriteScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import EditPostScreen from './src/screens/EditPostScreen';
import MedicationOnboardingScreen from './src/screens/MedicationOnboardingScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';

/* hooks */
import useCameraScan from './src/hooks/useCameraScan';
import usePharmacySearch from './src/hooks/usePharmacySearch';
import useBackHandler from './src/hooks/useBackHandler';
import useMyPills from './src/hooks/useMyPills';

const STORAGE_KEY = 'MY_PILLS_JSON';
const ONBOARDING_KEY = 'HAS_SEEN_MEDICATION_ONBOARDING';

<<<<<<< HEAD
=======
const HIDDEN_BOTTOM_BAR_MODES = [
  'LOGIN',
  'REGISTER',
  'MEDICATION_ONBOARDING',
  'SCAN',
  'START',
  'APP_INFO',
  'PROFILE_EDIT',
];

>>>>>>> d87c7e9 (코드 수정)
export default function App() {
  const insets = useSafeAreaInsets();

  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState('LOGIN');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

<<<<<<< HEAD



=======
>>>>>>> d87c7e9 (코드 수정)
  const [user, setUser] = useState({
    id: '',
    name: 'MEDI 사용자',
    email: '',
    profileImage: null,
    dogType: 'default',
  });

  const [selectedSupportPost, setSelectedSupportPost] = useState(null);
  const [writeBoardType, setWriteBoardType] = useState('free');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState('자유게시판');
  const [pillHistory, setPillHistory] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [voicePostDraft, setVoicePostDraft] = useState(null);
  const [selectedPill, setSelectedPill] = useState(null);
  const [hasSeenMedicationOnboarding, setHasSeenMedicationOnboarding] = useState(false);

<<<<<<< HEAD
  // 1. 알약 관련 훅 먼저 선언
=======
  const showBottomBar = !HIDDEN_BOTTOM_BAR_MODES.includes(appMode);

>>>>>>> d87c7e9 (코드 수정)
  const {
    myPills,
    saveMyPills,
    ensurePillSchedule,
    togglePillAlarm,
    changePillAlarmTime,
    deletePill,
  } = useMyPills({ STORAGE_KEY });

<<<<<<< HEAD
  // 2. [중요] registerPillFromAiResponse 정의 (훅 호출보다 위에 있어야 함)
=======
  const syncCreateSchedulesToServer = useCallback(
    async (pill, schedules) => {
      if (!user?.id) return schedules;

      const syncedSchedules = [...schedules];

      for (let i = 0; i < syncedSchedules.length; i += 1) {
        const schedule = syncedSchedules[i];
        try {
          const result = await createPillSchedule({
            userId: user.id,
            pillId: pill.id,
            pillName: pill.name,
            scheduleIndex: i,
            label: schedule.label || '',
            time: schedule.time,
            enabled: schedule.enabled ?? true,
          });

          syncedSchedules[i] = {
            ...schedule,
            serverScheduleId: result?.item?.id || null,
          };
        } catch (error) {
          console.error('❌ 서버 스케줄 생성 실패:', error);
        }
      }

      return syncedSchedules;
    },
    [user]
  );

>>>>>>> d87c7e9 (코드 수정)
  const registerPillFromAiResponse = useCallback(
    async (aiText) => {
      const responseText = typeof aiText === 'string' ? aiText : aiText?.rawText || '';

      const pillName =
        (typeof aiText === 'object' && aiText?.pillName) ||
        responseText
          .split('\n')
          .find((l) => l.includes('알약 이름'))
          ?.replace('💊 알약 이름: ', '') ||
        '알 수 없음';

<<<<<<< HEAD
      const initialSchedules = [
        { label: '아침', time: '08:00', notificationId: null, enabled: true, takenToday: false },
      ];

=======
      const pillId = Date.now().toString();

      let initialSchedules = [
        {
          label: '아침',
          time: '08:00',
          notificationIds: [],
          enabled: true,
          takenToday: false,
          serverScheduleId: null,
        },
      ];

      try {
        const notificationIds = await scheduleMedicationAlarmTriple({
          pillId,
          pillName,
          time: initialSchedules[0].time,
          scheduleIndex: 0,
        });

        initialSchedules[0] = {
          ...initialSchedules[0],
          notificationIds,
        };
      } catch (error) {
        console.error('❌ 초기 알람 예약 실패:', error);
      }

>>>>>>> d87c7e9 (코드 수정)
      const newPill = {
        id: pillId,
        name: pillName,
        usage: '',
        warning: '',
        confidence: '100',
        schedules: initialSchedules,
        alarmEnabled: true,
        notificationId: null,
        createdAt: Date.now(),
      };

<<<<<<< HEAD
      const updated = [newPill, ...(myPills ?? [])];
=======
>>>>>>> d87c7e9 (코드 수정)
      try {
        const syncedSchedules = await syncCreateSchedulesToServer(newPill, initialSchedules);

        const finalPill = {
          ...newPill,
          schedules: syncedSchedules,
        };

        const updated = [finalPill, ...(myPills ?? [])];
        await saveMyPills(updated);
      } catch (e) {
        console.error('❌ saveMyPills 실패', e);
      }

      setAppMode('MY_PILL');
    },
    [myPills, saveMyPills, syncCreateSchedulesToServer]
  );

<<<<<<< HEAD
  // 3. 카메라 스캔 훅 (위에서 정의한 함수 전달)
=======
>>>>>>> d87c7e9 (코드 수정)
  const {
    cameraRef,
    isAnalyzing,
    showResult,
    aiResponse,
    drugImageUrl,
    handleScan,
    handleRegisterPill,
    closeResult,
  } = useCameraScan({
    onRegisterPill: registerPillFromAiResponse,
  });

<<<<<<< HEAD
  // 4. 나머지 훅 및 핸들러
=======
>>>>>>> d87c7e9 (코드 수정)
  const {
    nearbyPharmacies,
    isSearchingMap,
    findNearbyPharmacies,
    openKakaoMapDetail,
    makePhoneCall,
  } = usePharmacySearch();

  const handleUpdateProfile = async (updatedData) => {
    const newUser = {
      ...user,
      name: updatedData.nickname,
      profileImage: updatedData.profileImage,
      dogType: updatedData.dogType,
    };
    setUser(newUser);
    await SecureStore.setItemAsync('userName', updatedData.nickname);
    if (updatedData.profileImage) {
      await AsyncStorage.setItem('userProfileImage', updatedData.profileImage);
    }
  };

  const handleOpenBoard = (post, boardTitle = '자유게시판') => {
    setSelectedPost(post);
    setSelectedBoardTitle(boardTitle);
    setAppMode('BOARD');
  };

  const handleBackToCommunity = () => {
    setAppMode('COMMUNITY');
  };

  const handleMedicationOnboardingDone = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      setHasSeenMedicationOnboarding(true);
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
    }
  };

  const completeNextDose = useCallback(async () => {
    const allSchedules = myPills.flatMap((pill) =>
      (pill.schedules || []).map((schedule, index) => ({
        ...schedule,
        pillId: pill.id,
        pillName: pill.name,
        scheduleIndex: index,
      }))
    );

    const next = allSchedules
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      .find((item) => !item.takenToday);

    if (!next) return;

    const updated = myPills.map((pill) => {
      if (pill.id !== next.pillId) return pill;
      return {
        ...pill,
        schedules: pill.schedules.map((s, i) =>
          i === next.scheduleIndex ? { ...s, takenToday: true } : s
        ),
      };
    });

    await saveMyPills(updated);
  }, [myPills, saveMyPills]);

  const toggleAllAlarms = useCallback(async (enabled) => {
    const updated = await Promise.all(
      myPills.map(async (pill) => {
        const nextSchedules = await Promise.all(
          (pill.schedules || []).map(async (schedule, index) => {
            if (enabled) {
              const newIds = await scheduleMedicationAlarmTriple({
                pillId: pill.id,
                pillName: pill.name,
                time: schedule.time || '08:00',
                scheduleIndex: index,
              });

              if (schedule.serverScheduleId && user?.id) {
                try {
                  await updatePillSchedule(schedule.serverScheduleId, user.id, {
                    enabled: true,
                  });
                } catch (error) {
                  console.error('전체 알람 ON 서버 동기화 실패:', error);
                }
              }

              return {
                ...schedule,
                enabled: true,
                notificationIds: newIds,
              };
            }

            await cancelMedicationAlarmTriple(schedule.notificationIds || []);

            if (schedule.serverScheduleId && user?.id) {
              try {
                await updatePillSchedule(schedule.serverScheduleId, user.id, {
                  enabled: false,
                });
              } catch (error) {
                console.error('전체 알람 OFF 서버 동기화 실패:', error);
              }
            }

            return {
              ...schedule,
              enabled: false,
              notificationIds: [],
            };
          })
        );

        return {
          ...pill,
          alarmEnabled: enabled,
          schedules: nextSchedules,
        };
      })
    );

    await saveMyPills(updated);
<<<<<<< HEAD
  }, [myPills, saveMyPills]);
=======
  }, [myPills, saveMyPills, user]);
>>>>>>> d87c7e9 (코드 수정)

  const deleteAllAlarms = useCallback(async () => {
    const updated = await Promise.all(
      myPills.map(async (pill) => {
        const nextSchedules = await Promise.all(
          (pill.schedules || []).map(async (s) => {
            await cancelMedicationAlarmTriple(s.notificationIds || []);

            if (s.serverScheduleId && user?.id) {
              try {
                await updatePillSchedule(s.serverScheduleId, user.id, {
                  enabled: false,
                });
              } catch (error) {
                console.error('전체 삭제 서버 동기화 실패:', error);
              }
            }

            return {
              ...s,
              notificationIds: [],
              enabled: false,
            };
          })
        );

        return {
          ...pill,
          alarmEnabled: false,
          schedules: nextSchedules,
        };
      })
    );

    await saveMyPills(updated);
<<<<<<< HEAD
  }, [myPills, saveMyPills]);
=======
  }, [myPills, saveMyPills, user]);
>>>>>>> d87c7e9 (코드 수정)

  const goAlarmFromPill = async (pillId) => {
    await ensurePillSchedule(pillId);
    setAppMode('ALARM');
  };

<<<<<<< HEAD
=======
  const togglePillAlarmAndReschedule = useCallback(
    async (pillId) => {
      const targetPill = myPills.find((pill) => pill.id === pillId);
      if (!targetPill) return;

      const nextEnabled = !targetPill.alarmEnabled;

      const updated = await Promise.all(
        myPills.map(async (pill) => {
          if (pill.id !== pillId) return pill;

          const nextSchedules = await Promise.all(
            (pill.schedules || []).map(async (schedule, index) => {
              if (nextEnabled) {
                const newIds = await scheduleMedicationAlarmTriple({
                  pillId: pill.id,
                  pillName: pill.name,
                  time: schedule.time || '08:00',
                  scheduleIndex: index,
                });

                if (schedule.serverScheduleId && user?.id) {
                  try {
                    await updatePillSchedule(schedule.serverScheduleId, user.id, {
                      enabled: true,
                    });
                  } catch (error) {
                    console.error('알람 ON 서버 동기화 실패:', error);
                  }
                }

                return {
                  ...schedule,
                  enabled: true,
                  notificationIds: newIds,
                };
              }

              await cancelMedicationAlarmTriple(schedule.notificationIds || []);

              if (schedule.serverScheduleId && user?.id) {
                try {
                  await updatePillSchedule(schedule.serverScheduleId, user.id, {
                    enabled: false,
                  });
                } catch (error) {
                  console.error('알람 OFF 서버 동기화 실패:', error);
                }
              }

              return {
                ...schedule,
                enabled: false,
                notificationIds: [],
              };
            })
          );

          return {
            ...pill,
            alarmEnabled: nextEnabled,
            schedules: nextSchedules,
          };
        })
      );

      await saveMyPills(updated);
    },
    [myPills, saveMyPills, user]
  );

  const changePillAlarmTimeAndReschedule = useCallback(
    async (pillId, nextTime) => {
      const updated = await Promise.all(
        myPills.map(async (pill) => {
          if (pill.id !== pillId) return pill;

          const nextSchedules = await Promise.all(
            (pill.schedules || []).map(async (schedule, index) => {
              let nextNotificationIds = schedule.notificationIds || [];

              if (pill.alarmEnabled) {
                nextNotificationIds = await rescheduleMedicationAlarmTriple({
                  oldNotificationIds: schedule.notificationIds || [],
                  pillId: pill.id,
                  pillName: pill.name,
                  time: nextTime,
                  scheduleIndex: index,
                });
              }

              if (schedule.serverScheduleId && user?.id) {
                try {
                  await updatePillSchedule(schedule.serverScheduleId, user.id, {
                    time: nextTime,
                    enabled: pill.alarmEnabled,
                  });
                } catch (error) {
                  console.error('시간 변경 서버 동기화 실패:', error);
                }
              }

              return {
                ...schedule,
                time: nextTime,
                notificationIds: nextNotificationIds,
                enabled: pill.alarmEnabled,
              };
            })
          );

          return {
            ...pill,
            schedules: nextSchedules,
          };
        })
      );

      await saveMyPills(updated);
    },
    [myPills, saveMyPills, user]
  );

  const deletePillAndCancelAlarm = useCallback(
    async (pillId) => {
      const targetPill = myPills.find((pill) => pill.id === pillId);
      if (!targetPill) return;

      for (const schedule of targetPill.schedules || []) {
        await cancelMedicationAlarmTriple(schedule.notificationIds || []);
      }

      if (user?.id) {
        try {
          await deletePillSchedulesByPill(pillId, user.id);
        } catch (error) {
          console.error('서버 pill schedule 삭제 실패:', error);
        }
      }

      await deletePill(pillId);
    },
    [myPills, deletePill, user]
  );

>>>>>>> d87c7e9 (코드 수정)
  useEffect(() => {
    const setup = async () => {
      try {
        setIsCheckingLogin(true);
        await initNotifications();
        await initAlarmNotifications();
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        const accessToken = await SecureStore.getItemAsync('accessToken');
        const userId = await SecureStore.getItemAsync('userId');
        const userName = await SecureStore.getItemAsync('userName');
        const userEmail = await SecureStore.getItemAsync('userEmail');
        const seenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);
        const savedProfileImg = await AsyncStorage.getItem('userProfileImage');

        setHasSeenMedicationOnboarding(seenOnboarding === 'true');

        if (accessToken && userId) {
          setIsLoggedIn(true);
          await registerPushToken(userId);
          setUser({
            id: userId,
            name: userName || 'MEDI 사용자',
            email: userEmail || '',
            profileImage: savedProfileImg || null,
            dogType: 'default',
          });
        } else {
          setIsLoggedIn(false);
          setAppMode('LOGIN');
        }
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        setIsLoggedIn(false);
        setAppMode('LOGIN');
      } finally {
        setIsCheckingLogin(false);
      }
    };

    setup();
  }, []);

  useBackHandler({ appMode, setAppMode, showResult });

  if (isCheckingLogin) {
    return (
      <SafeAreaView style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  if (!isStarted) {
    return (
      <StartScreen
        onStart={() => {
          setIsStarted(true);
          setAppMode(
            isLoggedIn
              ? hasSeenMedicationOnboarding
                ? 'HOME'
                : 'MEDICATION_ONBOARDING'
              : 'LOGIN'
          );
        }}
        user={isLoggedIn ? user : null}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#F7F3DD" barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={appStyles.flex}
        >
          {appMode === 'REGISTER' ? (
            <RegisterScreen
              setAppMode={setAppMode}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
            />
          ) : (
            <LoginScreen
              setAppMode={setAppMode}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#F7F3DD" barStyle="dark-content" />

      {appMode === 'HOME' && <HomeFloatingButton onPress={() => setAppMode('SCAN')} />}

<<<<<<< HEAD
      <View style={{ flex: 1 }}>
=======
      <View
        style={[
          appStyles.screenContainer,
          {
            paddingBottom: showBottomBar
              ? Platform.OS === 'ios'
                ? 70 + insets.bottom
                : 62 + Math.max(insets.bottom, 8)
              : 0,
          },
        ]}
      >
>>>>>>> d87c7e9 (코드 수정)
        {(() => {
          switch (appMode) {
            case 'HOME':
              return (
                <HomeScreen
                  setAppMode={setAppMode}
                  onPressMap={() => {
                    setAppMode('MAP');
                    findNearbyPharmacies();
                  }}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  myPills={myPills}
                  setIsLoggedIn={setIsLoggedIn}
                  setUser={setUser}
                />
              );

            case 'APP_INFO':
              return <AppInfoScreen setAppMode={setAppMode} />;

            case 'PROFILE_EDIT':
              return (
                <ProfileEditScreen
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onBack={() => setAppMode('MY_PAGE')}
                />
              );

            case 'MEDICATION_ONBOARDING':
              return (
                <MedicationOnboardingScreen
                  setAppMode={setAppMode}
                  onSelectYes={handleMedicationOnboardingDone}
                  onSelectNo={handleMedicationOnboardingDone}
                />
              );

            case 'SCAN':
              return (
                <ScanScreen
                  cameraRef={cameraRef}
                  isAnalyzing={isAnalyzing}
                  showResult={showResult}
                  aiResponse={aiResponse}
                  drugImageUrl={drugImageUrl}
                  onScan={handleScan}
                  onRegisterPill={handleRegisterPill}
                  onCloseResult={closeResult}
                  setAppMode={setAppMode}
                />
              );

            case 'MY_PILL':
              return (
                <MyPillScreen
                  setAppMode={setAppMode}
                  myPills={myPills}
                  onToggleAlarm={goAlarmFromPill}
                  onDeletePill={deletePillAndCancelAlarm}
                  selectedPill={selectedPill}
                  setSelectedPill={setSelectedPill}
                />
              );

            case 'MY_PILL_DETAIL':
              return (
                <MyPillDetailScreen
                  pill={selectedPill}
                  onToggleAlarm={goAlarmFromPill}
                  onDeletePill={deletePillAndCancelAlarm}
                  setAppMode={setAppMode}
                />
              );

            case 'MAP':
              return (
                <MapScreen
                  setAppMode={setAppMode}
                  nearbyPharmacies={nearbyPharmacies}
                  findNearbyPharmacies={findNearbyPharmacies}
                  isSearchingMap={isSearchingMap}
                  makePhoneCall={makePhoneCall}
                  openKakaoMapDetail={openKakaoMapDetail}
                />
              );

            case 'ALARM':
              return (
                <AlarmScreen
                  myPills={myPills}
                  setAppMode={setAppMode}
                  togglePillAlarm={togglePillAlarmAndReschedule}
                  changePillAlarmTime={changePillAlarmTimeAndReschedule}
                  deletePill={deletePillAndCancelAlarm}
                />
              );

            case 'HISTORY':
              return <HistoryScreen setAppMode={setAppMode} />;

            case 'SEARCH_PILL':
              return (
                <SearchPillScreen
                  setAppMode={setAppMode}
                  initialKeyword={searchKeyword}
                  onSearch={() => setSearchKeyword('')}
                />
              );

            case 'COMMUNITY':
              return (
                <CommunityScreen
                  setAppMode={setAppMode}
                  onOpenBoard={handleOpenBoard}
                  setWriteBoardType={setWriteBoardType}
                />
              );

            case 'BOARD':
              return (
                <BoardScreen
                  setAppMode={setAppMode}
                  post={selectedPost}
                  boardTitle={selectedBoardTitle}
                  onBack={handleBackToCommunity}
                />
              );

            case 'EDIT_POST':
              return <EditPostScreen setAppMode={setAppMode} post={selectedPost} />;

            case 'SUPPORT':
              return (
                <SupportMainScreen
                  setAppMode={setAppMode}
                  onOpenSupport={(item) => {
                    setSelectedSupportPost(item);
                    setAppMode('SUPPORT_DETAIL');
                  }}
                />
              );

            case 'SUPPORT_DETAIL':
              return (
                <SupportListScreen
                  post={selectedSupportPost}
                  onBack={() => setAppMode('SUPPORT')}
                  setAppMode={setAppMode}
                />
              );

            case 'SUPPORT_WRITE':
              return <SupportWriteScreen setAppMode={setAppMode} />;

            case 'MY_PAGE':
              return (
                <MyPageScreen
                  user={user}
                  myPills={myPills}
                  pillAlarms={myPills.flatMap((pill) => pill.schedules || [])}
                  onBack={() => setAppMode('HOME')}
                  onNavigate={(mode) => setAppMode(mode)}
                  onLogout={async () => {
                    await SecureStore.deleteItemAsync('accessToken');
                    setIsLoggedIn(false);
                    setAppMode('LOGIN');
                  }}
                />
              );

            case 'WRITE_BOARD':
              return (
                <WriteBoardScreen
                  setAppMode={setAppMode}
                  writeBoardType={writeBoardType}
                  voiceDraft={voicePostDraft}
                  onDraftUsed={() => setVoicePostDraft(null)}
                />
              );

            default:
              return (
                <HomeScreen
                  setAppMode={setAppMode}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  myPills={myPills}
                />
              );
          }
        })()}
      </View>

<<<<<<< HEAD
      {/* 하단바 디자인 고정 */}
      {!['LOGIN', 'REGISTER', 'MEDICATION_ONBOARDING', 'SCAN', 'START', 'APP_INFO', 'PROFILE_EDIT'].includes(appMode) && (
        <View style={appStyles.bottomBar}>
=======
      {showBottomBar && (
        <View
          style={[
            appStyles.bottomBar,
            {
              height:
                Platform.OS === 'ios'
                  ? 70 + insets.bottom
                  : 62 + Math.max(insets.bottom, 8),
              paddingBottom:
                Platform.OS === 'ios'
                  ? Math.max(insets.bottom, 10)
                  : Math.max(insets.bottom, 8),
            },
          ]}
        >
>>>>>>> d87c7e9 (코드 수정)
          <TouchableOpacity onPress={() => setAppMode('HOME')} style={appStyles.tabItem}>
            <Ionicons
              name="home"
              size={26}
              color={appMode === 'HOME' ? '#065809' : '#67A369'}
            />
            <Text
              style={[
                appStyles.tabText,
                { color: appMode === 'HOME' ? '#065809' : '#67A369' },
              ]}
            >
              홈
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAppMode('MAP')} style={appStyles.tabItem}>
            <Ionicons
              name="location"
              size={26}
              color={appMode === 'MAP' ? '#065809' : '#67A369'}
            />
            <Text
              style={[
                appStyles.tabText,
                { color: appMode === 'MAP' ? '#065809' : '#67A369' },
              ]}
            >
              약국
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAppMode('SEARCH_PILL')}
            style={appStyles.tabItem}
          >
            <Ionicons
              name="search"
              size={26}
              color={appMode === 'SEARCH_PILL' ? '#065809' : '#67A369'}
            />
            <Text
              style={[
                appStyles.tabText,
                { color: appMode === 'SEARCH_PILL' ? '#065809' : '#67A369' },
              ]}
            >
              검색
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAppMode('COMMUNITY')}
            style={appStyles.tabItem}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={26}
              color={appMode === 'COMMUNITY' ? '#065809' : '#67A369'}
            />
            <Text
              style={[
                appStyles.tabText,
                { color: appMode === 'COMMUNITY' ? '#065809' : '#67A369' },
              ]}
            >
              커뮤니티
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAppMode('MY_PAGE')} style={appStyles.tabItem}>
            <Ionicons
              name="person"
              size={26}
              color={appMode === 'MY_PAGE' ? '#065809' : '#67A369'}
            />
            <Text
              style={[
                appStyles.tabText,
                { color: appMode === 'MY_PAGE' ? '#065809' : '#67A369' },
              ]}
            >
              마이페이지
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <MedieChatView
        appMode={appMode}
        setAppMode={setAppMode}
        onCompleteNextDose={completeNextDose}
        onChangeAlarmTime={changePillAlarmTimeAndReschedule}
        onToggleAlarm={togglePillAlarmAndReschedule}
        onToggleAllAlarms={toggleAllAlarms}
        onDeleteAllAlarms={deleteAllAlarms}
        onSearchDrug={(keyword) => setSearchKeyword(keyword)}
        onWritePost={(draft) => setVoicePostDraft(draft)}
        myPills={myPills}
        pillHistory={pillHistory}
        onPillHistoryUpdate={(newHistory) => setPillHistory(newHistory)}
      />
    </SafeAreaView>
  );
}

const appStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
});