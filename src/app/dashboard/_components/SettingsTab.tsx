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
import { Settings as SettingsIcon, Zap, Clock, Hand } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type UpdateMode = "realtime" | "periodic" | "manual";

interface Settings {
  refreshInterval: number;
  autoFollow: boolean;
  updateMode: UpdateMode;
}

const REFRESH_INTERVALS = [
  { value: 1000, label: "1 second" },
  { value: 2000, label: "2 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
];

const DEFAULT_SETTINGS: Settings = {
  refreshInterval: 5000, // 5 seconds
  autoFollow: true,
  updateMode: "realtime",
};

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [prevSettings, setPrevSettings] = useState<Settings | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("webhookLoggerSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Migrate old settings to new format if needed
        const migratedSettings = {
          updateMode:
            parsedSettings.updateMode ||
            (parsedSettings.enableRealtime
              ? "realtime"
              : parsedSettings.autoRefresh
              ? "periodic"
              : "manual"),
          refreshInterval: parsedSettings.refreshInterval || 5000,
          autoFollow:
            parsedSettings.autoFollow !== undefined
              ? parsedSettings.autoFollow
              : parsedSettings.autoRefresh || true,
        };

        // Migrate interval to periodic if needed
        if (migratedSettings.updateMode === "interval") {
          migratedSettings.updateMode = "periodic";
        }

        // Merge with default settings to handle new properties
        setSettings({ ...DEFAULT_SETTINGS, ...migratedSettings });
        setPrevSettings({ ...DEFAULT_SETTINGS, ...migratedSettings });
      } catch (e) {
        console.error("Error parsing settings", e);
        setSettings(DEFAULT_SETTINGS);
        setPrevSettings(DEFAULT_SETTINGS);
        localStorage.setItem(
          "webhookLoggerSettings",
          JSON.stringify(DEFAULT_SETTINGS)
        );
      }
    } else {
      // If no settings found in localStorage, save the default settings
      localStorage.setItem(
        "webhookLoggerSettings",
        JSON.stringify(DEFAULT_SETTINGS)
      );
      setPrevSettings(DEFAULT_SETTINGS);
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
    value: boolean | number | string
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
            Log Update Mode
          </CardTitle>
          <CardDescription>
            Choose how your webhook logs are updated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings.updateMode}
            onValueChange={(value) => handleSettingChange("updateMode", value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
              <RadioGroupItem value="realtime" id="update-realtime" />
              <Label
                htmlFor="update-realtime"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Realtime Updates</p>
                  <p className="text-sm text-slate-500">
                    Automatically update logs immediately when new webhooks
                    arrive
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
              <RadioGroupItem value="periodic" id="update-periodic" />
              <Label
                htmlFor="update-periodic"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium">Periodic Refresh</p>
                  <p className="text-sm text-slate-500">
                    Refresh logs at regular intervals (no realtime updates)
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
              <RadioGroupItem value="manual" id="update-manual" />
              <Label
                htmlFor="update-manual"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Hand className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="font-medium">Manual Updates Only</p>
                  <p className="text-sm text-slate-500">
                    Only update when you click the refresh button
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            Additional Settings
          </CardTitle>
          <CardDescription>
            Configure how your webhook logs behave
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-follow">Auto Follow Latest Logs</Label>
              <p className="text-sm text-muted-foreground">
                Automatically select and display the most recent log when it
                arrives
              </p>
            </div>
            <Switch
              id="auto-follow"
              checked={settings.autoFollow}
              onCheckedChange={(checked) =>
                handleSettingChange("autoFollow", checked)
              }
            />
          </div>

          <div
            className={`flex items-center justify-between ${
              settings.updateMode === "periodic" ? "" : "opacity-50"
            }`}
          >
            <div className="space-y-0.5">
              <Label htmlFor="refresh-interval">Refresh Interval</Label>
              <p className="text-sm text-muted-foreground">
                Time between automatic refreshes (for periodic refresh mode)
              </p>
            </div>
            <Select
              value={settings.refreshInterval.toString()}
              onValueChange={(value) =>
                handleSettingChange("refreshInterval", parseInt(value))
              }
              disabled={settings.updateMode !== "periodic"}
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
