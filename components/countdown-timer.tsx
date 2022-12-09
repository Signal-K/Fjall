import { ThemedText } from '@/components/themed-text';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        D: Math.floor(difference / (1000 * 60 * 60 * 24)),
        H: Math.floor((difference / (1000 * 60 * 60)) % 24),
        M: Math.floor((difference / 1000 / 60) % 60),
        S: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.keys(timeLeft)
    .map(interval => {
      if (timeLeft[interval] < 0) return null;
      return (
        <View key={interval} style={styles.timeBlock}>
          <ThemedText style={styles.timeValue}>{String(timeLeft[interval]).padStart(2, '0')}</ThemedText>
          <ThemedText style={styles.timeInterval}>{interval}</ThemedText>
        </View>
      );
    })
    .filter(Boolean);

  return timerComponents.length ? <View style={styles.countdownContainer}>{timerComponents}</View> : null;
};

const styles = StyleSheet.create({
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeInterval: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
});

export default CountdownTimer;
