import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, View } from "react-native";
import { WidgetPreview } from "react-native-android-widget";
import { Screen } from "src/components/ui/Screen";
import { $styles } from "src/theme/styles";
import Widget from "src/widgets/widgets";

export default function WidgetView() {
  const queryClient = useQueryClient();
  const { data: renderedWidget } = useQuery({
    queryKey: ["widget"],
    queryFn: async () => await new Widget("MatchHistory").render(),
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
  return (
    <Screen preset="fixed" contentContainerStyle={$styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          {renderedWidget && <WidgetPreview renderWidget={() => renderedWidget} width={320} height={200} />}
        </View>
        <Button title="Update" onPress={() => queryClient.refetchQueries({ queryKey: ["widget"] })} />
      </View>
    </Screen>
  );
}
