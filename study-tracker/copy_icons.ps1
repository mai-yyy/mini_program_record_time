$srcDir = [Environment]::GetFolderPath('UserProfile') + '\.gemini\antigravity\brain\74dc21c1-b3c6-4e9c-90b2-1dfe2d0351d6\'
$dstDir = 'd:\antigravity\mini program demo\study-tracker\miniprogram\images\'

Copy-Item -Path ($srcDir + 'record_icon_1773208850255.png') -Destination ($dstDir + 'record.png') -Force
Copy-Item -Path ($srcDir + 'record_active_icon_1773208863201.png') -Destination ($dstDir + 'record-active.png') -Force

Copy-Item -Path ($srcDir + 'history_icon_1773208874253.png') -Destination ($dstDir + 'history.png') -Force
Copy-Item -Path ($srcDir + 'history_active_icon_1773208891386.png') -Destination ($dstDir + 'history-active.png') -Force

Copy-Item -Path ($srcDir + 'profile_icon_1773208905730.png') -Destination ($dstDir + 'profile.png') -Force
Copy-Item -Path ($srcDir + 'profile_active_icon_1773208919988.png') -Destination ($dstDir + 'profile-active.png') -Force

Write-Host "Icons copied successfully!"
