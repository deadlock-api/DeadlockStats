import ReactNativeTurnstile from "react-native-turnstile";
import { useAppTheme } from "src/theme/context";

interface TurnstileProps {
  onToken: (token: string) => void;
}

export const Turnstile = ({ onToken }: TurnstileProps) => {
  const { theme } = useAppTheme();
  return (
    <ReactNativeTurnstile
      sitekey="0x4AAAAAABs5lyUV9iomsdK2"
      onVerify={onToken}
      theme={theme.isDark ? "dark" : "light"}
      size="compact"
      style={{ marginLeft: "auto", marginRight: "auto", display: "none" }}
    />
  );
};
