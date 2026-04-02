import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ALARM_CHANNEL_ID = 'medication-alarm-channel';
const ALARM_SOUND_FILE = 'jihyun_voice.m4a';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initAlarmNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('알림 권한이 허용되지 않았습니다.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: '복약 알람',
      importance: Notifications.AndroidImportance.MAX,
      sound: ALARM_SOUND_FILE,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }
}

function parseTimeString(time = '08:00') {
  const [hour = '8', minute = '0'] = time.split(':');
  return {
    hour: Number(hour),
    minute: Number(minute),
  };
}

async function scheduleOneAlarm({
  identifierSuffix,
  title,
  body,
  hour,
  minute,
  second = 0,
}) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: ALARM_SOUND_FILE,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: Platform.select({
      ios: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        second,
      },
      android: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: ALARM_CHANNEL_ID,
        hour,
        minute,
        second,
      },
      default: null,
    }),
    identifier: identifierSuffix,
  });
}

export async function scheduleMedicationAlarmTriple({
  pillId,
  pillName,
  time,
}) {
  const { hour, minute } = parseTimeString(time);

  const title = '복약 시간이에요';
  const body = `${pillName} 복용할 시간입니다.`;

  const ids = [];

  // 1회차
  const id1 = await scheduleOneAlarm({
    identifierSuffix: `${pillId}-1`,
    title,
    body,
    hour,
    minute,
    second: 0,
  });
  ids.push(id1);

  // 2회차: +2초
  const id2 = await scheduleOneAlarm({
    identifierSuffix: `${pillId}-2`,
    title,
    body,
    hour,
    minute,
    second: 2,
  });
  ids.push(id2);

  // 3회차: +4초
  const id3 = await scheduleOneAlarm({
    identifierSuffix: `${pillId}-3`,
    title,
    body,
    hour,
    minute,
    second: 4,
  });
  ids.push(id3);

  return ids;
}

export async function cancelMedicationAlarmTriple(notificationIds = []) {
  for (const id of notificationIds) {
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

export async function rescheduleMedicationAlarmTriple({
  oldNotificationIds = [],
  pillId,
  pillName,
  time,
}) {
  await cancelMedicationAlarmTriple(oldNotificationIds);
  return scheduleMedicationAlarmTriple({
    pillId,
    pillName,
    time,
  });
}