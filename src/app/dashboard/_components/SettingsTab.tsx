import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";

interface Settings {
  enableRealtime: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const REFRESH_INTERVALS = [
  { value: 1000, label: "1 second" },
  { value: 2000, label: "2 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
];

const DEFAULT_SETTINGS: Settings = {
  enableRealtime: true,
  autoRefresh: true,
  refreshInterval: 5000, // 5 seconds
};

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [prevSettings, setPrevSettings] = useState<Settings | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("webhookLoggerSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setPrevSettings(parsedSettings);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!prevSettings) return;

    const hasChanged = Object.keys(settings).some(
      (key) =>
        settings[key as keyof Settings] !== prevSettings[key as keyof Settings]
    );

    if (hasChanged) {
      localStorage.setItem("webhookLoggerSettings", JSON.stringify(settings));
      toast.success("Settings saved", {
        description: "Your settings have been updated successfully",
      });
      setPrevSettings(settings);
    }
  }, [settings, prevSettings]);

  const handleSettingChange = (
    key: keyof Settings,
    value: boolean | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            Realtime Settings
          </CardTitle>
          <CardDescription>
            Configure how your webhook logs are updated in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-realtime">Enable Realtime Updates</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update logs when new webhooks are received
              </p>
            </div>
            <Switch
              id="enable-realtime"
              checked={settings.enableRealtime}
              onCheckedChange={(checked) =>
                handleSettingChange("enableRealtime", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Periodically refresh the logs even when no new webhooks are
                received
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) =>
                handleSettingChange("autoRefresh", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="refresh-interval">Refresh Interval</Label>
              <p className="text-sm text-muted-foreground">
                Time between automatic refreshes
              </p>
            </div>
            <Select
              value={settings.refreshInterval.toString()}
              onValueChange={(value) =>
                handleSettingChange("refreshInterval", parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_INTERVALS.map((interval) => (
                  <SelectItem
                    key={interval.value}
                    value={interval.value.toString()}
                  >
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
