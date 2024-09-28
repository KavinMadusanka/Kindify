import { Link } from "expo-router";
import { Text, View ,Image} from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"#C4DAD2",
      }}
    >
    <Link href={'(tabs)/home'}>
      <Text>Welcome</Text>
      {/* <Image source={require('../assets/images/logo.jpg')} /> */}
    </Link>

    </View>
  );
}