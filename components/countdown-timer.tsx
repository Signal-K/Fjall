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
    } else {
      // For past events, show time since launch
      const pastDifference = Math.abs(difference);
      timeLeft = {
        D: Math.floor(pastDifference / (1000 * 60 * 60 * 24)),
        H: Math.floor((pastDifference / (1000 * 60 * 60)) % 24),
        M: Math.floor((pastDifference / 1000 / 60) % 60),
        S: Math.floor((pastDifference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isPast, setIsPast] = useState(+new Date(targetDate) < +new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      setIsPast(+new Date(targetDate) < +new Date());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.keys(timeLeft)
    .map(interval => {
      if (!timeLeft[interval] && interval !== 'S') return null; // Don't show 0 values except for seconds
      return (
        <View key={interval} style={styles.timeBlock}>
          <ThemedText style={styles.timeValue}>{String(timeLeft[interval]).padStart(2, '0')}</ThemedText>
          <ThemedText style={styles.timeInterval}>{interval}</ThemedText>
        </View>
      );
    })
    .filter(Boolean);

  if (timerComponents.length === 0) return null;

  return (
    <View style={styles.countdownContainer}>
      <ThemedText style={[styles.statusText, isPast && styles.pastText]}>
        {isPast ? 'T+' : 'T-'}
      </ThemedText>
      {timerComponents}
    </View>
  );
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
  },
  timeInterval: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00', // Green for future events
    marginRight: 10,
  },
  pastText: {
    color: '#ff6b6b', // Red for past events
  },
});

export default CountdownTimer;
