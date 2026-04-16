'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { Match } from '@/lib/mock-data';
import { generatePredictions } from '@/lib/predictions';

interface NotificationBellProps {
  matches: Match[];
  locale: Locale;
}

export function NotificationBell({ matches, locale }: NotificationBellProps) {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
      const saved = localStorage.getItem('sinyal-notifications');
      if (saved === 'true' && Notification.permission === 'granted') {
        setEnabled(true);
      }
    }
  }, []);

  // Check for upcoming matches and send notifications
  useEffect(() => {
    if (!enabled) return;

    const checkMatches = () => {
      const now = new Date();

      for (const match of matches) {
        const [h, m] = match.kickoff.split(':').map(Number);
        const kickoff = new Date(now);
        kickoff.setHours(h, m, 0, 0);

        const diff = kickoff.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);

        // Notify 30 min before kickoff
        if (minutes >= 29 && minutes <= 31) {
          const notifKey = `sinyal-notif-${match.id}-30`;
          if (!localStorage.getItem(notifKey)) {
            let pred;
            try { pred = generatePredictions(match); } catch { continue; }

            new Notification(`⚽ ${match.homeTeam.name} vs ${match.awayTeam.name}`, {
              body: `30 dk sonra basliyor!\nTahmin: ${pred.mainPrediction.label} (%${pred.mainPrediction.confidence})`,
              icon: '/favicon.svg',
              tag: notifKey,
            });
            localStorage.setItem(notifKey, 'sent');
          }
        }

        // Notify at kickoff
        if (minutes >= -1 && minutes <= 1) {
          const notifKey = `sinyal-notif-${match.id}-start`;
          if (!localStorage.getItem(notifKey)) {
            new Notification(`🔴 MAC BASLADI!`, {
              body: `${match.homeTeam.name} vs ${match.awayTeam.name}\n${match.league}`,
              icon: '/favicon.svg',
              tag: notifKey,
            });
            localStorage.setItem(notifKey, 'sent');
          }
        }
      }
    };

    checkMatches();
    const interval = setInterval(checkMatches, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [enabled, matches]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert(locale === 'tr' ? 'Tarayiciniz bildirimleri desteklemiyor' : 'Your browser does not support notifications');
      return;
    }

    if (!enabled) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem('sinyal-notifications', 'true');
        new Notification('⚡ SINYAL', {
          body: locale === 'tr' ? 'Bildirimler aktif! Mac baslayinca haber verecegiz.' : 'Notifications enabled! We will notify you before matches.',
          icon: '/favicon.svg',
        });
      }
    } else {
      setEnabled(false);
      localStorage.setItem('sinyal-notifications', 'false');
    }
  };

  return (
    <button
      onClick={toggleNotifications}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
        enabled
          ? 'bg-accent/15 border-accent/30 text-accent'
          : 'bg-card border-border text-muted hover:border-accent/40'
      }`}
      title={enabled
        ? (locale === 'tr' ? 'Bildirimler Acik' : 'Notifications On')
        : (locale === 'tr' ? 'Bildirimleri Ac' : 'Enable Notifications')}
    >
      {enabled ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
    </button>
  );
}
