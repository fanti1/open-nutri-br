import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Agenda e cancela lembretes (notificações locais do aparelho). Os serviços de
 * agenda e de tarefas dependem só desta interface — nos testes usa-se um falso.
 */
export interface ReminderScheduler {
  schedule(at: Date, title: string, body: string): Promise<string | null>;
  cancel(id: string): Promise<void>;
}

/** Notificações locais: funcionam sem internet e sem servidor. */
export const deviceReminderScheduler: ReminderScheduler = {
  async schedule(at, title, body) {
    if (Platform.OS === 'web' || at.getTime() <= Date.now()) return null;

    const permission = await Notifications.getPermissionsAsync();
    const granted = permission.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return null;

    return Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  },

  async cancel(id) {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(id);
  },
};

/** Mostra a notificação mesmo com o app aberto. */
export function configureForegroundNotifications(): void {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
