"use client"

import ToggleButton from "@/components/toggle-button";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect, useState } from "react";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { handlePlaybackSetting } from "@/app/settings/player/actions";
import { settingsQueries } from "@/lib/queries/settings";

type TogglesProps = { 
    playerSettings: PlayerSettings
    syncPlayerSettings: GeneralSettings['syncPlayerSettings']
}

type PlaybackSetting = 'autoPlay' | 'autoNext' | 'autoSkip';

export default function PlaybackToggles({ playerSettings, syncPlayerSettings }: TogglesProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const autoPlay = usePlayerStore((state) => state.autoPlay)
    const setAutoPlay = usePlayerStore((state) => state.setAutoPlay)
    const autoNext = usePlayerStore((state) => state.autoNext)
    const setAutoNext = usePlayerStore((state) => state.setAutoNext)
    const autoSkip = usePlayerStore((state) => state.autoSkip)
    const setAutoSkip = usePlayerStore((state) => state.setAutoSkip)

    useEffect(() => {
        if (playerSettings) {
            setAutoPlay(playerSettings.autoPlay);
            setAutoNext(playerSettings.autoNext);
            setAutoSkip(playerSettings.autoSkip);
        }
    }, [playerSettings, setAutoPlay, setAutoNext, setAutoSkip]);

    const queryClient = useQueryClient()
    
    const updateSettingState = (setting: PlaybackSetting, value: boolean) => {
        if(setting === 'autoNext') setAutoNext(value)
        if(setting === 'autoPlay') setAutoPlay(value)
        if(setting === 'autoSkip') setAutoSkip(value)
    };

    const handleValueChange = async (setting: PlaybackSetting, value: boolean) => {
        updateSettingState(setting, value);
        
        let syncStrategy = syncPlayerSettings;
        
        if (syncStrategy === 'ask') {
          const { strategy, error } = await showSyncSettingsToast();
          
          if (error) {
            toast.error(error);
            updateSettingState(setting, !value);
            return;
          }
          
          if (!strategy) return;
          
          syncStrategy = strategy;
        }
        
        if (syncStrategy === 'always' || syncStrategy === 'ask') {
          try {
            setIsLoading(true);
            const { error, message } = await handlePlaybackSetting({
                settingName: setting,
                checked: value
            });
            
            if (error) {
              toast.error(error);
              updateSettingState(setting, !value);
              return;
            }
            
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: settingsQueries.general._def })          
          } finally {
            setIsLoading(false);
          }
        }
    };

    return (
        <div className="flex flex-row gap-2">
            <ToggleButton
                name="Auto Play"
                checked={autoPlay}
                onClick={() => handleValueChange('autoPlay', !autoPlay)}
                className="w-fit"
                disabled={isLoading}
                tooltip={
                    <div className="text-center">
                        Auto play episode <br />
                        <span className="font-bold text-red-500">Note: player will be muted by default</span>
                    </div>
                }
            />
    
            <ToggleButton
                name="Auto Next"
                checked={autoNext}
                onClick={() => handleValueChange('autoNext', !autoNext)}
                className="w-fit"
                disabled={isLoading}
                tooltip="Automatically go to the next episode after finishing"
            />
    
            <ToggleButton
                name="Auto Skip"
                checked={autoSkip}
                onClick={() => handleValueChange('autoSkip', !autoSkip)}
                className="w-fit"
                disabled={isLoading}
                tooltip="Automatically skip intros and outros"
            />
        </div>
    );
}