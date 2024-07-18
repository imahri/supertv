import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function Timer({language, grey1, lang}) {

  const [date, setDate] = useState();

  useEffect(() => {
    let format = lang[language].time_format === 12 ? "h:mm A" : "HH:mm"
    setDate(dayjs().format(format));

    const interval = setInterval(() => {
      setDate(dayjs().format(format));
    }, 1000 * 1);

    return () => clearInterval(interval);
  }, []);
  return (
    <View accessible={false}>
      <Text accessible={false} style={[styles.timer, {color: `rgb(${grey1})`}]}>
        {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: "Inter-Bold",
    fontSize: 15,
  },
});
